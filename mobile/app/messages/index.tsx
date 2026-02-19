// app/messages/index.tsx - Inbox Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../src/theme/Colors';
import { Spacing } from '../../src/theme/Spacing';
import { Icon } from '../../src/components/Icon';
import { Card } from '../../src/components/Card';
import { useTheme } from '../../src/theme/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';

interface ChatPreview {
  id: string;
  name: string;
  avatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

const MOCK_CHATS: ChatPreview[] = [
  {
    id: '1',
    name: 'Rahul Sharma',
    lastMessage: 'Great run today! 🏃‍♂️',
    lastMessageTime: '2m ago',
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: '2',
    name: 'Mumbai Runners',
    lastMessage: 'Priya: Sunday run at 6 AM?',
    lastMessageTime: '1h ago',
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: '3',
    name: 'Priya Patel',
    lastMessage: 'Thanks for the route recommendation!',
    lastMessageTime: '3h ago',
    unreadCount: 1,
    isOnline: false,
  },
];

export default function MessagesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { user } = useAuth();
  const [chats] = useState<ChatPreview[]>(MOCK_CHATS);

  const renderChatItem = ({ item }: { item: ChatPreview }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => router.push(`/messages/${item.id}`)}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Icon name="person" size={28} color={Colors.primary} />
        </View>
        {item.isOnline && <View style={styles.onlineIndicator} />}
      </View>
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={[styles.chatName, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
            {item.name}
          </Text>
          <Text style={styles.chatTime}>{item.lastMessageTime}</Text>
        </View>
        <View style={styles.chatFooter}>
          <Text 
            style={[styles.lastMessage, { color: isDark ? '#CCCCCC' : '#666666' }]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0F' : '#F8F9FA' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
          Messages
        </Text>
        <TouchableOpacity style={styles.newChatButton}>
          <Icon name="create" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Icon name="chatbubbles" size={64} color={Colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
              No Messages Yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: isDark ? '#888888' : '#666666' }]}>
              Start a conversation with your running buddies!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
  },
  newChatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: { paddingHorizontal: Spacing.lg },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: Colors.success,
    borderWidth: 2,
    borderColor: Colors.surface,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '700',
  },
  chatTime: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadCount: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
