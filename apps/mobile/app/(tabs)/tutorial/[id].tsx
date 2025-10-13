// 📄 FILE: app/tutorial/[id].tsx
// Dynamic route for tutorial detail screen

import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TutorialDetail() {
  // Get the 'id' from the URL (e.g., /tutorial/1 → id = "1")
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Tutorial Details</Text>
        <Text style={styles.idText}>ID: {id}</Text>
        <Text style={styles.placeholder}>
          This is where the full tutorial content will go.
          {'\n\n'}You can build video player, notes, quizzes here!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
  },
  idText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  placeholder: {
    fontSize: 16,
    color: '#4B5563',
    lineHeight: 24,
  },
});