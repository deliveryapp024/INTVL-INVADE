// MessagingService.ts - Real-time Chat System
import { supabase } from '../lib/supabase';
import { FeedbackService } from './FeedbackService';

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  title?: string;
  avatarUrl?: string;
  participantCount: number;
  lastMessageAt?: Date;
  lastMessagePreview?: string;
  unreadCount: number;
  participants: ConversationParticipant[];
}

export interface ConversationParticipant {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  role: 'admin' | 'member';
  isOnline?: boolean;
  lastReadAt?: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  contentType: 'text' | 'image' | 'activity_share' | 'route_share' | 'event_invite';
  mediaUrl?: string;
  metadata?: any;
  isEdited: boolean;
  replyToId?: string;
  replyToMessage?: Message;
  createdAt: Date;
  isMine: boolean;
}

class MessagingService {
  private static instance: MessagingService;
  private subscriptions: any[] = [];

  static getInstance(): MessagingService {
    if (!MessagingService.instance) {
      MessagingService.instance = new MessagingService();
    }
    return MessagingService.instance;
  }

  // ==========================================
  // CONVERSATIONS
  // ==========================================

  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('conversation_participants')
      .select(`
        conversation:conversations(
          id,
          type,
          title,
          avatar_url,
          participant_count,
          last_message_at,
          last_message_preview
        ),
        unread_count
      `)
      .eq('user_id', userId)
      .order('conversation.last_message_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }

    const conversations: Conversation[] = [];

    for (const item of data || []) {
      const conv = item.conversation;
      if (!conv) continue;

      // Get participants
      const { data: participants } = await supabase
        .from('conversation_participants')
        .select(`
          id,
          user:profiles(id, username, full_name, avatar_url),
          role,
          last_read_at
        `)
        .eq('conversation_id', conv.id);

      conversations.push({
        id: conv.id,
        type: conv.type,
        title: conv.title,
        avatarUrl: conv.avatar_url,
        participantCount: conv.participant_count,
        lastMessageAt: conv.last_message_at ? new Date(conv.last_message_at) : undefined,
        lastMessagePreview: conv.last_message_preview,
        unreadCount: item.unread_count || 0,
        participants: participants?.map((p: any) => ({
          id: p.id,
          userId: p.user.id,
          username: p.user.username,
          fullName: p.user.full_name,
          avatarUrl: p.user.avatar_url,
          role: p.role,
          lastReadAt: p.last_read_at ? new Date(p.last_read_at) : undefined,
        })) || [],
      });
    }

    return conversations;
  }

  async createDirectConversation(userId: string, otherUserId: string): Promise<string | null> {
    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversation_participants')
      .select('conversation_id')
      .eq('user_id', userId)
      .in('conversation_id', 
        supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', otherUserId)
      );

    if (existing && existing.length > 0) {
      return existing[0].conversation_id;
    }

    // Create new conversation
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({ type: 'direct', participant_count: 2 })
      .select()
      .single();

    if (error || !conversation) {
      console.error('Error creating conversation:', error);
      return null;
    }

    // Add participants
    await supabase.from('conversation_participants').insert([
      { conversation_id: conversation.id, user_id: userId, role: 'member' },
      { conversation_id: conversation.id, user_id: otherUserId, role: 'member' },
    ]);

    return conversation.id;
  }

