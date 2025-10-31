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
import { useTutorials } from '@/hooks/useTutorials';
import { achievementData } from '@/utils/data';

export default function Home() {
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  const { user, isAuthenticated } = useAuth();
  const { data: tutorials, isLoading, isError, refetch } = useTutorials(selectedSubject);

  const subjects = [
    { label: 'All', icon: 'book', library: Ionicons, color: '#3b82f6' },
    { label: 'Maths', icon: 'math-compass', library: MaterialCommunityIcons, color: '#3b82f6' },
    { label: 'Science', icon: 'atom', library: MaterialCommunityIcons, color: '#8b5cf6' },
    { label: 'History', icon: 'landmark', library: FontAwesome5, color: '#ec4899' },
  ];

  // 🔹 Color mappings for UI
  const difficultyColors = {
    Beginner: '#10B981',
    Intermediate: '#F59E0B',
    Advanced: '#EF4444',
  };

  const subjectColors = {
    Maths: '#3B82F6',
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ paddingBottom: 32 }}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle} ellipsizeMode="tail" numberOfLines={2}>
                {isAuthenticated ? `Welcome Back, ${user?.name}!` : 'Welcome to Edulite!'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {isAuthenticated
                  ? 'Continue your learning journey with personalized content.'
                  : 'Sign up or log in to unlock exclusive features.'}
              </Text>
            </View>

            <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/')} activeOpacity={0.8}>
              <Ionicons name="notifications-outline" size={28} color="#3b82f6" />
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text> {/* Change '3' to your dynamic count */}
              </View>
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
                      <Text
                        style={[styles.filterButtonText, selectedSubject === label && styles.filterButtonTextActive]}
                      >
                        {label}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Error State */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.loadingText}>Loading tutorials...</Text>
            </View>
          ) : isError || !tutorials ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Failed to load tutorials. Please retry.</Text>
              <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Tutorials Section */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>All Tutorials</Text>
                <Text style={styles.tutorialCount}>{tutorials.length} tutorials available</Text>
              </View>

              <FlatList
                data={tutorials}
                keyExtractor={(item) => item.id}
                numColumns={1}
                contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20, gap: 16 }}
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
                        <View
                          style={[styles.difficultyTag, { backgroundColor: difficultyColors[tutorial.difficulty] }]}
                        >
                          <Text style={styles.tagText}>{tutorial.difficulty}</Text>
                        </View>
                      </View>
                      <Text style={styles.tutorialTitle}>{tutorial.title}</Text>
                      <View style={styles.tutorialMeta}>
                        <View style={styles.tutorialMetaItem}>
                          <Ionicons name="person-outline" size={14} color="#6b7280" />
                          <Text style={styles.tutorialInstructor}>{tutorial.instructor}</Text>
                        </View>
                        <View style={styles.tutorialMetaItem}>
                          <Ionicons name="time-outline" size={14} color="#6b7280" />
                          <Text style={styles.tutorialDuration}>{tutorial.duration}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </>
          )}

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
              <Text style={styles.guestPromptText}>
                Log in to track your achievements and unlock exclusive rewards!
              </Text>
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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    flex: 1,
    marginBottom: 35,
  },
  scrollContent: {
    backgroundColor: '#f9fafb',
    paddingBottom: 20,
  },
  header: {
    alignItems: 'center',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingBottom: 20,
    paddingHorizontal: 16,
    paddingTop: 30,
    position: 'relative',
  },
  headerTextContainer: {
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#1976d2',
    fontFamily: 'Poppins',
    fontSize: 24,
    marginBottom: 4,
    flex: 1,
  },
  headerSubtitle: {
    color: '#666',
    fontFamily: 'Poppins_Regular',
    fontSize: 14,
  },
  notificationButton: {
    position: 'absolute',
    right: 16,
    top: 35,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 10,
    height: 18,
    justifyContent: 'center',
    right: 2,
    top: 2,
    minWidth: 18,
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontFamily: 'Poppins',
    fontSize: 10,
  },
  filterContainer: {
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  filterTitle: {
    color: '#111827',
    fontFamily: 'Poppins',
    fontSize: 16,
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
  },
  filterButtonText: {
    color: '#6b7280',
    fontFamily: 'Poppins_Regular',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 60,
  },
  loadingText: {
    color: '#6b7280',
    fontFamily: 'Poppins',
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    alignItems: 'center',
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    margin: 20,
    padding: 20,
  },
  errorText: {
    color: '#991b1b',
    fontFamily: 'Poppins',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontFamily: 'Poppins',
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 12,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    color: '#111827',
    fontFamily: 'Poppins',
    fontSize: 18,
  },
  tutorialCount: {
    color: '#6b7280',
    fontFamily: 'Poppins',
    fontSize: 14,
  },
  tutorialsGrid: {
    gap: 16,
    paddingHorizontal: 20,
  },
  tutorialCard: {
    backgroundColor: '#fff',
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
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  difficultyTag: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    color: '#fff',
    fontFamily: 'Poppins',
    fontSize: 12,
  },
  tutorialTitle: {
    fontSize: 15,
    fontFamily: 'Poppins',
    color: '#111827',
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
    color: '#6b7280',
    fontFamily: 'Poppins',
    fontSize: 12,
    flexShrink: 1,
  },
  tutorialDuration: {
    color: '#6b7280',
    fontFamily: 'Poppins',
    fontSize: 12,
    flexShrink: 1,
  },
  achievementsSection: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  achievementsTitle: {
    color: '#111827',
    fontFamily: 'Poppins',
    fontSize: 18,
    marginBottom: 4,
  },
  achievementsSubtitle: {
    color: '#6B7280',
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
    backgroundColor: '#f3f4f6',
    opacity: 0.8,
  },
  achievementIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  achievementTitle: {
    fontSize: 15,
    fontFamily: 'Poppins',
    color: '#111827',
    marginBottom: 2,
  },
  achievementTitleLocked: {
    color: '#6b7280',
  },
  achievementSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    fontFamily: 'Poppins_Regular',
  },
  guestPrompt: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
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
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Poppins',
  },
  progressSection: {
    marginBottom: 36,
    marginTop: 28,
    paddingHorizontal: 20,
  },
  progressTitle: {
    color: '#111827',
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
    backgroundColor: '#fff',
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
    color: '#3b82f6',
    fontFamily: 'Poppins',
    fontSize: 22,
    marginBottom: 2,
  },
  statLabel: {
    color: '#6b7280',
    fontFamily: 'Poppins_Regular',
    fontSize: 12,
    textAlign: 'center',
  },
});
