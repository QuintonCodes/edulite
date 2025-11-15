import { useTheme } from '@/contexts/theme-context';
import { Colors, darkColors, lightColors } from '@/styles/theme';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type NotificationType = 'all' | 'tutorials' | 'quizzes' | 'updates';

type Notification = {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  iconColor: string;
  backgroundColor: string;
  isUnread?: boolean;
  type: 'tutorial' | 'quiz' | 'update' | 'general';
};

export default function Notifications() {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors; // Get color palette
  const styles = getStyles(colors);

  const [activeFilter, setActiveFilter] = useState<NotificationType>('all');

  const todayNotifications: Notification[] = [
    {
      id: '1',
      title: 'Quiz Graded',
      description: "Your score for 'History of Rome' is 95%.",
      time: '15m ago',
      icon: 'checkmark-circle-outline',
      iconColor: '#10b981',
      backgroundColor: '#d1fae5',
      isUnread: true,
      type: 'quiz',
    },
    {
      id: '2',
      title: 'New Tutorial Available',
      description: "'Advanced Algebra - Chapter 3' is now available.",
      time: '2h ago',
      icon: 'play-circle-outline',
      iconColor: '#3b82f6',
      backgroundColor: '#dbeafe',
      isUnread: true,
      type: 'tutorial',
    },
    {
      id: '3',
      title: 'Achievement Unlocked',
      description: "You've earned the 'Week Warrior' badge!",
      time: '3h ago',
      icon: 'trophy-outline',
      iconColor: '#f59e0b',
      backgroundColor: '#fef3c7',
      isUnread: true,
      type: 'general',
    },
  ];

  const yesterdayNotifications: Notification[] = [
    {
      id: '4',
      title: 'App Update',
      description: 'Version 2.1 is here with new features!',
      time: '1d ago',
      icon: 'information-circle-outline',
      iconColor: '#8b5cf6',
      backgroundColor: '#ede9fe',
      type: 'update',
    },
    {
      id: '5',
      title: 'Quiz Reminder',
      description: "Quiz on 'Cell Biology' is due tomorrow.",
      time: '1d ago',
      icon: 'alarm-outline',
      iconColor: '#ef4444',
      backgroundColor: '#fee2e2',
      type: 'quiz',
    },
    {
      id: '6',
      title: 'Course Progress',
      description: "You're 75% through 'World History'!",
      time: '1d ago',
      icon: 'trending-up-outline',
      iconColor: '#06b6d4',
      backgroundColor: '#cffafe',
      type: 'general',
    },
  ];

  const filters: { label: string; value: NotificationType }[] = [
    { label: 'All', value: 'all' },
    { label: 'Tutorials', value: 'tutorials' },
    { label: 'Quizzes', value: 'quizzes' },
    { label: 'Updates', value: 'updates' },
  ];

  function filterNotifications(notifications: Notification[]) {
    if (activeFilter === 'all') return notifications;

    const filterMap: Record<NotificationType, string[]> = {
      all: [],
      tutorials: ['tutorial'],
      quizzes: ['quiz'],
      updates: ['update'],
    };

    return notifications.filter((n) => filterMap[activeFilter].includes(n.type));
  }

  const filteredTodayNotifications = filterNotifications(todayNotifications);
  const filteredYesterdayNotifications = filterNotifications(yesterdayNotifications);

  const renderNotificationItem = (notification: Notification) => (
    <TouchableOpacity key={notification.id} style={styles.notificationItem} activeOpacity={0.7}>
      <View style={[styles.iconContainer, { backgroundColor: notification.backgroundColor }]}>
        <Ionicons name={notification.icon as any} size={24} color={notification.iconColor} />
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text style={styles.notificationTitle} numberOfLines={1}>
            {notification.title}
          </Text>
          <View style={styles.timeContainer}>
            <Text style={styles.notificationTime}>{notification.time}</Text>
            {notification.isUnread && <View style={styles.unreadDot} />}
          </View>
        </View>
        <Text style={styles.notificationDescription} numberOfLines={2}>
          {notification.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.accent} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="checkmark-done-outline" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[styles.filterButton, activeFilter === filter.value && styles.filterButtonActive]}
              onPress={() => setActiveFilter(filter.value)}
              activeOpacity={0.7}
            >
              <Text style={[styles.filterButtonText, activeFilter === filter.value && styles.filterButtonTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
        {/* Today Section */}
        {filteredTodayNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today</Text>
            <View style={styles.notificationsGroup}>{filteredTodayNotifications.map(renderNotificationItem)}</View>
          </View>
        )}

        {/* Yesterday Section */}
        {filteredYesterdayNotifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yesterday</Text>
            <View style={styles.notificationsGroup}>{filteredYesterdayNotifications.map(renderNotificationItem)}</View>
          </View>
        )}

        {/* Empty State */}
        {filteredTodayNotifications.length === 0 && filteredYesterdayNotifications.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color="#d1d5db" />
            <Text style={styles.emptyStateTitle}>No notifications</Text>
            <Text style={styles.emptyStateDescription}>You&apos;re all caught up! Check back later for updates.</Text>
          </View>
        )}

        <View style={{ height: 30 }} />
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingTop: 30,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 38,
      height: 38,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 3,
    },
    headerTitle: {
      fontSize: 24,
      fontFamily: 'Poppins',
      color: colors.textHeader,
      flex: 1,
      textAlign: 'center',
    },
    headerActions: {
      width: 38,
      alignItems: 'flex-end',
    },
    iconButton: {
      width: 38,
      height: 38,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 3,
    },
    filterSection: {
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    filterContainer: {
      paddingHorizontal: 20,
      gap: 8,
      backgroundColor: colors.background,
    },
    filterButton: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.secondary,
    },
    filterButtonActive: {
      backgroundColor: colors.accent,
    },
    filterButtonText: {
      fontSize: 14,
      fontFamily: 'Poppins_Regular',
      color: colors.textSecondary,
    },
    filterButtonTextActive: {
      color: colors.primary,
      fontFamily: 'Poppins',
    },
    notificationsList: {
      flex: 1,
    },
    section: {
      marginTop: 24,
      paddingHorizontal: 20,
    },
    sectionTitle: {
      fontSize: 16,
      fontFamily: 'Poppins',
      color: colors.textPrimary,
      marginBottom: 12,
    },
    notificationsGroup: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    notificationItem: {
      flexDirection: 'row',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    notificationContent: {
      flex: 1,
    },
    notificationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
      gap: 8,
    },
    notificationTitle: {
      fontSize: 15,
      fontFamily: 'Poppins',
      color: colors.textPrimary,
      flex: 1,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    notificationTime: {
      fontSize: 12,
      fontFamily: 'Poppins_Regular',
      color: colors.textSecondary,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.accent,
    },
    notificationDescription: {
      fontSize: 13,
      fontFamily: 'Poppins_Regular',
      color: colors.textSecondary,
      lineHeight: 18,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 80,
      paddingHorizontal: 40,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontFamily: 'Poppins',
      color: colors.textPrimary,
      marginTop: 16,
      marginBottom: 8,
    },
    emptyStateDescription: {
      fontSize: 14,
      fontFamily: 'Poppins_Regular',
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