  async createGroupConversation(
    creatorId: string,
    title: string,
    participantIds: string[],
    clubId?: string
  ): Promise<string | null> {
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        type: 'group',
        title,
        club_id: clubId,
        participant_count: participantIds.length + 1,
      })
      .select()
      .single();

    if (error || !conversation) {
      console.error('Error creating group conversation:', error);
      return null;
    }

    // Add all participants
    const participants = [
      { conversation_id: conversation.id, user_id: creatorId, role: 'admin' },
      ...participantIds.map(id => ({
        conversation_id: conversation.id,
        user_id: id,
        role: 'member' as const,
      })),
    ];

    await supabase.from('conversation_participants').insert(participants);

    return conversation.id;
  }

  // ==========================================
  // MESSAGES
  // ==========================================

  async getMessages(conversationId: string, limit: number = 50): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        id,
        sender:profiles(id, username, full_name, avatar_url),
        content,
        content_type,
        media_url,
        metadata,
        is_edited,
        reply_to_id,
        created_at
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }

    return (data || []).map((msg: any) => ({
      id: msg.id,
      conversationId,
      senderId: msg.sender.id,
      senderName: msg.sender.full_name || msg.sender.username,
      senderAvatar: msg.sender.avatar_url,
      content: msg.content,
      contentType: msg.content_type,
      mediaUrl: msg.media_url,
      metadata: msg.metadata,
      isEdited: msg.is_edited,
      replyToId: msg.reply_to_id,
      createdAt: new Date(msg.created_at),
      isMine: false, // Will be set by caller
    })).reverse();
  }

  async sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    contentType: Message['contentType'] = 'text',
    metadata?: any,
    replyToId?: string
  ): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        content_type: contentType,
        metadata,
        reply_to_id: replyToId,
      })
      .select(`
        id,
        sender:profiles(id, username, full_name, avatar_url),
        content,
        content_type,
        media_url,
        metadata,
        is_edited,
        reply_to_id,
        created_at
      `)
      .single();

    if (error || !data) {
      console.error('Error sending message:', error);
      return null;
    }

    // Update conversation last message
    await supabase
      .from('conversations')
      .update({
        last_message_at: new Date().toISOString(),
        last_message_preview: content.substring(0, 100),
      })
      .eq('id', conversationId);

    // Increment unread count for other participants
    await supabase.rpc('increment_unread_count', {
      p_conversation_id: conversationId,
      p_sender_id: senderId,
    });

    return {
      id: data.id,
      conversationId,
      senderId: data.sender.id,
      senderName: data.sender.full_name || data.sender.username,
      senderAvatar: data.sender.avatar_url,
      content: data.content,
      contentType: data.content_type,
      mediaUrl: data.media_url,
      metadata: data.metadata,
      isEdited: data.is_edited,
      replyToId: data.reply_to_id,
      createdAt: new Date(data.created_at),
      isMine: true,
    };
  }

  async editMessage(messageId: string, newContent: string): Promise<boolean> {
    const { error } = await supabase
      .from('messages')
      .update({
        content: newContent,
        is_edited: true,
        edited_at: new Date().toISOString(),
      })
      .eq('id', messageId);

    return !error;
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    return !error;
  }

  // ==========================================
  // REAL-TIME SUBSCRIPTIONS
  // ==========================================

  subscribeToMessages(
    conversationId: string,
    onMessage: (message: Message) => void
  ): () => void {
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        async (payload) => {
          const msg = payload.new as any;
          
          // Get sender info
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', msg.sender_id)
            .single();

          onMessage({
            id: msg.id,
            conversationId: msg.conversation_id,
            senderId: msg.sender_id,
            senderName: sender?.full_name || sender?.username || 'Unknown',
            senderAvatar: sender?.avatar_url,
            content: msg.content,
            contentType: msg.content_type,
            mediaUrl: msg.media_url,
            metadata: msg.metadata,
            isEdited: msg.is_edited,
            replyToId: msg.reply_to_id,
            createdAt: new Date(msg.created_at),
            isMine: false,
          });

          await FeedbackService.messageNotification();
        }
      )
      .subscribe();

    this.subscriptions.push(subscription);

    return () => {
      subscription.unsubscribe();
      this.subscriptions = this.subscriptions.filter(s => s !== subscription);
    };
  }

  // ==========================================
  // UNREAD MESSAGES
  // ==========================================

  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await supabase
      .from('conversation_participants')
      .update({
        last_read_at: new Date().toISOString(),
        unread_count: 0,
      })
      .eq('conversation_id', conversationId)
      .eq('user_id', userId);
  }

  async getUnreadCount(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('conversation_participants')
      .select('unread_count')
      .eq('user_id', userId);

    if (error) return 0;

    return (data || []).reduce((sum, item) => sum + (item.unread_count || 0), 0);
  }

  // ==========================================
  // UTILITIES
  // ==========================================

  async searchUsers(query: string, excludeUserId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
      .neq('id', excludeUserId)
      .limit(20);

    if (error) {
      console.error('Error searching users:', error);
      return [];
    }

    return data || [];
  }

  cleanup(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
    this.subscriptions = [];
  }
}

export const messagingService = MessagingService.getInstance();
