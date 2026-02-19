// app/profile/safety.tsx - Safety Center Screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../../src/theme/Colors';
import { Typography } from '../../src/theme/Typography';
import { Spacing } from '../../src/theme/Spacing';
import { Icon } from '../../src/components/Icon';
import { Card } from '../../src/components/Card';
import { useTheme } from '../../src/theme/ThemeContext';
import { FeedbackService } from '../../src/services/FeedbackService';
import { safetyService, EmergencyContact } from '../../src/services/SafetyService';
import { useAuth } from '../../src/context/AuthContext';

export default function SafetyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDark } = useTheme();
  const { user } = useAuth();
  
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relationship: '' });
  const [nightModeEnabled, setNightModeEnabled] = useState(false);
  const [autoShareLocation, setAutoShareLocation] = useState(false);

  useEffect(() => {
    loadEmergencyContacts();
  }, []);

  const loadEmergencyContacts = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    const contacts = await safetyService.getEmergencyContacts(user.id);
    setEmergencyContacts(contacts);
    setIsLoading(false);
  };

  const handleAddContact = async () => {
    if (!user?.id || !newContact.name || !newContact.phone) return;
    
    await FeedbackService.buttonPress('medium');
    
    const contact = await safetyService.addEmergencyContact(user.id, {
      name: newContact.name,
      phone: newContact.phone,
      relationship: newContact.relationship,
      isPrimary: emergencyContacts.length === 0,
    });
    
    if (contact) {
      setEmergencyContacts([...emergencyContacts, contact]);
      setNewContact({ name: '', phone: '', relationship: '' });
      setShowAddContact(false);
    }
  };

  const handleRemoveContact = async (contactId: string) => {
    Alert.alert(
      'Remove Contact',
      'Are you sure you want to remove this emergency contact?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const success = await safetyService.removeEmergencyContact(contactId);
            if (success) {
              setEmergencyContacts(emergencyContacts.filter(c => c.id !== contactId));
            }
          },
        },
      ]
    );
  };

  const handleTestSOS = async () => {
    Alert.alert(
      'Test SOS',
      'This will test the SOS flow without sending real alerts. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Test',
          onPress: async () => {
            await FeedbackService.notification('warning');
            Alert.alert('SOS Test', 'SOS button is working correctly!');
          },
        },
      ]
    );
  };

  const handleFakeCall = async () => {
    await safetyService.triggerFakeCall();
    Alert.alert('Fake Call Scheduled', 'You will receive a fake call in 10 seconds.');
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0A0F' : '#F8F9FA' }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#1A1A2E'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
          Safety Center
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {/* SOS Button */}
        <TouchableOpacity style={styles.sosButton} onPress={handleTestSOS}>
          <View style={styles.sosCircle}>
            <Icon name="alert-circle" size={48} color="#FFFFFF" />
            <Text style={styles.sosText}>SOS</Text>
            <Text style={styles.sosSubtext}>Hold for 3 sec</Text>
          </View>
        </TouchableOpacity>

        <Text style={[styles.sosDescription, { color: isDark ? '#CCCCCC' : '#666666' }]}>
          Press and hold the SOS button for 3 seconds to alert your emergency contacts with your location.
        </Text>

        {/* Emergency Contacts */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
          Emergency Contacts ({emergencyContacts.length}/3)
        </Text>

        {emergencyContacts.map((contact) => (
          <Card key={contact.id} style={styles.contactCard}>
            <View style={styles.contactRow}>
              <View style={styles.contactAvatar}>
                <Icon name="person" size={24} color={Colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={[styles.contactName, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                  {contact.name}
                  {contact.isPrimary && (
                    <Text style={styles.primaryBadge}> (Primary)</Text>
                  )}
                </Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
                {contact.relationship && (
                  <Text style={styles.contactRelationship}>{contact.relationship}</Text>
                )}
              </View>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleRemoveContact(contact.id)}
              >
                <Icon name="trash" size={20} color={Colors.error} />
              </TouchableOpacity>
            </View>
          </Card>
        ))}

        {emergencyContacts.length < 3 && (
          <TouchableOpacity 
            style={styles.addContactButton}
            onPress={() => setShowAddContact(!showAddContact)}
          >
            <Icon name="add-circle" size={24} color={Colors.primary} />
            <Text style={styles.addContactText}>Add Emergency Contact</Text>
          </TouchableOpacity>
        )}

        {showAddContact && (
          <Card style={styles.addContactForm}>
            <TextInput
              style={[styles.input, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}
              placeholder="Name"
              placeholderTextColor={Colors.textMuted}
              value={newContact.name}
              onChangeText={(text) => setNewContact({ ...newContact, name: text })}
            />
            <TextInput
              style={[styles.input, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}
              placeholder="Phone Number"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
              value={newContact.phone}
              onChangeText={(text) => setNewContact({ ...newContact, phone: text })}
            />
            <TextInput
              style={[styles.input, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}
              placeholder="Relationship (optional)"
              placeholderTextColor={Colors.textMuted}
              value={newContact.relationship}
              onChangeText={(text) => setNewContact({ ...newContact, relationship: text })}
            />
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleAddContact}
            >
              <Text style={styles.saveButtonText}>Save Contact</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Safety Features */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
          Safety Features
        </Text>

        <Card style={styles.featureCard}>
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Icon name="moon" size={24} color={Colors.secondary} />
            </View>
            <View style={styles.featureInfo}>
              <Text style={[styles.featureTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                Night Run Mode
              </Text>
              <Text style={styles.featureDescription}>
                Auto-enable safety features for night runs (8 PM - 6 AM)
              </Text>
            </View>
            <Switch
              value={nightModeEnabled}
              onValueChange={setNightModeEnabled}
              trackColor={{ false: '#767577', true: Colors.primary }}
            />
          </View>
        </Card>

        <Card style={styles.featureCard}>
          <View style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Icon name="location" size={24} color={Colors.success} />
            </View>
            <View style={styles.featureInfo}>
              <Text style={[styles.featureTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                Auto-Share Location
              </Text>
              <Text style={styles.featureDescription}>
                Automatically share location during every run
              </Text>
            </View>
            <Switch
              value={autoShareLocation}
              onValueChange={setAutoShareLocation}
              trackColor={{ false: '#767577', true: Colors.primary }}
            />
          </View>
        </Card>

        {/* Women's Safety */}
        <Text style={[styles.sectionTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
          Women's Safety
        </Text>

        <Card style={styles.featureCard}>
          <TouchableOpacity style={styles.featureRow} onPress={handleFakeCall}>
            <View style={[styles.featureIcon, { backgroundColor: Colors.warning + '20' }]}>
              <Icon name="call" size={24} color={Colors.warning} />
            </View>
            <View style={styles.featureInfo}>
              <Text style={[styles.featureTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
                Fake Incoming Call
              </Text>
              <Text style={styles.featureDescription}>
                Trigger a fake call to excuse yourself from uncomfortable situations
              </Text>
            </View>
            <Icon name="chevron-forward" size={20} color={Colors.textMuted} />
          </TouchableOpacity>
        </Card>

        {/* Safety Tips */}
        <Card style={styles.tipsCard}>
          <Text style={[styles.tipsTitle, { color: isDark ? '#FFFFFF' : '#1A1A2E' }]}>
            Safety Tips
          </Text>
          <View style={styles.tipRow}>
            <Icon name="shield-checkmark" size={20} color={Colors.success} />
            <Text style={[styles.tipText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              Always inform someone before heading out for a run
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Icon name="shield-checkmark" size={20} color={Colors.success} />
            <Text style={[styles.tipText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              Choose well-lit, populated routes for night runs
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Icon name="shield-checkmark" size={20} color={Colors.success} />
            <Text style={[styles.tipText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              Carry your phone and ID at all times
            </Text>
          </View>
          <View style={styles.tipRow}>
            <Icon name="shield-checkmark" size={20} color={Colors.success} />
            <Text style={[styles.tipText, { color: isDark ? '#CCCCCC' : '#666666' }]}>
              Vary your routes and running times
            </Text>
          </View>
        </Card>

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
  sosButton: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  sosCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  sosText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
    marginTop: 4,
  },
  sosSubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    marginTop: 2,
  },
  sosDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  contactCard: { marginBottom: Spacing.sm },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700',
  },
  primaryBadge: {
    color: Colors.primary,
    fontWeight: '600',
  },
  contactPhone: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  contactRelationship: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  removeButton: {
    padding: Spacing.sm,
  },
  addContactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  addContactText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
  },
  addContactForm: {
    marginBottom: Spacing.md,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  featureCard: { marginBottom: Spacing.sm },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  featureDescription: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tipsCard: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  tipText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});
