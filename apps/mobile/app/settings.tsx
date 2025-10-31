import { useAuth } from '@/contexts/auth-context';
import { API_BASE } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Settings() {
  const { user, isAuthenticated, logout } = useAuth();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);

  async function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await axios.delete(`${API_BASE}/users/${user?.id}`);
              await logout();
              router.replace('/welcome');
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to delete account.');
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#4285F4" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.card}>
            {isAuthenticated ? (
              <>
                <SettingItem
                  icon="person-circle-outline"
                  label="Edit Account Details"
                  rightElement={<Ionicons name="chevron-forward" size={24} color="#999" />}
                  onPress={() => router.push('/edit-account')}
                />
                <View style={styles.divider} />
                <SettingItem
                  icon="mail-outline"
                  label="Email Preferences"
                  rightElement={<Ionicons name="chevron-forward" size={24} color="#999" />}
                  onPress={() => {}}
                />
                <View style={styles.divider} />
                <SettingItem
                  icon="trash-outline"
                  iconColor="#F44336"
                  iconBg="#FFEBEE"
                  label="Delete Account"
                  labelColor="#F44336"
                  rightElement={<Ionicons name="chevron-forward" size={24} color="#999" />}
                  onPress={handleDeleteAccount}
                />
              </>
            ) : (
              <View style={styles.guestPrompt}>
                <Text style={styles.guestPromptText}>
                  Log in to access account settings like changing your password or managing your preferences.
                </Text>
                <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
                  <Text style={styles.loginButtonText}>Log In</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Settings</Text>
          <View style={styles.card}>
            <SettingItem
              icon="notifications-outline"
              label="Push Notifications"
              rightElement={
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: '#D1D5DB', true: '#2196F3' }}
                  thumbColor="#fff"
                />
              }
            />
            <View style={styles.divider} />
            <SettingItem
              icon="mail-outline"
              label="Email Notifications"
              rightElement={
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  trackColor={{ false: '#D1D5DB', true: '#2196F3' }}
                  thumbColor="#fff"
                />
              }
            />
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.card}>
            <SettingItem
              icon="color-palette-outline"
              label="Theme"
              rightElement={
                <View style={styles.rightContent}>
                  <Text style={styles.rightText}>Light</Text>
                  <Ionicons name="chevron-forward" size={24} color="#999" />
                </View>
              }
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="globe-outline"
              label="Language"
              rightElement={
                <View style={styles.rightContent}>
                  <Text style={styles.rightText}>English</Text>
                  <Ionicons name="chevron-forward" size={24} color="#999" />
                </View>
              }
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="cloud-offline-outline"
              label="Offline Mode"
              rightElement={
                <Switch
                  value={offlineMode}
                  onValueChange={setOfflineMode}
                  trackColor={{ false: '#D1D5DB', true: '#2196F3' }}
                  thumbColor="#fff"
                />
              }
            />
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <SettingItem
              icon="shield-outline"
              label="Privacy Policy"
              rightElement={<Ionicons name="chevron-forward" size={24} color="#999" />}
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="document-text-outline"
              label="Terms of Service"
              rightElement={<Ionicons name="chevron-forward" size={24} color="#999" />}
              onPress={() => {}}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="information-circle-outline"
              label="App Version"
              rightElement={<Text style={styles.versionText}>1.0.0</Text>}
            />
          </View>
        </View>

        {/* <View style={styles.bottomSpacing} /> */}
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingItem({
  icon,
  iconColor = '#2196F3',
  iconBg = '#E3F2FD',
  label,
  labelColor = '#000',
  rightElement,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  label: string;
  labelColor?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={24} color={iconColor} />
        </View>
        <Text style={[styles.settingLabel, { color: labelColor }]}>{label}</Text>
      </View>
      {rightElement}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 20,
  },
  backButton: {
    marginRight: 12,
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 3,
    height: 38,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: 38,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: 'Poppins',
    color: '#1976D2',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins',
    color: '#111827',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: 'Poppins_Regular',
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 80,
  },
  guestPrompt: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestPromptText: {
    fontSize: 14,
    fontFamily: 'Poppins_Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 12,
  },
  loginButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rightText: {
    fontSize: 14,
    fontFamily: 'Poppins_Regular',
    color: '#999',
  },
  versionText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'Poppins_Regular',
  },
  // bottomSpacing: {
  //   height: 80,
  // },
});
