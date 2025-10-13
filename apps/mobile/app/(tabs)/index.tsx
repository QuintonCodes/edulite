// 📄 FILE: app/index.tsx
// Student Dashboard Screen - Main home screen after login/guest continue
// Shows tutorials, achievements, and progress stats

import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// 🔹 Define TypeScript interfaces for data safety
interface Tutorial {
  id: string;
  subject: 'Maths' | 'Science' | 'History';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  title: string;
  instructor: string;
  duration: string;
  image: string;
}

interface Achievement {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  earned: boolean;
}

// 🔹 Mock tutorial data (with CLEAN image URLs - no extra spaces!)
const tutorialData: Tutorial[] = [
  {
    id: '1',
    subject: 'Maths',
    difficulty: 'Beginner',
    title: 'Introduction to Algebra: Solving Linear Equations',
    instructor: 'Dr. Sarah Chen',
    duration: '25 min',
    image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400',
  },
  {
    id: '2',
    subject: 'Science',
    difficulty: 'Intermediate',
    title: 'Chemistry Fundamentals: Understanding Chemical Bonds',
    instructor: 'Prof. Mark Johnson',
    duration: '32 min',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400',
  },
  {
    id: '3',
    subject: 'History',
    difficulty: 'Advanced',
    title: 'Ancient Civilizations: The Rise and Fall of Rome',
    instructor: 'Dr. Emily Rodriguez',
    duration: '28 min',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400',
  },
  {
    id: '4',
    subject: 'Maths',
    difficulty: 'Advanced',
    title: 'Calculus Made Easy: Derivatives and Applications',
    instructor: 'Dr. Michael Park',
    duration: '45 min',
    image: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400',
  },
  {
    id: '5',
    subject: 'Science',
    difficulty: 'Intermediate',
    title: "Physics: Newton's Laws of Motion Explained",
    instructor: 'Dr. Lisa Wang',
    duration: '35 min',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400',
  },
  {
    id: '6',
    subject: 'History',
    difficulty: 'Intermediate',
    title: 'World War II: Key Events and Turning Points',
    instructor: 'Prof. David Thompson',
    duration: '42 min',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=400',
  },
];

// 🔹 Mock achievement data
const achievementData: Achievement[] = [
  {
    id: '1',
    icon: '🏆',
    title: 'First Steps',
    subtitle: 'Complete your first tutorial',
    earned: true,
  },
  {
    id: '2',
    icon: '🔥',
    title: 'Week Streak',
    subtitle: 'Study for 7 consecutive days',
    earned: true,
  },
  {
    id: '3',
    icon: '💡',
    title: 'Subject Master',
    subtitle: 'Complete 5 tutorials in one subject',
    earned: true,
  },
  {
    id: '4',
    icon: '⚡',
    title: 'Speed Learner',
    subtitle: 'Complete a tutorial in under 20 min',
    earned: false,
  },
  {
    id: '5',
    icon: '🎓',
    title: 'Academic Excellence',
    subtitle: 'Score 95% or higher on 10 quizzes',
    earned: false,
  },
  {
    id: '6',
    icon: '🏅',
    title: 'Dedication Award',
    subtitle: 'Study for 30 consecutive days',
    earned: false,
  },
];

