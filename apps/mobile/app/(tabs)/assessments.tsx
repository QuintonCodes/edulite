import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { router } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { JSX, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import HighlightedText from '@/components/highlighted-text';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { useAssessmentQuizzes } from '@/hooks/useAssessmentQuizzes';
import { usePastPapers } from '@/hooks/usePapers';
import { Colors, darkColors, lightColors } from '@/styles/theme';
import { uploadService } from '@/utils/apiService';
import { PastPaper, Quiz } from '@/utils/types';
import { useQueryClient } from '@tanstack/react-query';

export default function Assessments() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const styles = getStyles(colors);

  const [activeTab, setActiveTab] = useState<'practice' | 'papers'>('practice');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const queryClient = useQueryClient();

  const subjects = [
    'All Subjects',
    'Mathematics',
    'Physical Sciences',
    'Life Sciences',
    'Geography',
    'Accounting',
    'English',
  ];

  const { data: quizzesData, isLoading: isLoadingQuizzes } = useAssessmentQuizzes(selectedSubject);
  const { data: pastPapersData, isLoading: isLoadingPapers } = usePastPapers();

  const filteredQuizzes = useMemo(() => {
    if (!quizzesData) return [];
    if (!searchQuery) return quizzesData;
    return quizzesData.filter(
      (quiz) =>
        quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quiz.description.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [quizzesData, searchQuery]);

  const filteredPapers = useMemo(() => {
    if (!pastPapersData) return [];

    // Filter by Subject
    let papers = pastPapersData;
    if (selectedSubject !== 'All Subjects') {
      papers = papers.filter((paper) => paper.subject === selectedSubject);
    }

    // Filter by Search Query
    if (searchQuery) {
      papers = papers.filter((paper) => paper.fileName.toLowerCase().includes(searchQuery.toLowerCase()));
    }

    return papers;
  }, [pastPapersData, selectedSubject, searchQuery]);

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: false,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      if (asset.mimeType !== 'application/pdf') {
        Toast.show({ type: 'error', text1: 'Invalid File', text2: 'Please select a PDF document.' });
        return;
      }

      setIsUploading(true);
      Toast.show({ type: 'info', text1: 'Uploading...', text2: 'Your past paper is being uploaded.' });

      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType,
      } as any);
      formData.append('subject', selectedSubject === 'All Subjects' ? 'General' : selectedSubject);
      formData.append('userId', user?.id ?? '');

      const response = await uploadService.uploadPastPaper(formData);

      if (response.pastPaperUrl) {
        Toast.show({
          type: 'success',
          text1: 'Upload Complete',
          text2: `${asset.name} has been added successfully.`,
        });
      }
      await queryClient.invalidateQueries({ queryKey: ['pastPapers'] });
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  function handleView(url: string) {
    if (!url) return;
    router.push({
      pathname: '/modal/pdf-viewer',
      params: { url },
    });
  }

  async function handleDownload(url: string, fileName: string) {
    if (!url) return;
    Toast.show({ type: 'info', text1: 'Starting Download...' });
    const fileUri = FileSystem.documentDirectory + fileName;

    try {
      const downloadResumable = FileSystem.createDownloadResumable(url, fileUri, {});

      // 2. Await the download process
      const downloadResult = await downloadResumable.downloadAsync();

      if (!downloadResult || !downloadResult.uri) {
        throw new Error('Download failed, no file URI returned.');
      }

      // 3. Share the downloaded file
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadResult.uri);
      } else {
        Toast.show({ type: 'success', text1: 'Downloaded', text2: 'File saved to app directory.' });
      }
    } catch (error) {
      console.error('Download error:', error);
      Toast.show({ type: 'error', text1: 'Download Failed' });
    }
  }

  function getDifficultyColor(difficulty: string) {
    switch (difficulty) {
      case 'Easy':
        return colors.success;
      case 'Medium':
        return colors.warning;
      case 'Hard':
        return colors.danger;
      default:
        return colors.textSecondary;
    }
  }

  function renderQuizCard(quiz: Quiz) {
    const difficultyColor = getDifficultyColor(quiz.difficulty);
    return (
      <TouchableOpacity key={quiz.id} style={styles.card} activeOpacity={0.9}>
        <View style={styles.cardHeader}>
          <View style={styles.subjectTag}>
            <Text style={styles.subjectText}>{quiz.subject}</Text>
          </View>
          <View style={[styles.difficultyTag, { backgroundColor: difficultyColor }]}>
            <Text style={styles.difficultyText}>{quiz.difficulty}</Text>
          </View>
        </View>

        <HighlightedText text={quiz.title} highlight={searchQuery} style={styles.cardTitle} />
        <HighlightedText text={quiz.description} highlight={searchQuery} style={styles.cardDescription} />

        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{quiz.duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="file-document-edit-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.metaText}>{quiz.questions} questions</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={() => router.push(`/quiz/${quiz.id}?type=assessment`)}>
          <Text style={styles.startButtonText}>Start Quiz</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  function renderPastPaper(paper: PastPaper) {
    return (
      <TouchableOpacity key={paper.id} style={styles.paperCard} activeOpacity={0.9}>
        <View style={styles.paperTop}>
          <View style={styles.fileIcon}>
            <Ionicons name="document-text" size={24} color={colors.accent} />
          </View>
          <View style={styles.paperDetails}>
            <HighlightedText text={paper.fileName} highlight={searchQuery} style={styles.paperFileName} />
            <View style={styles.paperSubjectTag}>
              <Text style={styles.paperSubjectText}>{paper.subject}</Text>
            </View>
          </View>
        </View>

        <View style={styles.paperMeta}>
          <View style={styles.paperMetaItem}>
            <Ionicons name="person-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.paperMetaText}> {paper.uploader}</Text>
          </View>
          <View style={styles.paperMetaItem}>
            <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
            <Text style={styles.paperMetaText}> {paper.uploadDate}</Text>
          </View>
          <Text style={styles.paperMetaText}>{paper.fileSize}</Text>
        </View>

        <View style={styles.paperActions}>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleView(paper.url!)}>
            <Ionicons name="eye-outline" size={16} color={colors.accent} />
            <Text style={styles.actionButtonText}>View</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => handleDownload(paper.url!, paper.fileName)}>
            <Ionicons name="download-outline" size={16} color={colors.accent} />
            <Text style={styles.actionButtonText}>Download</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  function renderContent(isLoading: boolean, data: any[], renderFunc: (item: any) => JSX.Element, emptyText: string) {
    if (isLoading) {
      return <ActivityIndicator size="large" color={colors.accent} style={{ marginTop: 20 }} />;
    }
    if (data.length === 0) {
      return <Text style={styles.emptyText}>{emptyText}</Text>;
    }
    return data.map(renderFunc);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quiz & Assessment</Text>
        <Text style={styles.headerSubtitle}>Test your knowledge and track your progress</Text>
      </View>

      {/* Filter and Search Section */}
      <View style={styles.filterSection}>
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Subject:</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setShowSubjectDropdown(!showSubjectDropdown)}>
            <Text style={styles.dropdownText}>{selectedSubject}</Text>
            <Ionicons name="chevron-down" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Dropdown Menu */}
        {showSubjectDropdown && (
          <View style={styles.dropdownMenu}>
            {subjects.map((subject) => (
              <TouchableOpacity
                key={subject}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedSubject(subject);
                  setShowSubjectDropdown(false);
                }}
              >
                <Text style={[styles.dropdownItemText, selectedSubject === subject && styles.dropdownItemTextActive]}>
                  {subject}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search quizzes or past papers..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'practice' && styles.tabActive]}
          onPress={() => setActiveTab('practice')}
        >
          <Text style={[styles.tabText, activeTab === 'practice' && styles.tabTextActive]}>Practice Quizzes</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'papers' && styles.tabActive]}
          onPress={() => setActiveTab('papers')}
        >
          <Text style={[styles.tabText, activeTab === 'papers' && styles.tabTextActive]}>Past Papers</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'practice' ? (
          <View style={styles.quizGrid}>
            {renderContent(isLoadingQuizzes, filteredQuizzes, renderQuizCard, 'No quizzes found.')}
          </View>
        ) : (
          <View style={styles.papersContainer}>
            <TouchableOpacity
              style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
              onPress={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="cloud-upload-outline" size={18} color={colors.primary} />
              )}
              <Text style={styles.uploadButtonText}>{isUploading ? 'Uploading...' : 'Upload Past Paper'}</Text>
            </TouchableOpacity>
            <View style={styles.papersList}>
              {renderContent(isLoadingPapers, filteredPapers, renderPastPaper, 'No past papers found.')}
            </View>
          </View>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      marginBottom: 35,
    },
    header: {
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      paddingBottom: 10,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    headerTitle: {
      color: colors.textHeader,
      fontFamily: 'Poppins',
      fontSize: 20,
      marginBottom: 4,
    },
    headerSubtitle: {
      color: colors.textSecondary,
      fontFamily: 'Poppins_Regular',
      fontSize: 14,
    },
    filterSection: {
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    filterContainer: {
      alignItems: 'center',
      flexDirection: 'row',
      marginBottom: 12,
    },
    filterLabel: {
      color: colors.textPrimary,
      fontFamily: 'Poppins',
      fontSize: 14,
      marginRight: 8,
    },
    dropdown: {
      alignItems: 'center',
      backgroundColor: colors.secondary,
      borderRadius: 20,
      flexDirection: 'row',
      gap: 8,
      flex: 1,
      minWidth: 150,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    dropdownText: {
      color: colors.textPrimary,
      flex: 1,
      fontFamily: 'Poppins_Regular',
      fontSize: 14,
    },
    dropdownMenu: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      elevation: 3,
      marginTop: 4,
      marginBottom: 12,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    dropdownItem: {
      borderBottomColor: colors.secondary,
      borderBottomWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    dropdownItemText: {
      color: colors.textPrimary,
      fontFamily: 'Poppins_Regular',
      fontSize: 14,
    },
    dropdownItemTextActive: {
      color: colors.accent,
      fontFamily: 'Poppins',
    },
    searchContainer: {
      alignItems: 'center',
      backgroundColor: colors.secondary,
      borderRadius: 20,
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 5,
    },
    searchInput: {
      color: colors.textPrimary,
      flex: 1,
      fontFamily: 'Poppins_Regular',
      fontSize: 14,
    },
    tabContainer: {
      borderRadius: 20,
      backgroundColor: colors.secondary,
      flexDirection: 'row',
      margin: 20,
      padding: 4,
    },
    tab: {
      alignItems: 'center',
      borderRadius: 16,
      flex: 1,
      paddingVertical: 10,
    },
    tabActive: {
      backgroundColor: colors.accent,
    },
    tabText: {
      color: colors.textSecondary,
      fontFamily: 'Poppins_Regular',
      fontSize: 14,
    },
    tabTextActive: {
      color: colors.primary,
      fontFamily: 'Poppins',
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      marginBottom: 40,
    },
    quizGrid: {
      gap: 16,
      paddingBottom: 20,
    },
    card: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      elevation: 3,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    cardHeader: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: 8,
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    subjectTag: {
      backgroundColor: colors.secondary,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    subjectText: {
      color: colors.textPrimary,
      fontFamily: 'Poppins',
      fontSize: 12,
    },
    difficultyTag: {
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    difficultyText: {
      fontFamily: 'Poppins',
      fontSize: 12,
      color: colors.primary,
    },
    cardTitle: {
      fontSize: 16,
      fontFamily: 'Poppins',
      color: colors.textPrimary,
      marginBottom: 8,
      lineHeight: 22,
    },
    cardDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Poppins_Regular',
      marginBottom: 12,
      lineHeight: 20,
    },
    metaInfo: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 16,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metaText: {
      fontFamily: 'Poppins',
      fontSize: 12,
      color: colors.textSecondary,
    },
    startButton: {
      backgroundColor: colors.accent,
      paddingVertical: 12,
      borderRadius: 12,
      alignItems: 'center',
    },
    startButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontFamily: 'Poppins',
    },
    papersContainer: {
      paddingBottom: 20,
    },
    uploadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.accent,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginBottom: 16,
      gap: 8,
    },
    uploadButtonDisabled: {
      backgroundColor: colors.textSecondary,
    },

    uploadButtonText: {
      color: colors.primary,
      fontSize: 14,
      fontFamily: 'Poppins',
    },
    papersList: {
      gap: 16,
    },
    emptyText: {
      textAlign: 'center',
      fontFamily: 'Poppins_Regular',
      color: colors.textSecondary,
      fontSize: 15,
      marginTop: 30,
    },
    paperCard: {
      backgroundColor: colors.primary,
      borderRadius: 20,
      padding: 16,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    paperTop: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    fileIcon: {
      width: 48,
      height: 48,
      backgroundColor: colors.accentLight,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    paperDetails: {
      flex: 1,
    },
    paperFileName: {
      fontSize: 15,
      fontFamily: 'Poppins',
      color: colors.textPrimary,
      marginBottom: 6,
    },
    paperSubjectTag: {
      backgroundColor: colors.secondary,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 4,
      alignSelf: 'flex-start',
    },
    paperSubjectText: {
      fontFamily: 'Poppins',
      fontSize: 12,
      color: colors.textPrimary,
    },
    paperMeta: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      alignItems: 'center',
      marginBottom: 12,
    },
    paperMetaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    paperMetaText: {
      fontFamily: 'Poppins',
      fontSize: 12,
      color: colors.textSecondary,
    },
    paperActions: {
      flexDirection: 'row',
      gap: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: colors.accentLight,
      borderRadius: 10,
    },
    actionButtonText: {
      fontFamily: 'Poppins',
      fontSize: 12,
      color: colors.accent,
    },
  });
