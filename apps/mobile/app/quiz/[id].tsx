import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Progress from 'react-native-progress';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/contexts/theme-context';
import { useQuiz } from '@/hooks/useQuiz';
import { Colors, darkColors, lightColors } from '@/styles/theme';

type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
};

// Helper function to format time
function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export default function QuizScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const styles = getStyles(colors);

  const { data: quizData, isLoading, isError, refetch } = useQuiz(id, type);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);

  // Timer states
  const [elapsedTime, setElapsedTime] = useState(0); // For live timer (in seconds)
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (quizData && !isLoading && !isError) {
      // Reset local state when new quiz data is loaded
      setCurrentQuestionIndex(0);
      setSelectedAnswers([]);
      setQuizCompleted(false);
      setElapsedTime(0);
      setEndTime(null);
      setStartTime(Date.now()); // Start timer
    }
  }, [quizData, isLoading, isError]);

  // Timer logic
  useEffect(() => {
    if (startTime && !quizCompleted && !isLoading) {
      // Start the interval
      timerIntervalRef.current = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
      }, 1000);
    } else if (quizCompleted || isLoading) {
      // Clear interval when quiz is done or loading
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    // Cleanup function
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [startTime, quizCompleted, isLoading]);

  function handleAnswerSelect(optionIndex: number) {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setSelectedAnswers(newAnswers);
  }

  function handleNextQuestion() {
    if (!quizData) return;

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setEndTime(Date.now());
      setQuizCompleted(true);
    }
  }

  function handlePreviousQuestion() {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }

  function calculateQuizScore(): { correct: number; total: number; percentage: number } {
    if (!quizData) return { correct: 0, total: 0, percentage: 0 };

    let correct = 0;
    quizData.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correct++;
      }
    });
    const total = quizData.questions.length;
    return { correct, total, percentage: Math.round((correct / total) * 100) };
  }

  function handleResetQuiz() {
    refetch();
  }

  function handleExit() {
    router.back();
  }

  function calculateTimeTaken() {
    if (!startTime || !endTime) return 0;
    return Math.floor((endTime - startTime) / 1000);
  }

  if (isLoading || !quizData) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading quiz...</Text>
      </View>
    );
  }

  if (isError || !quizData) {
    return (
      <View style={styles.center}>
        <MaterialCommunityIcons name="alert-circle-outline" size={60} color={colors.danger} />
        <Text style={styles.loadingText}>Failed to load quiz.</Text>
        <TouchableOpacity style={styles.retakeButton} onPress={() => refetch()}>
          <Ionicons name="refresh" size={18} color={colors.accent} />
          <Text style={styles.retakeText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleExit} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.accent} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{quizData.title}</Text>
        {!quizCompleted && (
          <View style={styles.timerContainer}>
            <Ionicons name="timer-outline" size={16} color={colors.textPrimary} />
            <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {!quizCompleted ? (
          <QuizView
            questions={quizData.questions}
            currentQuestionIndex={currentQuestionIndex}
            selectedAnswers={selectedAnswers}
            onAnswerSelect={handleAnswerSelect}
            onNext={handleNextQuestion}
            onPrevious={handlePreviousQuestion}
            styles={styles}
            colors={colors}
          />
        ) : (
          <QuizResultsView
            questions={quizData.questions}
            selectedAnswers={selectedAnswers}
            score={calculateQuizScore()}
            timeTakenInSeconds={calculateTimeTaken()}
            onRetake={handleResetQuiz}
            onExit={handleExit}
            styles={styles}
            colors={colors}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Quiz View Component
interface QuizViewProps {
  questions: QuizQuestion[];
  currentQuestionIndex: number;
  selectedAnswers: number[];
  onAnswerSelect: (index: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  styles: ReturnType<typeof getStyles>;
  colors: Colors;
}

function QuizView({
  questions,
  currentQuestionIndex,
  selectedAnswers,
  onAnswerSelect,
  onNext,
  onPrevious,
  styles,
  colors,
}: QuizViewProps) {
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <View>
      <View style={styles.quizInfo}>
        <Text style={styles.quizQuestion}>
          Question {currentQuestionIndex + 1} of {questions.length}
        </Text>
      </View>

      <Progress.Bar
        progress={(currentQuestionIndex + 1) / questions.length}
        width={null}
        color={colors.accent}
        unfilledColor={colors.border}
        borderWidth={0}
        height={8}
        borderRadius={8}
        style={styles.progressBar}
      />

      <View style={styles.quizCard}>
        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.optionsContainer}>
          {currentQuestion.options.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.optionButton,
                selectedAnswers[currentQuestionIndex] === idx && styles.optionButtonSelected,
              ]}
              onPress={() => onAnswerSelect(idx)}
            >
              <View style={styles.optionRadio}>
                {selectedAnswers[currentQuestionIndex] === idx && <View style={styles.optionRadioInner} />}
              </View>
              <Text
                style={[styles.optionText, selectedAnswers[currentQuestionIndex] === idx && styles.optionTextSelected]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.quizNavigation}>
        <TouchableOpacity
          style={[styles.navButton, currentQuestionIndex === 0 && styles.navButtonDisabled]}
          onPress={onPrevious}
          disabled={currentQuestionIndex === 0}
        >
          <Ionicons
            name="chevron-back"
            size={18}
            color={currentQuestionIndex === 0 ? colors.textSecondary : colors.accent}
          />
          <Text style={[styles.navText, currentQuestionIndex === 0 && styles.navTextDisabled]}>Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navButton, styles.navButtonPrimary]} onPress={onNext}>
          <Text style={styles.navTextPrimary}>{isLastQuestion ? 'Finish' : 'Next'}</Text>
          <Ionicons name={isLastQuestion ? 'checkmark' : 'chevron-forward'} size={18} color={colors.textOnAccent} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Quiz Results Component
interface QuizResultsViewProps {
  questions: QuizQuestion[];
  selectedAnswers: number[];
  score: { correct: number; total: number; percentage: number };
  timeTakenInSeconds: number;
  onRetake: () => void;
  onExit: () => void;
  styles: ReturnType<typeof getStyles>;
  colors: Colors;
}

function QuizResultsView({
  questions,
  selectedAnswers,
  score,
  timeTakenInSeconds,
  onRetake,
  onExit,
  styles,
  colors,
}: QuizResultsViewProps) {
  return (
    <View>
      <View style={styles.resultsContainer}>
        <View style={styles.scoreCircle}>
          <MaterialCommunityIcons name="check-circle" size={60} color={colors.success} />
          <Text style={styles.scoreText}>{score.percentage}%</Text>
        </View>

        <Text style={styles.resultsTitle}>Quiz Completed!</Text>
        <Text style={styles.resultsSubtitle}>
          You got {score.correct} out of {score.total} questions correct.
        </Text>

        <View style={styles.timeResultContainer}>
          <Ionicons name="time-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.timeResultText}>Time Taken: {formatTime(timeTakenInSeconds)}</Text>
        </View>

        <View style={styles.resultsBreakdown}>
          {questions.map((q, idx) => (
            <View key={idx} style={styles.resultItem}>
              <View
                style={[
                  styles.resultIcon,
                  selectedAnswers[idx] === q.correctAnswer ? styles.resultIconCorrect : styles.resultIconIncorrect,
                ]}
              >
                <Ionicons
                  name={selectedAnswers[idx] === q.correctAnswer ? 'checkmark' : 'close'}
                  size={16}
                  color="#fff"
                />
              </View>
              <View style={styles.resultContent}>
                <Text style={styles.resultQuestion}>{q.question}</Text>
                <Text style={styles.resultAnswer}>
                  Your answer: {q.options[selectedAnswers[idx]] || 'Not answered'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.resultsActions}>
          <TouchableOpacity style={styles.retakeButton} onPress={onRetake}>
            <Ionicons name="refresh" size={18} color={colors.accent} />
            <Text style={styles.retakeText}>Retake Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.exitButton} onPress={onExit}>
            <Text style={styles.exitText}>Exit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const getStyles = (colors: Colors) =>
  StyleSheet.create({
    screen: {
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 10,
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
      textAlign: 'center',
      color: colors.textHeader,
      marginHorizontal: 8,
    },
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      padding: 20,
      paddingBottom: 60,
    },
    timerContainer: {
      width: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 4,
    },
    timerText: {
      fontSize: 14,
      fontFamily: 'Poppins',
      color: colors.textPrimary,
    },
    quizInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    quizQuestion: {
      fontSize: 14,
      color: colors.textSecondary,
      fontFamily: 'Poppins_Regular',
    },
    timeResultContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: colors.secondary,
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timeResultText: {
      fontSize: 14,
      fontFamily: 'Poppins',
      color: colors.textSecondary,
    },
    progressBar: {
      marginBottom: 24,
    },
    quizCard: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 18,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    questionText: {
      fontSize: 17,
      fontFamily: 'Poppins',
      color: colors.textPrimary,
      marginBottom: 20,
      lineHeight: 24,
    },
    optionsContainer: {
      gap: 12,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderRadius: 10,
      backgroundColor: colors.secondary,
      borderWidth: 2,
      borderColor: colors.border,
    },
    optionButtonSelected: {
      backgroundColor: colors.accentLight,
      borderColor: colors.accent,
    },
    optionRadio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.textSecondary,
      marginRight: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionRadioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.accent,
    },
    optionText: {
      fontSize: 15,
      fontFamily: 'Poppins_Regular',
      color: colors.textSecondary,
      flex: 1,
    },
    optionTextSelected: {
      color: colors.accent,
      fontFamily: 'Poppins',
    },
    quizNavigation: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 24,
    },
    navButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.accent,
      backgroundColor: colors.primary,
      gap: 6,
    },
    navButtonDisabled: {
      opacity: 0.6,
      borderColor: colors.border,
    },
    navButtonPrimary: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    navText: {
      fontSize: 14,
      fontFamily: 'Poppins',
      color: colors.accent,
    },
    navTextDisabled: {
      color: colors.textSecondary,
    },
    navTextPrimary: {
      fontSize: 14,
      fontFamily: 'Poppins',
      color: colors.textOnAccent,
    },
    resultsContainer: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    scoreCircle: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    scoreText: {
      fontSize: 28,
      fontFamily: 'Poppins',
      color: colors.success,
      marginTop: 8,
    },
    resultsTitle: {
      fontSize: 20,
      fontFamily: 'Poppins',
      color: colors.textPrimary,
      marginBottom: 8,
    },
    resultsSubtitle: {
      fontSize: 15,
      fontFamily: 'Poppins_Regular',
      color: colors.textSecondary,
      marginBottom: 24,
      textAlign: 'center',
    },
    resultsBreakdown: {
      width: '100%',
      marginBottom: 24,
    },
    resultItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 16,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    resultIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
      marginTop: 2,
    },
    resultIconCorrect: {
      backgroundColor: colors.success,
    },
    resultIconIncorrect: {
      backgroundColor: colors.danger,
    },
    resultContent: {
      flex: 1,
    },
    resultQuestion: {
      fontSize: 14,
      fontFamily: 'Poppins',
      color: colors.textPrimary,
      marginBottom: 4,
    },
    resultAnswer: {
      fontSize: 13,
      fontFamily: 'Poppins_Regular',
      color: colors.textSecondary,
    },
    resultsActions: {
      width: '100%',
      gap: 12,
    },
    retakeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      paddingVertical: 14,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.accent,
      backgroundColor: colors.accentLight,
      gap: 8,
    },
    retakeText: {
      fontSize: 15,
      fontFamily: 'Poppins',
      color: colors.accent,
    },
    exitButton: {
      width: '100%',
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: colors.accent,
      alignItems: 'center',
    },
    exitText: {
      fontSize: 15,
      fontFamily: 'Poppins',
      color: colors.textOnAccent,
    },
  });