// 🔹 Main Dashboard Component
export default function StudentDashboard() {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [doNotDisturb, setDoNotDisturb] = useState(false);
  const router = useRouter();

  const subjects = ['All', 'Maths', 'Science', 'History'];

  // 🔹 Simulate fetching tutorials (replace with real API later)
  const fetchTutorials = async () => {
    try {
      setError(null);
      // Mock delay to simulate network request
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTutorials(tutorialData);
    } catch (err) {
      setError('Failed to load tutorials. Please retry.');
      console.error('Error fetching tutorials:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTutorials();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTutorials();
  };

  // 🔹 Filter tutorials by selected subject
  const filteredTutorials = selectedSubject === 'All'
    ? tutorials
    : tutorials.filter(t => t.subject === selectedSubject);

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

  // 🔹 Loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading tutorials...</Text>
      </View>
    );
  }

  return (
<<<<<<< HEAD:apps/mobile/app/(tabs)/index.tsx
    <View
      style={{
        flex: 1,
        width: 'auto',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#acacac',
      }}
    >
      <Text>This is the home screen</Text>
    </View>
=======
    // 🔹 Wrap all content in a View to avoid React key warnings
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.headerTitle}>Student Dashboard</Text>
              <Text style={styles.headerSubtitle}>
                Welcome back! Ready to learn something new?
              </Text>
            </View>
            <View style={styles.headerIcons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setDoNotDisturb(!doNotDisturb)}
                accessible
                accessibilityLabel={doNotDisturb ? "Turn off do not disturb" : "Turn on do not disturb"}
              >
                <Text style={styles.iconText}>
                  {doNotDisturb ? '🔕' : '🔔'}
                </Text>
              </TouchableOpacity>
              <View style={styles.notificationBadge}>
                <Text style={styles.badgeText}>3</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Subject Filter */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Browse by Subject</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterButtons}>
              {subjects.map(subject => (
                <TouchableOpacity
                  key={subject}
                  style={[
                    styles.filterButton,
                    selectedSubject === subject && styles.filterButtonActive,
                  ]}
                  onPress={() => setSelectedSubject(subject)}
                  accessible
                  accessibilityLabel={`Filter by ${subject}`}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      selectedSubject === subject && styles.filterButtonTextActive,
                    ]}
                  >
                    {subject === 'All' ? '📚' : subject === 'Maths' ? '📐' : subject === 'Science' ? '🔬' : '📜'} {subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchTutorials}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tutorials Section */}
        {!error && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All Tutorials</Text>
              <Text style={styles.tutorialCount}>
                {filteredTutorials.length} tutorials available
              </Text>
            </View>

            <View style={styles.tutorialsGrid}>
              {filteredTutorials.map(tutorial => (
                <TouchableOpacity
                  key={tutorial.id}
                  style={styles.tutorialCard}
                  onPress={() => router.push(`/tutorial/${tutorial.id}`)}
                  accessible
                  accessibilityLabel={`Open tutorial: ${tutorial.title}`}
                >
                  <Image
                    source={{ uri: tutorial.image.trim() }} // Trim spaces for safety
                    style={styles.tutorialImage}
                    onError={(e) => console.log('Image load error for tutorial:', tutorial.id)}
                  />
                  <View style={styles.tutorialContent}>
                    <View style={styles.tutorialTags}>
                      <View
                        style={[
                          styles.subjectTag,
                          { backgroundColor: subjectColors[tutorial.subject] },
                        ]}
                      >
                        <Text style={styles.subjectTagText}>
                          {tutorial.subject}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.difficultyTag,
                          { backgroundColor: difficultyColors[tutorial.difficulty] },
                        ]}
                      >
                        <Text style={styles.difficultyTagText}>
                          {tutorial.difficulty}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.tutorialTitle}>{tutorial.title}</Text>
                    <View style={styles.tutorialMeta}>
                      <Text style={styles.tutorialInstructor}>
                        👤 {tutorial.instructor}
                      </Text>
                      <Text style={styles.tutorialDuration}>
                        ⏱️ {tutorial.duration}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {/* Achievements Section */}
        <View style={styles.achievementsSection}>
          <Text style={styles.achievementsTitle}>🏆 Achievements</Text>
          <Text style={styles.achievementsSubtitle}>
            {achievementData.filter(a => a.earned).length} of {achievementData.length} earned
          </Text>
          <View style={styles.achievementsList}>
            {achievementData.map(achievement => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  !achievement.earned && styles.achievementCardLocked,
                ]}
              >
                <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                <View style={styles.achievementContent}>
                  <Text
                    style={[
                      styles.achievementTitle,
                      !achievement.earned && styles.achievementTitleLocked,
                    ]}
                  >
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementSubtitle}>
                    {achievement.subtitle}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Progress Stats */}
        <View style={styles.progressSection}>
          <Text style={styles.progressTitle}>Your Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Tutorials Completed</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>8.5h</Text>
              <Text style={styles.statLabel}>Hours Learned</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>5 days</Text>
              <Text style={styles.statLabel}>Current Streak</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>87%</Text>
              <Text style={styles.statLabel}>Average Score</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
>>>>>>> 4a74bdc (work in progress: local updates):app/index.tsx
  );
}

// 🔹 Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  iconButton: {
    padding: 8,
  },
  iconText: {
    fontSize: 24,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  errorContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#991B1B',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  tutorialCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  tutorialsGrid: {
    paddingHorizontal: 20,
    gap: 16,
  },
  tutorialCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tutorialImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#E5E7EB',
  },
  tutorialContent: {
    padding: 16,
  },
  tutorialTags: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  subjectTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  subjectTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  difficultyTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  difficultyTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  tutorialTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    lineHeight: 22,
  },
  tutorialMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tutorialInstructor: {
    fontSize: 13,
    color: '#6B7280',
  },
  tutorialDuration: {
    fontSize: 13,
    color: '#6B7280',
  },
  achievementsSection: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  achievementsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  achievementsSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  achievementCardLocked: {
    backgroundColor: '#F3F4F6',
    opacity: 0.7,
  },
  achievementIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  achievementTitleLocked: {
    color: '#6B7280',
  },
  achievementSubtitle: {
    fontSize: 13,
    color: '#6B7280',
  },
  progressSection: {
    marginTop: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});