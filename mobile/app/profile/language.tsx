// app/profile/language.tsx - Language Selection Screen
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
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
import { SUPPORTED_LANGUAGES } from '../../src/i18n';

export default function LanguageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = React.useState('en');

  const handleSelectLanguage = (code: string) => {
    setSelectedLanguage(code);
    // In production, update i18n language
    // i18n.changeLanguage(code);
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0F' : '#F8F9FA' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#1A1A2E'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
          Language
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.description, { color: isDark ? '#888888' : '#666666' }]}>
          Select your preferred language for the app interface
        </Text>

        {SUPPORTED_LANGUAGES.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            onPress={() => handleSelectLanguage(lang.code)}
          >
            <Card style={[
              styles.languageCard,
              selectedLanguage === lang.code && styles.selectedCard
            ]}>
              <Text style={styles.flag}>{lang.flag}</Text>
              <View style={styles.languageInfo}>
                <Text style={[styles.languageName, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                  {lang.name}
                </Text>
                <Text style={styles.languageCode}>{lang.code.toUpperCase()}</Text>
              </View>
              {selectedLanguage === lang.code && (
                <Icon name="checkmark-circle" size={24} color={Colors.primary} />
              )}
            </Card>
          </TouchableOpacity>
        ))}

        <View style={{ height: insets.bottom + 100 }} />
      </ScrollView>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: { paddingHorizontal: Spacing.lg },
  description: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  flag: {
    fontSize: 28,
    marginRight: Spacing.md,
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '600',
  },
  languageCode: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
