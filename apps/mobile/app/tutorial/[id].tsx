import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { useTutorials } from '@/hooks/useTutorials';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { Colors, darkColors, lightColors } from '@/styles/theme';
import { progressService } from '@/utils/apiService';
import { XP_REWARDS } from '@/utils/levelSystem';
import { Tutorial } from '@/utils/types';
import Toast from 'react-native-toast-message';

export default function TutorialDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const styles = getStyles(colors);

  const { user, updateUser } = useAuth();
  const { data: tutorials, isLoading, isError } = useTutorials('All');
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { player, progress, setProgress, isCompleted, setIsCompleted } = useVideoProgress({
    videoUrl: tutorial?.videoUrl || '',
    tutorialId: id || '',
  });

  useEffect(() => {
    if (!id || !user?.id) return;

    async function fetchProgress() {
      const { completed } = await progressService.getProgress(id, user?.id);
      if (completed) {
        setIsCompleted(true);
        setProgress(1, false); // Set progress bar to full
      }
    }
    fetchProgress();
  }, [id, user?.id, setIsCompleted, setProgress]);

  async function handleMarkComplete() {
    if (isCompleted) return; // Already done
    if (progress < 0.95) {
      // Not 0.95, but use video progress
      Toast.show({
        type: 'info',
        text1: 'Incomplete Tutorial',
        text2: 'Please watch the full tutorial before marking it complete.',
        position: 'bottom',
      });
      return;
    }

    if (isSubmitting) return; // Prevent double-tap
    setIsSubmitting(true);

    try {
      const result = await progressService.markAsComplete(id, user?.id);

      if (result.error) throw new Error(result.error);

      setProgress(1, true);

      if (result.data?.user) {
        updateUser(result.data.user);
        Toast.show({
          type: 'success',
          text1: 'Tutorial Completed!',
          text2: `You earned +${result.data?.xpAwarded || XP_REWARDS.COMPLETE_TUTORIAL} XP!`,
        });
      } else {
        // This happens if they just completed it (no new XP)
        Toast.show({ type: 'success', text1: 'Tutorial Completed!' });
      }
    } catch (error) {
      console.error('Mark complete error:', error);
      Toast.show({ type: 'error', text1: 'Error', text2: (error as Error).message });
    } finally {
      setIsSubmitting(false);
    }
  }

  function getRecommendations(): Tutorial[] {
    if (!tutorial || !tutorials) return [];
    return tutorials.filter((t) => t.subject === tutorial.subject && String(t.id) !== String(id)).slice(0, 3);
  }

  useEffect(() => {
    if (tutorials && id) {
      const match = tutorials.find((t) => String(t.id) === String(id));
      setTutorial(match || null);
    }
  }, [tutorials, id]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading tutorial...</Text>
      </View>
    );
  }

  if (isError || !tutorial) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Unable to load this tutorial. Please try again.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.retryButton}>
          <Text style={styles.retryText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.accent} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tutorial.title || 'Untitled Tutorial'}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Video Player */}
        <View style={styles.videoCard}>
          <View style={styles.videoContainer}>
            {tutorial.videoUrl && player ? (
              <VideoView style={styles.video} player={player} nativeControls contentFit="contain" />
            ) : tutorial.image ? (
              <Image source={{ uri: tutorial.image }} style={styles.video} />
            ) : (
              <View style={styles.videoPlaceholder}>
                <Ionicons name="play-circle-outline" size={64} color={colors.textSecondary} />
                <Text style={styles.videoPlaceholderText}>No video available</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.metaBadges}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{tutorial.subject || 'Unknown'}</Text>
            </View>
            <View style={[styles.badge, styles.difficultyBadge]}>
              <Text style={styles.badgeText}>{tutorial.difficulty || 'Unknown'}</Text>
            </View>
          </View>

          <View style={styles.instructorRow}>
            <Ionicons name="person-circle-outline" size={20} color={colors.textSecondary} />
            <Text style={styles.instructorText}>{tutorial.instructor || 'Unknown Instructor'}</Text>
          </View>

          {/* Progress Tracker */}
          {tutorial.videoUrl && (
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>Your Progress</Text>
                <View style={styles.progressBadge}>
                  {isCompleted && <Ionicons name="checkmark-circle" size={16} color={colors.success} />}
                  <Text style={[styles.progressPercent, isCompleted && { color: colors.success }]}>
                    {Math.round(progress * 100)}%
                  </Text>
                </View>
              </View>
              <Progress.Bar
                progress={progress}
                width={null}
                color={isCompleted ? colors.success : colors.accent}
                unfilledColor={colors.border}
                borderWidth={0}
                height={8}
                borderRadius={8}
              />
            </View>
          )}
        </View>

        {/* Description Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.sectionCard}>
            <Text style={styles.sectionText}>{tutorial.description || 'No description available.'}</Text>
          </View>
        </View>

        {/* Objectives Section */}
        {tutorial.objectives && tutorial.objectives.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Learning Objectives</Text>
            <View style={styles.sectionCard}>
              {tutorial.objectives.map((obj, i) => (
                <View key={i} style={styles.objectiveRow}>
                  <View style={styles.objectiveBullet}>
                    <Ionicons name="checkmark" size={14} color={colors.accent} />
                  </View>
                  <Text style={styles.objectiveText}>{obj || 'No objective available'}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {(progress >= 0.95 || isCompleted) && (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.quizButton}
              onPress={() => router.push(`/quiz/${id}?type=tutorial`)}
              activeOpacity={0.8}
            >
              <View style={styles.quizButtonContent}>
                <MaterialCommunityIcons name="clipboard-list" size={24} color={colors.textOnAccent} />
                <View style={styles.quizButtonTextContainer}>
                  <Text style={styles.quizButtonTitle}>Knowledge Check</Text>
                  <Text style={styles.quizButtonSubtitle}>Test your understanding</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={24} color={colors.textOnAccent} />
            </TouchableOpacity>
          </View>
        )}

        {/* Recommendations Section */}
        {getRecommendations().length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recommended for You</Text>
            <View style={styles.recommendationsContainer}>
              {getRecommendations().map((rec) => (
                <TouchableOpacity
                  key={rec.id}
                  style={styles.recommendationCard}
                  onPress={() => router.push(`/tutorial/${rec.id}`)}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: rec.image }} style={styles.recommendationImage} />
                  <View style={styles.recommendationContent}>
                    <Text style={styles.recommendationTitle} numberOfLines={2}>
                      {rec.title}
                    </Text>
                    <View style={styles.recommendationMeta}>
                      <View style={styles.recommendationBadge}>
                        <Text style={styles.recommendationBadgeText}>{rec.difficulty}</Text>
                      </View>
                    </View>
                    <View style={styles.recommendationFooter}>
                      <Ionicons name="person-circle-outline" size={14} color={colors.textSecondary} />
                      <Text style={styles.recommendationInstructor} numberOfLines={1}>
                        {rec.instructor}
                      </Text>
                    </View>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* CTA Button */}
        <View style={styles.ctaSection}>
          <TouchableOpacity
            style={[
              styles.ctaButton,
              {
                backgroundColor: isCompleted ? colors.success : progress >= 0.95 ? colors.accent : colors.border,
              },
            ]}
            onPress={handleMarkComplete}
            disabled={isCompleted || isSubmitting}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.ctaText,
                {
                  color: progress >= 0.95 || isCompleted ? colors.textOnAccent : colors.textSecondary,
                },
              ]}
            >
              {isSubmitting
                ? 'Saving...'
                : isCompleted
                  ? 'Completed'
                  : progress >= 0.95
                    ? 'Mark as Complete'
                    : 'Watch to Complete'}
            </Text>
            <Ionicons
              name={isCompleted ? 'checkmark-circle' : 'checkmark-circle-outline'}
              size={20}
              color={progress >= 0.95 || isCompleted ? colors.textOnAccent : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      color: colors.textSecondary,
      marginTop: 10,
      fontFamily: 'Poppins_Regular',
      fontSize: 14,
    },
    errorText: {
      color: colors.danger,
      fontSize: 15,
      marginBottom: 10,
      textAlign: 'center',
      fontFamily: 'Poppins_Regular',
    },
    retryButton: {
      backgroundColor: colors.accent,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 12,
    },
    retryText: {
      color: colors.textOnAccent,
      fontFamily: 'Poppins',
      fontSize: 15,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      paddingHorizontal: 20,
      paddingBottom: 10,
      paddingTop: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontFamily: 'Poppins',
      flex: 1,
      color: colors.textHeader,
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 40,
    },
    videoCard: {
      // backgroundColor: colors.primary,
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 16,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    videoContainer: {
      width: '100%',
      height: 220,
      // backgroundColor: colors.secondary,
    },
    video: {
      width: '100%',
      height: '100%',
    },
    videoPlaceholder: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 12,
    },
    videoPlaceholderText: {
      color: colors.textSecondary,
      fontFamily: 'Poppins_Regular',
      fontSize: 14,
    },
    infoCard: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    metaBadges: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    badge: {
      backgroundColor: colors.accentLight,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    difficultyBadge: {
      backgroundColor: colors.secondary,
    },
    badgeText: {
      color: colors.accent,
      fontFamily: 'Poppins',
      fontSize: 12,
    },
    instructorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: 16,
    },
    instructorText: {
      color: colors.textPrimary,
      fontFamily: 'Poppins_Regular',
      fontSize: 14,
    },
    progressSection: {
      gap: 12,
    },
    progressHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    progressTitle: {
      fontSize: 15,
      fontFamily: 'Poppins',
      color: colors.textPrimary,
    },
    progressBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    progressPercent: {
      fontSize: 15,
      color: colors.accent,
      fontFamily: 'Poppins',
    },
    section: {
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontFamily: 'Poppins',
      color: colors.textPrimary,
      marginBottom: 12,
    },
    sectionCard: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 16,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    sectionText: {
      fontSize: 14,
      fontFamily: 'Poppins_Regular',
      color: colors.textPrimary,
      lineHeight: 22,
    },
    objectiveRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 12,
      gap: 12,
    },
    objectiveBullet: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.accentLight,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 2,
    },
    objectiveText: {
      flex: 1,
      fontSize: 14,
      fontFamily: 'Poppins_Regular',
      color: colors.textPrimary,
      lineHeight: 22,
    },
    quizButton: {
      backgroundColor: colors.accent,
      borderRadius: 16,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    quizButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
      flex: 1,
    },
    quizButtonTextContainer: {
      flex: 1,
    },
    quizButtonTitle: {
      color: colors.textOnAccent,
      fontFamily: 'Poppins',
      fontSize: 16,
      marginBottom: 2,
    },
    quizButtonSubtitle: {
      color: colors.textOnAccent,
      fontFamily: 'Poppins_Regular',
      fontSize: 13,
      opacity: 0.9,
    },
    recommendationsContainer: {
      gap: 12,
    },
    recommendationCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: 16,
      overflow: 'hidden',
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      padding: 12,
      gap: 12,
    },
    recommendationImage: {
      width: 80,
      height: 80,
      backgroundColor: colors.secondary,
      borderRadius: 12,
    },
    recommendationContent: {
      flex: 1,
      gap: 6,
    },
    recommendationTitle: {
      fontSize: 14,
      fontFamily: 'Poppins',
      color: colors.textPrimary,
      lineHeight: 18,
    },
    recommendationMeta: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    recommendationBadge: {
      backgroundColor: colors.accentLight,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    recommendationBadgeText: {
      fontSize: 11,
      fontFamily: 'Poppins',
      color: colors.accent,
    },
    recommendationFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    recommendationInstructor: {
      fontSize: 12,
      fontFamily: 'Poppins_Regular',
      color: colors.textSecondary,
      flex: 1,
    },
    ctaSection: {
      marginTop: 8,
    },
    ctaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 16,
      paddingVertical: 16,
      gap: 8,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    ctaText: {
      fontFamily: 'Poppins',
      fontSize: 16,
    },
  });
