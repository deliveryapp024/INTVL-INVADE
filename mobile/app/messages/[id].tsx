// app/messages/[id].tsx - Chat/Conversation Screen
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../src/theme/Colors';
import { Spacing } from '../../src/theme/Spacing';
import { Icon } from '../../src/components/Icon';
import { useTheme } from '../../src/theme/ThemeContext';
import { FeedbackService } from '../../src/services/FeedbackService';

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'other';
  timestamp: string;
  senderName?: string;
}

const MOCK_MESSAGES: Message[] = [
  { id: '1', text: 'Hey! Are you joining the Sunday run?', sender: 'other', timestamp: '10:00 AM', senderName: 'Rahul' },
  { id: '2', text: 'Yes, definitely! What time?', sender: 'me', timestamp: '10:05 AM' },
  { id: '3', text: '6 AM at Marine Drive. Bring water!', sender: 'other', timestamp: '10:06 AM', senderName: 'Rahul' },
  { id: '4', text: 'Perfect, see you there! 💪', sender: 'me', timestamp: '10:08 AM' },
  { id: '5', text: 'Great run today! Your pace was amazing 🔥', sender: 'other', timestamp: '2:30 PM', senderName: 'Rahul' },
  { id: '6', text: 'Thanks! Couldn\'t have done it without the group motivation', sender: 'me', timestamp: '2:35 PM' },
];

export default function ChatScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const flatListRef = useRef<FlatList>(null);
  
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isOnline] = useState(true);

  useEffect(() => {
    // Scroll to bottom on load
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
    }, 100);
  }, []);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    
    await FeedbackService.buttonPress('light');
    
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputText.trim(),
      sender: 'me',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
    
    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender === 'me';
    
    return (
      <View style={[styles.messageRow, isMe && styles.myMessageRow]}>
        {!isMe && (
          <View style={styles.messageAvatar}>
            <Text style={styles.messageAvatarText}>R</Text>
          </View>
        )}
        <View style={[
          styles.messageBubble,
          isMe ? styles.myBubble : styles.otherBubble,
          { backgroundColor: isMe ? Colors.primary : (isDark ? '#2A2A3E' : '#F0F0F0') }
        ]}>
          {!isMe && item.senderName && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <Text style={[
            styles.messageText,
            { color: isMe ? '#FFFFFF' : (isDark ? '#FFFFFF' : '#1A1A2E') }
          ]}>
            {item.text}
          </Text>
          <Text style={[
            styles.messageTime,
            { color: isMe ? 'rgba(255,255,255,0.7)' : Colors.textMuted }
          ]}>
            {item.timestamp}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: isDark ? '#0A0A0F' : '#F8F9FA' }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#1A1A2E'} />
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
            Rahul Sharma
          </Text>
          <View style={styles.onlineRow}>
            {isOnline && <View style={styles.onlineDot} />}
            <Text style={styles.onlineText}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={styles.moreButton}>
          <Icon name="ellipsis-vertical" size={24} color={isDark ? '#FFFFFF' : '#1A1A2E'} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Bar */}
      <View style={[styles.inputBar, { paddingBottom: insets.bottom + Spacing.md }]}>
        <TouchableOpacity style={styles.attachButton}>
          <Icon name="add-circle" size={28} color={Colors.primary} />
        </TouchableOpacity>
        
        <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2A2A3E' : '#F0F0F0' }]}>
          <TextInput
            style={[styles.input, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}
            placeholder="Type a message..."
            placeholderTextColor={Colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Icon name="send" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  onlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  onlineText: {
    fontSize: 12,
    color: Colors.success,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '80%',
  },
  myMessageRow: {
    alignSelf: 'flex-end',
    flexDirection: 'row-reverse',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  messageAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  messageBubble: {
    borderRadius: 20,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    maxWidth: '100%',
  },
  myBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  attachButton: {
    marginRight: Spacing.sm,
  },
  inputContainer: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    maxHeight: 100,
  },
  input: {
    fontSize: 15,
    maxHeight: 80,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.textMuted,
  },
});
