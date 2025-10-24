import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
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

import { useTutorials } from '@/hooks/useTutorials';
import { achievementData } from '@/utils/data';

export default function Dashboard() {
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const { data: tutorials, isLoading, isError, refetch } = useTutorials(selectedSubject);

  const [refreshing, setRefreshing] = useState(false);
  const [doNotDisturb, setDoNotDisturb] = useState(false);

  const subjects = [
    { label: 'All', icon: <Ionicons name="book" size={16} color="#3b82f6" /> },
    { label: 'Maths', icon: <MaterialCommunityIcons name="math-compass" size={16} color="#3b82f6" /> },
    { label: 'Science', icon: <MaterialCommunityIcons name="atom" size={16} color="#8b5cf6" /> },
    { label: 'History', icon: <FontAwesome5 name="landmark" size={16} color="#ec4899" /> },
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

  function onRefresh() {
    setRefreshing(true);
    refetch();
    setRefreshing(false);
  }

  function renderAchievementIcon(iconObj: { name: any; library: string; color: string }) {
    const size = 24;
    const { name, library, color } = iconObj;
    switch (library) {
      case 'Ionicons':
        return <Ionicons name={name} size={size} color={color} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={name} size={size} color={color} />;
      case 'MaterialCommunityIcons':
        return <MaterialCommunityIcons name={name} size={size} color={color} />;
      default:
        return <Ionicons name="star" size={size} color="#9ca3af" />;
    }
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Student Dashboard</Text>
            <Text style={styles.headerSubtitle}>Welcome back! Ready to learn something new?</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={() => setDoNotDisturb(!doNotDisturb)}>
            <Ionicons
              name={doNotDisturb ? 'notifications-off-outline' : 'notifications-outline'}
              size={26}
              color="#111827"
            />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Subject Filter */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterTitle}>Browse by Subject</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filterButtons}>
              {subjects.map(({ label, icon }) => (
                <TouchableOpacity
                  key={label}
                  style={[styles.filterButton, selectedSubject === label && styles.filterButtonActive]}
                  onPress={() => setSelectedSubject(label)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {icon}
                    <Text style={[styles.filterButtonText, selectedSubject === label && styles.filterButtonTextActive]}>
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

            <View style={styles.tutorialsGrid}>
              {tutorials.map((tutorial) => (
                <TouchableOpacity
                  key={tutorial.id}
                  style={styles.tutorialCard}
                  onPress={() => router.push(`/tutorial/${tutorial.id}`)}
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
                      <Text style={styles.tutorialInstructor}>
                        <Ionicons name="person-outline" size={14} /> {tutorial.instructor}
                      </Text>
                      <Text style={styles.tutorialDuration}>
                        <Ionicons name="time-outline" size={14} /> {tutorial.duration}
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
          <Text style={styles.achievementsTitle}>Achievements</Text>
          <Text style={styles.achievementsSubtitle}>
            {achievementData.filter((a) => a.earned).length} of {achievementData.length} earned
          </Text>
          <View style={styles.achievementsList}>
            {achievementData.map((achievement) => (
              <View
                key={achievement.id}
                style={[styles.achievementCard, !achievement.earned && styles.achievementCardLocked]}
              >
                {renderAchievementIcon(achievement.icon)}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.achievementTitle, !achievement.earned && styles.achievementTitleLocked]}>
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementSubtitle}>{achievement.subtitle}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Progress Stats */}
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f9fafb',
    flex: 1,
  },
  header: {
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    borderBottomColor: '#e5e7eb',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerTitle: {
    color: '#111827',
    fontFamily: 'Poppins',
    fontSize: 24,
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#6b7280',
    fontFamily: 'Poppins_Regular',
    fontSize: 14,
  },
  iconButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    alignItems: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 8,
    height: 18,
    justifyContent: 'center',
    position: 'absolute',
    right: 2,
    top: 2,
    width: 18,
  },
  badgeText: {
    color: '#fff',
    fontFamily: 'Poppins',
    fontSize: 10,
  },
  filterContainer: {
    backgroundColor: '#fff',
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
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
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
  },
  tutorialInstructor: {
    color: '#6b7280',
    fontFamily: 'Poppins',
    fontSize: 12,
  },
  tutorialDuration: {
    color: '#6b7280',
    fontFamily: 'Poppins',
    fontSize: 12,
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
    fontFamily: 'Poppins',
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
    borderRadius: 10,
    flexDirection: 'row',
    padding: 14,
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
    borderRadius: 10,
    elevation: 1,
    flex: 1,
    minWidth: '45%',
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  statValue: {
    color: '#3b82f6',
    fontFamily: 'Poppins',
    fontSize: 22,
    marginBottom: 2,
  },
  statLabel: {
    color: '#6b7280',
    fontFamily: 'Poppins',
    fontSize: 12,
    textAlign: 'center',
  },
});
