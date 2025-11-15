import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { useMyCourses } from '@/hooks/useMyCourses';
import { useUserAchievements } from '@/hooks/useUserAchievements';
import { Colors, darkColors, lightColors } from '@/styles/theme';
import { getMimeType } from '@/utils';
import { profileService } from '@/utils/apiService';
import { calculateLevel, getLevelProgress } from '@/utils/levelSystem';

export default function Profile() {
  const { user, isAuthenticated, updateUser, logout } = useAuth();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors; // Get color palette
  const styles = getStyles(colors);

  const { data: achievements, isLoading: achievementsLoading } = useUserAchievements(user?.id, user);
  const { data: courses, isLoading: coursesLoading } = useMyCourses(user?.id);

  const [uploading, setUploading] = useState(false);
  const [showAllAchievements, setShowAllAchievements] = useState(false);

  const userXP = user?.xp || 0;
  const levelData = calculateLevel(userXP);
  const progressData = getLevelProgress(userXP);

  const displayedAchievements = showAllAchievements ? achievements : achievements?.slice(0, 4);
  const hasMoreAchievements = achievements && achievements.length > 4;

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
      const { mimeType } = getMimeType(uri);

      setUploading(true);

      const formData = new FormData();
      formData.append('file', {
        uri,
        type: mimeType,
        name: uri.split('/').pop(),
      } as any);
      formData.append('type', 'image');
      formData.append('userId', user?.id ?? '');
      formData.append('folder', 'avatars');

      const response = await profileService.updateAvatar(formData);

      const imageUrl = response.avatarUrl;
      if (imageUrl) {
        updateUser({ avatarUrl: imageUrl });
        Toast.show({
          type: 'success',
          text1: 'Avatar Updated',
          text2: 'Your profile picture has been updated successfully.',
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      Toast.show({
        type: 'error',
        text1: 'Image Selection Failed',
        text2: 'There was an error selecting your image. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  }

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          Toast.show({
            type: 'success',
            text1: 'Logged Out',
            text2: 'You have been logged out successfully.',
          });
          setTimeout(() => {
            router.replace('/welcome');
          }, 500);
        },
      },
    ]);
  }

  function getRoleStyle(role?: string) {
    switch (role) {
      case 'admin':
        return { backgroundColor: colors.roleAdmin };
      case 'teacher':
        return { backgroundColor: colors.roleTeacher };
      default:
        return { backgroundColor: colors.roleStudent };
    }
  }

  function getRoleIcon(role?: string) {
    switch (role) {
      case 'admin':
        return 'shield-checkmark';
      case 'teacher':
        return 'school';
      default:
        return 'person';
    }
  }

  if (!isAuthenticated) {
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
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/settings')}>
            <Ionicons name="settings-outline" size={28} color={colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user?.avatarUrl || 'https://via.placeholder.com/120' }} style={styles.avatar} />
            <TouchableOpacity style={styles.avatarButton} onPress={handleAvatarUpload} disabled={uploading}>
              {uploading ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <Ionicons name="camera" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.userInfoContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{user?.name || 'Guest User'}</Text>
              {user?.isVerified && <Ionicons name="checkmark-circle" size={20} color={colors.success} />}
            </View>
            <Text style={styles.email}>{user?.email || 'Not Available'}</Text>

            {/* Role Badge */}
            <View style={styles.roleContainer}>
              <View style={[styles.roleBadge, getRoleStyle(user?.role)]}>
                <Ionicons name={getRoleIcon(user?.role)} size={14} color={colors.primary} />
                <Text style={styles.roleText}>
                  {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Student'}
                </Text>
              </View>
            </View>
          </View>

          {/* Level Info */}
          <View style={styles.levelContainer}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelTitle}>Level {levelData.level}</Text>
              <Text style={styles.levelSubtitle}>{levelData.title}</Text>
            </View>

            <View style={styles.xpContainer}>
              <View style={styles.xpHeader}>
                <Text style={styles.xpText}>
                  {progressData.currentLevelXP} / {progressData.xpForNextLevel} XP
                </Text>
                <Text style={styles.xpNextLevel}>Next Level</Text>
              </View>
              <View style={styles.xpBarBackground}>
                <View style={[styles.xpBarFill, { width: `${progressData.progressPercentage}%` }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{user?.coursesCompleted || 0}</Text>
            <Text style={styles.statLabel}>Courses</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userXP.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.streakRow}>
              <Text style={styles.statValue}>{user?.streak || 0}</Text>
              <Text style={styles.fireEmoji}>🔥</Text>
            </View>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Courses</Text>
          {coursesLoading ? (
            <ActivityIndicator color={colors.accent} style={{ marginVertical: 20 }} />
          ) : !courses || courses.length === 0 ? (
            <View style={styles.emptyStateCard}>
              <Text style={styles.emptyStateText}>No active courses.</Text>
              <Text style={styles.emptyStateSubtext}>Enroll in a course to see it here.</Text>
            </View>
          ) : (
            <View style={styles.coursesContainer}>
              {courses.map((course) => (
                <View key={course.id} style={styles.courseCard}>
                  <View style={styles.courseIconContainer}>
                    {/* You can map icons to subjects or use a default */}
                    <FontAwesome5 name="flask" size={24} color={colors.accent} />
                  </View>
                  <View style={styles.courseInfo}>
                    <Text style={styles.courseTitle}>{course.title}</Text>
                    <Text style={styles.courseSubtitle}>
                      {course.completedLessons} / {course.totalLessons} lessons
                    </Text>
                  </View>
                  <View style={styles.courseProgress}>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBarFill, { width: `${course.progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>{course.progress}%</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Achievements Section */}
        <View style={styles.section}>
          <View style={styles.achievementHeader}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Text style={styles.achievementCount}>
              {achievements?.filter((a) => a.earned).length || 0} / {achievements?.length || 0}
            </Text>
          </View>

          {achievementsLoading ? (
            <ActivityIndicator size="large" color={colors.accent} />
          ) : (
            <>
              <View style={styles.achievementsGrid}>
                {displayedAchievements?.map((achievement) => (
                  <TouchableOpacity
                    key={achievement.id}
                    style={styles.achievementItem}
                    onPress={() => {
                      Alert.alert(achievement.title, achievement.description);
                    }}
                  >
                    <View
                      style={[
                        styles.achievementCircle,
                        { backgroundColor: achievement.earned ? achievement.color : colors.border },
                      ]}
                    >
                      <Ionicons
                        name={achievement.icon}
                        size={32}
                        color={achievement.earned ? colors.primary : colors.textSecondary}
                      />
                    </View>
                    <Text style={styles.achievementLabel} numberOfLines={2}>
                      {achievement.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {hasMoreAchievements && (
                <TouchableOpacity
                  style={styles.viewMoreButton}
                  onPress={() => setShowAllAchievements(!showAllAchievements)}
                >
                  <Text style={styles.viewMoreText}>
                    {showAllAchievements ? 'View Less' : `View ${achievements.length - 4} More`}
                  </Text>
                  <Ionicons
                    name={showAllAchievements ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color={colors.accent}
                  />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>

        {/* Account Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Options</Text>
          <View style={styles.optionsCard}>
            <TouchableOpacity style={styles.optionItem} onPress={() => router.push('/edit-account')}>
              <View style={styles.optionLeft}>
                <MaterialIcons name="edit" size={24} color={colors.accent} />
                <Text style={styles.optionText}>Edit Profile</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.optionItem} onPress={() => router.push('/notifications')}>
              <View style={styles.optionLeft}>
                <Ionicons name="notifications-outline" size={24} color={colors.accent} />
                <Text style={styles.optionText}>Notifications</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.optionItem} onPress={handleLogout}>
              <View style={styles.optionLeft}>
                <Ionicons name="log-out-outline" size={24} color={colors.danger} />
                <Text style={[styles.optionText, { color: colors.danger }]}>Logout</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: Colors) =>
  StyleSheet.create({
    center: {
      alignItems: 'center',
      backgroundColor: colors.background,
      flex: 1,
      justifyContent: 'center',
    },
    loginCard: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 20,
      elevation: 3,
      marginHorizontal: 20,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    loginTitle: {
      color: colors.textPrimary,
      fontFamily: 'Poppins',
      fontSize: 18,
      marginBottom: 8,
    },
    loginSubtitle: {
      color: colors.textSecondary,
      fontFamily: 'Poppins_Regular',
      fontSize: 14,
      marginBottom: 16,
      textAlign: 'center',
    },
    loginButton: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingHorizontal: 24,
      paddingVertical: 12,
    },
    loginButtonText: {
      color: colors.textOnAccent,
      fontFamily: 'Poppins',
      fontSize: 16,
    },
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    scrollContent: {
      backgroundColor: colors.background,
    },
    header: {
      alignItems: 'center',
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 10,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    headerTitle: {
      color: colors.textHeader,
      fontFamily: 'Poppins',
      fontSize: 20,
    },
    settingsButton: {
      padding: 4,
    },
    profileCard: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 20,
      elevation: 3,
      marginHorizontal: 20,
      marginTop: 20,
      padding: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    avatarContainer: {
      alignSelf: 'center',
      marginBottom: 16,
    },
    avatar: {
      backgroundColor: colors.border,
      borderRadius: 50,
      height: 100,
      width: 100,
    },
    avatarButton: {
      backgroundColor: colors.accent,
      borderColor: colors.primary,
      borderRadius: 20,
      borderWidth: 3,
      bottom: 0,
      padding: 8,
      position: 'absolute',
      right: 0,
    },
    userInfoContainer: {
      alignItems: 'center',
      marginBottom: 20,
    },
    nameRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 6,
      marginBottom: 4,
    },
    name: {
      color: colors.textPrimary,
      fontFamily: 'Poppins',
      fontSize: 20,
    },
    email: {
      color: colors.textSecondary,
      fontFamily: 'Poppins_Regular',
      fontSize: 14,
      marginBottom: 12,
    },
    roleContainer: {
      alignItems: 'center',
      flexDirection: 'row',
    },
    roleBadge: {
      alignItems: 'center',
      borderRadius: 16,
      flexDirection: 'row',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    roleText: {
      color: colors.textOnAccent,
      fontFamily: 'Poppins',
      fontSize: 13,
    },
    levelContainer: {
      borderTopColor: colors.border,
      borderTopWidth: 1,
      paddingTop: 16,
      width: '100%',
    },
    levelHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    levelTitle: {
      color: colors.textPrimary,
      fontFamily: 'Poppins',
      fontSize: 16,
    },
    levelSubtitle: {
      color: colors.textSecondary,
      fontFamily: 'Poppins_Regular',
      fontSize: 13,
    },
    xpContainer: {
      width: '100%',
    },
    xpHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    xpText: {
      color: colors.textPrimary,
      fontFamily: 'Poppins',
      fontSize: 13,
    },
    xpNextLevel: {
      color: colors.accent,
      fontFamily: 'Poppins_Regular',
      fontSize: 13,
    },
    xpBarBackground: {
      backgroundColor: colors.border,
      borderRadius: 4,
      height: 8,
      overflow: 'hidden',
      width: '100%',
    },
    xpBarFill: {
      backgroundColor: colors.accent,
      borderRadius: 4,
      height: '100%',
    },
    statsRow: {
      flexDirection: 'row',
      gap: 12,
      marginHorizontal: 20,
      marginTop: 16,
    },
    statCard: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 16,
      elevation: 3,
      flex: 1,
      paddingVertical: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      fontFamily: 'Poppins_Regular',
      marginTop: 4,
    },
    statValue: {
      fontSize: 20,
      fontFamily: 'Poppins',
      color: colors.textPrimary,
    },
    streakRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 4,
    },
    fireEmoji: {
      fontSize: 20,
    },
    section: {
      marginTop: 28,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontFamily: 'Poppins',
      fontSize: 18,
      marginBottom: 16,
    },
    emptyStateCard: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    emptyStateText: {
      fontFamily: 'Poppins',
      fontSize: 16,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    emptyStateSubtext: {
      fontFamily: 'Poppins_Regular',
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    coursesContainer: {
      gap: 12,
    },
    courseCard: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 16,
      elevation: 3,
      flexDirection: 'row',
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    courseIconContainer: {
      alignItems: 'center',
      backgroundColor: colors.accentLight,
      borderRadius: 12,
      height: 56,
      justifyContent: 'center',
      marginRight: 12,
      width: 56,
    },
    courseInfo: {
      flex: 1,
    },
    courseTitle: {
      color: colors.textPrimary,
      fontFamily: 'Poppins',
      fontSize: 15,
      marginBottom: 4,
    },
    courseSubtitle: {
      color: colors.textSecondary,
      fontFamily: 'Poppins_Regular',
      fontSize: 13,
    },
    courseProgress: {
      alignItems: 'flex-end',
      marginLeft: 12,
    },
    progressBarContainer: {
      backgroundColor: colors.border,
      borderRadius: 3,
      height: 6,
      marginBottom: 4,
      overflow: 'hidden',
      width: 60,
    },
    progressBarFill: {
      backgroundColor: colors.accent,
      borderRadius: 3,
      height: '100%',
    },
    progressText: {
      color: colors.textPrimary,
      fontFamily: 'Poppins',
      fontSize: 12,
    },
    achievementHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    achievementCount: {
      color: colors.textPrimary,
      fontFamily: 'Poppins',
      fontSize: 14,
    },
    achievementsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      justifyContent: 'space-between',
    },
    achievementItem: {
      alignItems: 'center',
      width: '22%',
    },
    achievementCircle: {
      alignItems: 'center',
      borderRadius: 32,
      height: 64,
      justifyContent: 'center',
      marginBottom: 8,
      width: 64,
    },
    achievementLabel: {
      color: colors.textPrimary,
      fontFamily: 'Poppins_Regular',
      fontSize: 11,
      lineHeight: 14,
      textAlign: 'center',
    },
    viewMoreButton: {
      alignItems: 'center',
      borderRadius: 12,
      flexDirection: 'row',
      gap: 6,
      justifyContent: 'center',
      marginTop: 16,
      paddingVertical: 12,
      backgroundColor: colors.accentLight,
    },
    viewMoreText: {
      color: colors.accent,
      fontFamily: 'Poppins',
      fontSize: 14,
    },
    optionsCard: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
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
      fontSize: 15,
      color: colors.textPrimary,
      fontFamily: 'Poppins_Regular',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginHorizontal: 20,
    },
  });
