import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { darkColors, lightColors } from '@/styles/theme';
import { authService } from '@/utils/apiService';

export default function Settings() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const styles = getStyles(colors);

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
              if (user?.id) {
                await authService.deleteAccount(user.id);
                await logout();
                router.replace('/welcome');
              } else {
                Alert.alert('Error', 'User ID not found.');
              }
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color={colors.accent} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>

        {/* Account Settings */}
        <View style={[styles.section, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.card}>
            {isAuthenticated ? (
              <>
                <SettingItem
                  icon="person-circle-outline"
                  label="Edit Account Details"
                  rightElement={<Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />}
                  onPress={() => router.push('/edit-account')}
                  colors={colors}
                />
                <View style={styles.divider} />
                <SettingItem
                  icon="trash-outline"
                  iconColor={colors.danger}
                  iconBg={colors.dangerBg}
                  label="Delete Account"
                  labelColor={colors.danger}
                  rightElement={<Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />}
                  onPress={handleDeleteAccount}
                  colors={colors}
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
                  trackColor={{ false: colors.switchTrack, true: colors.switchTrackActive }}
                  thumbColor={colors.switchThumb}
                />
              }
              colors={colors}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="mail-outline"
              label="Email Notifications"
              rightElement={
                <Switch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  trackColor={{ false: colors.switchTrack, true: colors.switchTrackActive }}
                  thumbColor={colors.switchThumb}
                />
              }
              colors={colors}
            />
          </View>
        </View>

        {/* App Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.card}>
            <SettingItem
              icon="color-palette-outline"
              label="Dark Mode"
              rightElement={
                <Switch
                  value={theme === 'dark'}
                  onValueChange={toggleTheme}
                  trackColor={{ false: colors.switchTrack, true: colors.switchTrackActive }}
                  thumbColor={colors.switchThumb}
                />
              }
              colors={colors}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="globe-outline"
              label="Language"
              rightElement={
                <View style={styles.rightContent}>
                  <Text style={styles.rightText}>English</Text>
                  <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                </View>
              }
              onPress={() => {}}
              colors={colors}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="cloud-offline-outline"
              label="Offline Mode"
              rightElement={
                <Switch
                  value={offlineMode}
                  onValueChange={setOfflineMode}
                  trackColor={{ false: colors.switchTrack, true: colors.switchTrackActive }}
                  thumbColor={colors.switchThumb}
                />
              }
              colors={colors}
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
              rightElement={<Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />}
              onPress={() => {}}
              colors={colors}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="document-text-outline"
              label="Terms of Service"
              rightElement={<Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />}
              onPress={() => {}}
              colors={colors}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="information-circle-outline"
              label="App Version"
              rightElement={<Text style={styles.versionText}>1.0.0</Text>}
              colors={colors}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function SettingItem({
  icon,
  iconColor,
  iconBg,
  label,
  labelColor,
  rightElement,
  onPress,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBg?: string;
  label: string;
  labelColor?: string;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  colors: typeof lightColors | typeof darkColors;
}) {
  const finalIconColor = iconColor || colors.accent;
  const finalIconBg = iconBg || colors.accentLight;
  const finalLabelColor = labelColor || colors.textPrimary;

  const styles = getStyles(colors);

  return (
    <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={!onPress}>
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: finalIconBg }]}>
          <Ionicons name={icon} size={24} color={finalIconColor} />
        </View>
        <Text style={[styles.settingLabel, { color: finalLabelColor }]}>{label}</Text>
      </View>
      {rightElement}
    </TouchableOpacity>
  );
}

const getStyles = (colors: typeof lightColors | typeof darkColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollView: {
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 20,
      fontFamily: 'Poppins',
      color: colors.textHeader,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Poppins',
      color: colors.textPrimary,
      marginBottom: 12,
      paddingHorizontal: 20,
    },
    card: {
      backgroundColor: colors.primary,
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
      backgroundColor: colors.border,
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
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 12,
    },
    loginButton: {
      backgroundColor: colors.accent,
      paddingHorizontal: 24,
      paddingVertical: 10,
      borderRadius: 8,
    },
    loginButtonText: {
      color: colors.primary,
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
      color: colors.textSecondary,
    },
    versionText: {
      fontSize: 16,
      color: colors.textSecondary,
      fontFamily: 'Poppins_Regular',
    },
  });
