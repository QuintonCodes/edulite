import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
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
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { useTutorials } from '@/hooks/useTutorials';
import { Colors, darkColors, lightColors } from '@/styles/theme';

const subjectStyleMap: Record<string, { icon: any; library: any; color: string }> = {
  Mathematics: { icon: 'math-compass', library: MaterialCommunityIcons, color: '#3b82f6' },
  'Physical Sciences': { icon: 'atom', library: MaterialCommunityIcons, color: '#8b5cf6' },
  'Life Sciences': { icon: 'leaf-outline', library: Ionicons, color: '#10b981' },
  Geography: { icon: 'globe-outline', library: Ionicons, color: '#f59e0b' },
  History: { icon: 'landmark', library: FontAwesome5, color: '#ec4899' },
  Default: { icon: 'book', library: Ionicons, color: '#6b7280' },
};

export default function Home() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const styles = getStyles(colors);

  const [selectedSubject, setSelectedSubject] = useState('All');
  const [refreshing, setRefreshing] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const { user, isAuthenticated } = useAuth();
  const { data: filteredTutorials, isLoading, isError, refetch } = useTutorials(selectedSubject);
  const { data: allTutorials } = useTutorials('All');

  function useContinueLearning() {
    if (!allTutorials || allTutorials.length < 2) {
      return { lastWatchedTutorial: null, progress: 0 };
    }
    return { lastWatchedTutorial: allTutorials[1], progress: 0.6 }; // Returns "Newton's Laws" at 60%
  }
  const { lastWatchedTutorial, progress } = useContinueLearning();

  const dynamicSubjects = useMemo(() => {
    if (!allTutorials) return [];
    // Get unique subject names
    const subjects = [...new Set(allTutorials.map((t) => t.subject))];
    // Map to the object structure our UI expects
    const subjectButtons = subjects.map((subject) => {
      const style = subjectStyleMap[subject] || subjectStyleMap.Default;
      return { label: subject, ...style };
    });
    // Add "All" to the beginning
    return [{ label: 'All', icon: 'book', library: Ionicons, color: colors.accent }, ...subjectButtons];
  }, [allTutorials, colors.accent]);

  const newlyAddedTutorials = useMemo(() => {
    if (!allTutorials) return [];
    // Sort by createdAt date (newest first) and take the top 5
    return allTutorials.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  }, [allTutorials]);

  // Color mappings for UI
  const difficultyColors = {
    'Grade 10': colors.success,
    'Grade 11': colors.warning,
    'Grade 12': colors.danger,
    Beginner: colors.success, // Fallback
    Intermediate: colors.warning, // Fallback
    Advanced: colors.danger, // Fallback
  };

  const subjectColors: Record<string, string> = {
    Mathematics: '#3b82f6',
    'Physical Sciences': '#8B5CF6',
    'Life Sciences': '#10b981',
    Geography: '#f59e0b',
    History: '#EC4899',
    Default: '#6b7280',
  };

  async function onRefresh() {
    setRefreshing(true);
    try {
      await refetch();
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
            {isAuthenticated ? 'Continue your learning journey.' : 'Sign up or log in to unlock exclusive features.'}
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

      {isAuthenticated ? (
        lastWatchedTutorial && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Continue Learning</Text>
            <TouchableOpacity
              style={styles.continueCard}
              onPress={() => router.push(`/tutorial/${lastWatchedTutorial.id}`)}
              activeOpacity={0.9}
            >
              <Image source={{ uri: lastWatchedTutorial.image }} style={styles.continueImage} />
              <View style={styles.continueContent}>
                <Text style={styles.continueSubject}>{lastWatchedTutorial.subject}</Text>
                <Text style={styles.continueTitle} numberOfLines={2}>
                  {lastWatchedTutorial.title}
                </Text>
                <View style={styles.continueProgress}>
                  <Progress.Bar
                    progress={progress}
                    width={null}
                    color={colors.accent}
                    unfilledColor={colors.border}
                    borderWidth={0}
                    height={6}
                    borderRadius={3}
                  />
                  <Text style={styles.continuePercent}>{Math.round(progress * 100)}%</Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        )
      ) : (
        <View style={styles.guestPrompt}>
          <Text style={styles.guestPromptText}>Log in to track your achievements and save your progress!</Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/login')}>
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Subject Filter */}
      <View style={styles.filterContainer}>
        <Text style={styles.filterTitle}>Browse by Subject</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filterButtons}>
            {dynamicSubjects.map(({ label, icon, library: IconComp, color }) => (
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
      {!isLoading && !isError && filteredTutorials && (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{selectedSubject === 'All' ? 'All Tutorials' : selectedSubject}</Text>
          <Text style={styles.tutorialCount}>{filteredTutorials.length} tutorials available</Text>
        </View>
      )}
    </>
  );

  // Footer component
  const ListFooterComponent = () => (
    <>
      {/* Newly Added Section */}
      {newlyAddedTutorials.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Newly Added</Text>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={newlyAddedTutorials}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ gap: 12 }}
            renderItem={({ item: tutorial }) => (
              <TouchableOpacity
                style={styles.newTutorialCard}
                onPress={() => router.push(`/tutorial/${tutorial.id}`)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: tutorial.image }} style={styles.newTutorialImage} />
                <View style={styles.newTutorialContent}>
                  <Text style={styles.newTutorialSubject}>{tutorial.subject}</Text>
                  <Text style={styles.newTutorialTitle} numberOfLines={2}>
                    {tutorial.title}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      <View style={{ height: 120 }} />
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
  if (isError || !filteredTutorials) {
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
        data={filteredTutorials}
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
      paddingTop: 24,
    },
    filterTitle: {
      color: colors.textPrimary,
      fontFamily: 'Poppins',
      fontSize: 16,
      marginBottom: 12,
      paddingHorizontal: 5,
    },
    filterButtons: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 5,
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
    section: {
      paddingTop: 16,
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontFamily: 'Poppins',
      fontSize: 18,
      marginBottom: 16,
      paddingHorizontal: 5,
    },
    continueCard: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      flexDirection: 'row',
      overflow: 'hidden',
    },
    continueImage: {
      width: 100,
      height: '100%',
    },
    continueContent: {
      padding: 14,
      flex: 1,
      justifyContent: 'center',
    },
    continueSubject: {
      fontFamily: 'Poppins',
      fontSize: 12,
      color: colors.accent,
      marginBottom: 4,
    },
    continueTitle: {
      fontFamily: 'Poppins',
      fontSize: 15,
      color: colors.textPrimary,
      lineHeight: 22,
      marginBottom: 12,
    },
    continueProgress: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    continuePercent: {
      fontFamily: 'Poppins',
      fontSize: 12,
      color: colors.textSecondary,
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
    newTutorialCard: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      elevation: 2,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      width: 160, // Fixed width for horizontal list
    },
    newTutorialImage: {
      width: '100%',
      height: 100,
    },
    newTutorialContent: {
      padding: 10,
    },
    newTutorialSubject: {
      fontFamily: 'Poppins',
      fontSize: 11,
      color: colors.accent,
      marginBottom: 2,
    },
    newTutorialTitle: {
      fontFamily: 'Poppins',
      fontSize: 13,
      color: colors.textPrimary,
      lineHeight: 18,
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
