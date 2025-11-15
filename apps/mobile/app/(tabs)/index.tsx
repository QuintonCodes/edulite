import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { useTutorials } from '@/hooks/useTutorials';
import { Colors, darkColors, lightColors } from '@/styles/theme';
import { achievementData } from '@/utils/data';

export default function Home() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const styles = getStyles(colors);

  const [selectedSubject, setSelectedSubject] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const { user, isAuthenticated } = useAuth();
  const { data: tutorials, isLoading, isError, refetch } = useTutorials(selectedSubject);

  const subjects = [
    { label: 'All', icon: 'book', library: Ionicons, color: colors.accent },
    { label: 'Maths', icon: 'math-compass', library: MaterialCommunityIcons, color: colors.accent },
    { label: 'Science', icon: 'atom', library: MaterialCommunityIcons, color: '#8b5cf6' },
    { label: 'History', icon: 'landmark', library: FontAwesome5, color: '#ec4899' },
  ];

  // Color mappings for UI
  const difficultyColors = {
    Beginner: colors.success,
    Intermediate: colors.warning,
    Advanced: colors.danger,
  };

  const subjectColors = {
    Maths: colors.accent,
    Science: '#8B5CF6',
    History: '#EC4899',
  };

  async function onRefresh() {
    setRefreshing(true);
    try {
      refetch();
    } finally {
      setRefreshing(false);
    }
  }

  function toggleNotifications() {
    setNotificationsEnabled(!notificationsEnabled);
  }

  // Header component
  const ListHeaderComponent = () => (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle} ellipsizeMode="tail" numberOfLines={1}>
            {isAuthenticated ? `Welcome Back, ${user?.name}!` : 'Welcome to Edulite!'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {isAuthenticated
              ? 'Continue your learning journey with personalized content.'
              : 'Sign up or log in to unlock exclusive features.'}
          </Text>
        </View>

        <TouchableOpacity style={styles.notificationButton} onPress={toggleNotifications} activeOpacity={0.8}>
          <Ionicons
            name={notificationsEnabled ? 'notifications' : 'notifications-off'}
            size={28}
            color={notificationsEnabled ? colors.accent : colors.textSecondary}
          />
          {notificationsEnabled && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Subject Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Browse by Subject</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterButtons}>
            {subjects.map(({ label, icon, library: IconComp, color }) => (
              <TouchableOpacity
                key={label}
                style={[styles.filterButton, selectedSubject === label && styles.filterButtonActive]}
                onPress={() => setSelectedSubject(label)}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <IconComp name={icon} size={16} color={selectedSubject === label ? '#fff' : color} />
                  <Text style={[styles.filterButtonText, selectedSubject === label && styles.filterButtonTextActive]}>
                    {label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Section Header */}
      {!isLoading && !isError && tutorials && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Tutorials</Text>
          <Text style={styles.tutorialCount}>{tutorials.length} tutorials available</Text>
        </View>
      )}
    </>
  );

  // Footer component
  const ListFooterComponent = () => (
    <>
      {/* Achievements Section */}
      {isAuthenticated ? (
        <View style={styles.achievementsSection}>
          <Text style={styles.achievementsTitle}>Achievements</Text>
          <Text style={styles.achievementsSubtitle}>
            {achievementData.filter((a) => a.earned).length} of {achievementData.length} earned
          </Text>
          <View style={styles.achievementsList}>
            {achievementData.map((achievement) => {
              const { icon } = achievement;
              const IconComponent =
                icon.library === 'Ionicons'
                  ? Ionicons
                  : icon.library === 'FontAwesome5'
                    ? FontAwesome5
                    : MaterialCommunityIcons;

              return (
                <View
                  key={achievement.id}
                  style={[styles.achievementCard, !achievement.earned && styles.achievementCardLocked]}
                >
                  <IconComponent name={icon.name as any} size={24} color={icon.color} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.achievementTitle, !achievement.earned && styles.achievementTitleLocked]}>
                      {achievement.title}
                    </Text>
                    <Text style={styles.achievementSubtitle}>{achievement.subtitle}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      ) : (
        <View style={styles.guestPrompt}>
          <Text style={styles.guestPromptText}>Log in to track your achievements and unlock exclusive rewards!</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Progress Stats */}
      {isAuthenticated && (
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            {[
              { label: 'Tutorials Completed', value: '12' },
              { label: 'Hours Learned', value: '8.5h' },
              { label: 'Current Streak', value: '5 days' },
              { label: 'Average Score', value: '87%' },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={styles.statValue}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <View style={{ height: 80 }} />
    </>
  );

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <FlatList
          data={[]}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.accent} />
              <Text style={styles.loadingText}>Loading tutorials...</Text>
            </View>
          }
          renderItem={null}
          contentContainerStyle={styles.flatListContent}
        />
      </SafeAreaView>
    );
  }

  // Error state
  if (isError || !tutorials) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <FlatList
          data={[]}
          ListHeaderComponent={ListHeaderComponent}
          ListFooterComponent={ListFooterComponent}
          ListEmptyComponent={
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load tutorials. Please retry.</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={null}
          contentContainerStyle={styles.flatListContent}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        data={tutorials}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        renderItem={({ item: tutorial }) => (
          <TouchableOpacity
            style={styles.tutorialCard}
            onPress={() => router.push(`/tutorial/${tutorial.id}`)}
            activeOpacity={0.9}
          >
            <Image source={{ uri: tutorial.image }} style={styles.tutorialImage} />
            <View style={{ padding: 14 }}>
              <View style={styles.tutorialTags}>
                <View style={[styles.subjectTag, { backgroundColor: subjectColors[tutorial.subject] }]}>
                  <Text style={styles.tagText}>{tutorial.subject}</Text>
                </View>
                <View style={[styles.difficultyTag, { backgroundColor: difficultyColors[tutorial.difficulty] }]}>
                  <Text style={styles.tagText}>{tutorial.difficulty}</Text>
                </View>
              </View>
              <Text style={styles.tutorialTitle}>{tutorial.title}</Text>
              <View style={styles.tutorialMeta}>
                <View style={styles.tutorialMetaItem}>
                  <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.tutorialInstructor}>{tutorial.instructor}</Text>
                </View>
                <View style={styles.tutorialMetaItem}>
                  <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.tutorialDuration}>{tutorial.duration}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    flatListContent: {
      backgroundColor: colors.background,
      paddingHorizontal: 20,
      gap: 16,
    },
    header: {
      alignItems: 'center',
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 20,
      paddingHorizontal: 16,
      paddingTop: 30,
      marginHorizontal: -20,
    },
    headerTextContainer: {
      flex: 1,
      justifyContent: 'center',
      paddingRight: 8,
    },
    headerTitle: {
      color: colors.textHeader,
      fontFamily: 'Poppins',
      fontSize: 24,
      marginBottom: 4,
    },
    headerSubtitle: {
      color: colors.textSecondary,
      fontFamily: 'Poppins_Regular',
      fontSize: 14,
    },
    notificationButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    notificationBadge: {
      position: 'absolute',
      alignItems: 'center',
      backgroundColor: colors.danger,
      borderRadius: 10,
      height: 18,
      justifyContent: 'center',
      right: 2,
      top: 2,
      minWidth: 18,
      paddingHorizontal: 4,
    },
    badgeText: {
      color: colors.primary,
      fontFamily: 'Poppins',
      fontSize: 10,
    },
    filterContainer: {
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      paddingHorizontal: 5,
      paddingVertical: 16,
    },
    filterTitle: {
      color: colors.textPrimary,
      fontFamily: 'Poppins',
      fontSize: 16,
      marginBottom: 12,
    },
    filterButtons: {
      flexDirection: 'row',
      gap: 8,
    },
    filterButton: {
      backgroundColor: colors.secondary,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    filterButtonActive: {
      backgroundColor: colors.accent,
    },
    filterButtonText: {
      color: colors.textSecondary,
      fontFamily: 'Poppins_Regular',
      fontSize: 14,
    },
    filterButtonTextActive: {
      color: colors.primary,
    },
    loadingContainer: {
      alignItems: 'center',
      marginTop: 60,
    },
    loadingText: {
      color: colors.textSecondary,
      fontFamily: 'Poppins',
      fontSize: 16,
      marginTop: 12,
    },
    errorContainer: {
      alignItems: 'center',
      backgroundColor: colors.accentLight,
      borderRadius: 12,
      margin: 20,
      padding: 20,
    },
    errorText: {
      color: colors.danger,
      fontFamily: 'Poppins',
      fontSize: 14,
      marginBottom: 12,
      textAlign: 'center',
    },
    retryButton: {
      backgroundColor: colors.danger,
      borderRadius: 8,
      paddingHorizontal: 24,
      paddingVertical: 10,
    },
    retryButtonText: {
      color: colors.primary,
      fontFamily: 'Poppins',
    },
    sectionHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: 6,
      paddingHorizontal: 5,
      paddingTop: 24,
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontFamily: 'Poppins',
      fontSize: 18,
    },
    tutorialCount: {
      color: colors.textSecondary,
      fontFamily: 'Poppins',
      fontSize: 14,
    },
    tutorialsGrid: {
      gap: 16,
      paddingHorizontal: 20,
    },
    tutorialCard: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      elevation: 3,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    tutorialImage: {
      width: '100%',
      height: 170,
    },
    tutorialTags: {
      flexDirection: 'row',
      gap: 6,
      marginBottom: 10,
    },
    subjectTag: {
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    difficultyTag: {
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    tagText: {
      color: colors.primary,
      fontFamily: 'Poppins',
      fontSize: 12,
    },
    tutorialTitle: {
      fontSize: 15,
      fontFamily: 'Poppins',
      color: colors.textPrimary,
      marginBottom: 8,
      lineHeight: 22,
    },
    tutorialMeta: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 6,
    },
    tutorialMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    tutorialInstructor: {
      color: colors.textSecondary,
      fontFamily: 'Poppins',
      fontSize: 12,
      flexShrink: 1,
    },
    tutorialDuration: {
      color: colors.textSecondary,
      fontFamily: 'Poppins',
      fontSize: 12,
      flexShrink: 1,
    },
    achievementsSection: {
      marginTop: 28,
      paddingHorizontal: 5,
    },
    achievementsTitle: {
      color: colors.textPrimary,
      fontFamily: 'Poppins',
      fontSize: 18,
      marginBottom: 4,
    },
    achievementsSubtitle: {
      color: colors.textSecondary,
      fontFamily: 'Poppins_Regular',
      fontSize: 14,
      marginBottom: 16,
    },
    achievementsList: {
      flex: 1,
      gap: 12,
    },
    achievementCard: {
      alignItems: 'center',
      backgroundColor: '#fef3c7',
      borderRadius: 20,
      flexDirection: 'row',
      padding: 14,
      gap: 12,
    },
    achievementCardLocked: {
      backgroundColor: colors.secondary,
      opacity: 0.8,
    },
    achievementIcon: {
      fontSize: 28,
      marginRight: 14,
    },
    achievementTitle: {
      fontSize: 15,
      fontFamily: 'Poppins',
      color: colors.textPrimary,
      marginBottom: 2,
    },
    achievementTitleLocked: {
      color: colors.textSecondary,
    },
    achievementSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      fontFamily: 'Poppins_Regular',
    },
    guestPrompt: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      padding: 20,
      marginHorizontal: 10,
      marginTop: 20,
      marginBottom: 40,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
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
    progressSection: {
      marginBottom: 36,
      marginTop: 28,
      paddingHorizontal: 20,
    },
    progressTitle: {
      color: colors.textPrimary,
      fontFamily: 'Poppins',
      fontSize: 18,
      marginBottom: 14,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    statCard: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 20,
      elevation: 3,
      flex: 1,
      minWidth: '45%',
      paddingVertical: 18,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    statValue: {
      color: colors.accent,
      fontFamily: 'Poppins',
      fontSize: 22,
      marginBottom: 2,
    },
    statLabel: {
      color: colors.textSecondary,
      fontFamily: 'Poppins_Regular',
      fontSize: 12,
      textAlign: 'center',
    },
  });
