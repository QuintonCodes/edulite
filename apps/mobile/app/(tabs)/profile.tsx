import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { API_BASE } from '@/utils/constants';
import { getMimeType } from '@/utils/utils';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Profile() {
  const { user, isAuthenticated, updateUser } = useAuth();

  const [uploading, setUploading] = useState(false);

  // 📸 Pick and upload image
  async function handleAvatarUpload() {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Please allow access to your photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
        mediaTypes: ['images'],
      });

      if (result.canceled) return;

      const uri = result.assets[0].uri;
      const type = getMimeType(uri);

      setUploading(true);

      const formData = new FormData();
      formData.append('file', {
        uri,
        type,
        name: uri.split('/').pop(),
      } as any);
      formData.append('type', 'image');
      formData.append('userId', user?.id ?? '');
      formData.append('folder', 'avatars');

      const response = await axios.post(`${API_BASE}/media/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const imageUrl = response.data.media?.url;
      if (imageUrl) {
        updateUser({ avatarUrl: imageUrl });
        Alert.alert('Success', 'Your avatar has been updated!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert('Error', 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  }

  if (!isAuthenticated) {
    // Show a card prompting the user to log in if they are not authenticated
    return (
      <View style={styles.center}>
        <View style={styles.loginCard}>
          <Text style={styles.loginTitle}>You&apos;re not logged in</Text>
          <Text style={styles.loginSubtitle}>Log in to access your profile and track your progress.</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={28} color="#1976D2" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user?.avatarUrl || 'https://via.placeholder.com/120' }} style={styles.avatar} />
            <TouchableOpacity style={styles.avatarButton} onPress={handleAvatarUpload} disabled={uploading}>
              {uploading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Ionicons name="camera" size={20} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{user?.name || 'Guest User'}</Text>
            {user?.isVerified && (
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" style={{ marginLeft: 6 }} />
            )}
          </View>
          <Text style={styles.email}>{user?.email || 'Not Available'}</Text>
          {/* Role Badge */}
          <View style={[styles.badge, user?.role === 'admin' ? styles.adminBadge : styles.userBadge]}>
            <Text style={styles.badgeText}>
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Tutorials{'\n'}Completed</Text>
            <Text style={styles.statValue}>42</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Time Spent</Text>
            <Text style={styles.statValue}>18h 30m</Text>
          </View>
        </View>

        {/* Badges Card */}
        <View style={styles.badgesCard}>
          <Text style={styles.badgesLabel}>Badges Earned</Text>
          <Text style={styles.badgesValue}>8</Text>
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Achievements</Text>
          <View style={styles.achievementsGrid}>
            <View style={styles.achievementItem}>
              <View style={[styles.achievementCircle, { backgroundColor: '#FFC107' }]}>
                <Ionicons name="star-outline" size={32} color="#FFF" />
              </View>
              <Text style={styles.achievementLabel}>Master</Text>
            </View>
            <View style={styles.achievementItem}>
              <View style={[styles.achievementCircle, { backgroundColor: '#2196F3' }]}>
                <Ionicons name="school-outline" size={32} color="#FFF" />
              </View>
              <Text style={styles.achievementLabel}>Prodigy</Text>
            </View>
            <View style={styles.achievementItem}>
              <View style={[styles.achievementCircle, { backgroundColor: '#F44336' }]}>
                <Ionicons name="flame-outline" size={32} color="#FFF" />
              </View>
              <Text style={styles.achievementLabel}>7-Day{'\n'}Streak</Text>
            </View>
            <View style={styles.achievementItem}>
              <View style={[styles.achievementCircle, { backgroundColor: '#4CAF50' }]}>
                <Ionicons name="book-outline" size={32} color="#FFF" />
              </View>
              <Text style={styles.achievementLabel}>Reader</Text>
            </View>
          </View>
        </View>

        {/* Account Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Options</Text>
          <View style={styles.optionsCard}>
            <TouchableOpacity style={styles.optionItem} onPress={() => router.push('/edit-account')}>
              <View style={styles.optionLeft}>
                <MaterialIcons name="edit" size={24} color="#1976D2" />
                <Text style={styles.optionText}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9E9E9E" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionLeft}>
                <Ionicons name="notifications-outline" size={24} color="#1976D2" />
                <Text style={styles.optionText}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9E9E9E" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionLeft}>
                <Ionicons name="shield-outline" size={24} color="#1976D2" />
                <Text style={styles.optionText}>Privacy & Terms</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9E9E9E" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.optionItem}>
              <View style={styles.optionLeft}>
                <Ionicons name="log-out-outline" size={24} color="#F44336" />
                <Text style={[styles.optionText, { color: '#F44336' }]}>Logout</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    marginBottom: 35,
  },
  loginCard: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  loginTitle: {
    fontSize: 18,
    fontFamily: 'Poppins',
    color: '#111827',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_Regular',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: '#1976d2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
    marginBottom: 35,
  },
  scrollContent: {
    backgroundColor: '#f9fafb',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 20,
  },
  headerTitle: {
    color: '#1976d2',
    fontFamily: 'Poppins',
    fontSize: 24,
  },
  settingsButton: {
    padding: 4,
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5E6D3',
  },
  avatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1976D2',
    borderRadius: 20,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  name: {
    fontSize: 18,
    fontFamily: 'Poppins',
    color: '#111827',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    fontFamily: 'Poppins_Regular',
    color: '#6b7280',
    marginBottom: 16,
  },
  badge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins',
  },
  adminBadge: {
    backgroundColor: '#E53935', // red for admin
  },
  userBadge: {
    backgroundColor: '#2196F3', // blue for user
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 20,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Poppins_Regular',
    marginBottom: 12,
    lineHeight: 20,
  },
  statValue: {
    fontSize: 24,
    fontFamily: 'Poppins',
    color: '#111827',
  },
  badgesCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  badgesLabel: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'Poppins_Regular',
    marginBottom: 12,
  },
  badgesValue: {
    fontSize: 24,
    fontFamily: 'Poppins',
    color: '#111827',
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins',
    color: '#111827',
    marginBottom: 16,
  },
  achievementsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  achievementItem: {
    alignItems: 'center',
    width: 80,
  },
  achievementCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  achievementLabel: {
    fontSize: 12,
    color: '#111827',
    textAlign: 'center',
    fontFamily: 'Poppins_Regular',
  },
  optionsCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  optionText: {
    fontSize: 16,
    color: '#212121',
    fontFamily: 'Poppins_Regular',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  bottomSpacing: {
    height: 40,
  },
});
