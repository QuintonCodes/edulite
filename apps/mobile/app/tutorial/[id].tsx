import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { VideoView } from 'expo-video';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Progress from 'react-native-progress';

import { useTutorials } from '@/hooks/useTutorials';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { Tutorial } from '@/utils/types';

const { width } = Dimensions.get('window');

export default function TutorialDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: tutorials, isLoading, isError } = useTutorials('All');
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);

  const { player, progress, setProgress, currentTime, duration } = useVideoProgress({
    videoUrl: tutorial?.videoUrl || '',
    tutorialId: id || '',
  });

  function handleMarkComplete() {
    if (progress < 0.95) {
      alert('Please watch the full tutorial before marking it complete.');
      return;
    }
    setProgress(1);
  }

  function formatTime(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return [hrs, mins, secs]
      .map((val) => (val < 10 ? `0${val}` : val)) // Add leading zero if needed
      .filter((val, idx) => val !== '00' || idx > 0) // Skip hours if 0
      .join(':');
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
        <ActivityIndicator size="large" color="#3B82F6" />
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
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tutorial?.title || 'Untitled Tutorial'}</Text>
        <View style={{ width: 30 }} /> {/* Spacer */}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Video Player */}
        <View style={styles.videoContainer}>
          {tutorial.videoUrl && player ? (
            <VideoView style={styles.video} player={player} nativeControls contentFit="contain" />
          ) : tutorial.image ? (
            <Image source={{ uri: tutorial.image }} style={styles.video} />
          ) : (
            <Text style={styles.errorText}>No video or image available</Text>
          )}
        </View>

        {/* Metadata */}
        <Text style={styles.subtitle}>
          {tutorial?.subject || 'Unknown Subject'} • {tutorial?.difficulty || 'Unknown Difficulty'}
        </Text>
        <Text style={styles.instructor}>Instructor: {tutorial?.instructor || 'Unknown Instructor'}</Text>

        {/* Progress Tracker */}
        <View style={{ marginBottom: 24 }}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Progress</Text>
            <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
          </View>
          <Progress.Bar
            progress={progress}
            width={null}
            color="#1f5da2"
            unfilledColor="#E5E7EB"
            borderWidth={0}
            height={10}
            borderRadius={8}
          />
          <Text style={styles.timeText}>
            {formatTime(currentTime)} / {formatTime(duration)}
          </Text>
        </View>

        {/* Description */}
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.sectionText}>{tutorial.description || 'No description available.'}</Text>
        </View>

        {/* Objectives */}
        {Array.isArray(tutorial.objectives) && tutorial.objectives.length > 0 && (
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionTitle}>Objectives</Text>
            <View style={{ marginTop: 8 }}>
              {tutorial.objectives.map((obj, i) => (
                <Text key={i} style={styles.bullet}>
                  • {obj || 'No objective available'}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity
          style={[
            styles.ctaButton,
            { backgroundColor: progress >= 0.95 ? '#1f5da2' : '#9CA3AF' }, // gray when locked
          ]}
          onPress={handleMarkComplete}
          disabled={progress < 0.95}
        >
          <Text style={styles.ctaText}>{progress >= 0.95 ? 'Mark as Complete' : 'Watch to Complete'}</Text>
          <Ionicons name="checkmark-circle-outline" size={18} color="#fff" />
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    color: '#6b7280',
    marginTop: 10,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 15,
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1f5da2',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: '#ffffff',
    borderBottomWidth: 0.5,
    borderBottomColor: '#e5e7eb',
    width: '100%',
  },
  backButton: {
    padding: 6,
    marginRight: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: 'Poppins',
    flex: 1,
    width: '100%',
    color: '#111827',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    fontFamily: 'Poppins_Regular',
  },
  videoContainer: {
    width: width - 40,
    height: 200,
    backgroundColor: '#E6F4FE',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 24,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  instructor: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 20,
    fontFamily: 'Poppins_Regular',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontFamily: 'Poppins',
    color: '#111827',
  },
  progressPercent: {
    fontSize: 15,
    color: '#1f5da2',
    fontFamily: 'Poppins_Regular',
  },
  timeText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Poppins_Regular',
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins',
    color: '#111827',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    fontFamily: 'Poppins_Regular',
    color: '#4B5563',
    lineHeight: 22,
  },
  bullet: {
    fontSize: 15,
    fontFamily: 'Poppins_Regular',
    color: '#4B5563',
    marginBottom: 6,
  },
  ctaButton: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1f5da2',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 6,
  },
  ctaText: {
    color: '#fff',
    fontFamily: 'Poppins',
    fontSize: 16,
  },
});
