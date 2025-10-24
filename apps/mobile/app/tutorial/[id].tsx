import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';

const { width } = Dimensions.get('window');

export default function TutorialDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const videoRef = useRef<Video>(null);
  const [progress, setProgress] = useState(0.3);

  function setComplete() {
    setProgress(1);
  }

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tutorial</Text>
        <View style={{ width: 30 }} /> {/* Spacer */}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <Text style={styles.title}>Mastering Topic #{id}</Text>
        <Text style={styles.subtitle}>Interactive learning session with guided exercises</Text>

        {/* Video Player */}
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            style={styles.video}
            source={{
              uri: 'https://www.w3schools.com/html/mov_bbb.mp4', // sample video
            }}
            useNativeControls
            // resizeMode='cover'
          />
        </View>

        {/* Progress Tracker */}
        <View style={styles.progressContainer}>
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
        </View>

        {/* Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.sectionText}>
            This tutorial provides an in-depth look at Topic #{id}, combining video lessons, hands-on exercises, and
            short quizzes to help you learn effectively.
          </Text>
        </View>

        {/* Objectives */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objectives</Text>
          <View style={styles.list}>
            <Text style={styles.bullet}>• Grasp fundamental principles</Text>
            <Text style={styles.bullet}>• Apply knowledge through examples</Text>
            <Text style={styles.bullet}>• Complete short quizzes for retention</Text>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity style={styles.ctaButton} onPress={setComplete}>
          <Text style={styles.ctaText}>Continue</Text>
          <Ionicons name="arrow-forward" size={18} color="#fff" />
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
  },
  backButton: {
    padding: 6,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 20,
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
  progressContainer: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  progressPercent: {
    fontSize: 15,
    color: '#1f5da2',
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
  },
  list: {
    gap: 6,
  },
  bullet: {
    fontSize: 15,
    color: '#4B5563',
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
    fontWeight: '600',
    fontSize: 16,
  },
});
