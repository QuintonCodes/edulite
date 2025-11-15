import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/contexts/theme-context';
import { Colors, darkColors, lightColors } from '@/styles/theme';
import { authService, profileService } from '@/utils/apiService';
import { EditProfileInput, editProfileSchema } from '@/utils/types';

export default function EditAccount() {
  const { user, updateUser, logout } = useAuth();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const styles = getStyles(colors);

  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    setError,
  } = useForm<EditProfileInput>({
    resolver: zodResolver(editProfileSchema),
    mode: 'onBlur',
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      password: '',
    },
  });

  async function handleUpdate(data: EditProfileInput) {
    try {
      const payload = { ...data };
      if (payload.password === '') {
        delete payload.password;
      }

      const result = await profileService.updateProfile(data, user?.id);

      if (result.error) {
        setError('root', { type: 'server', message: result.error });
        Toast.show({
          type: 'error',
          text1: 'Update Failed',
          text2: result.error,
        });
        return;
      }

      updateUser(result.user);
      Toast.show({
        type: 'success',
        text1: 'Profile update successful',
        text2: 'Your account details have been updated!',
      });

      router.back();
    } catch (error) {
      console.error('Update profile error: ', error);
      setError('root', { type: 'server', message: 'Something went wrong. Please try again later.' });
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        text2: 'Please try again later.',
      });
    }
  }

  async function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (user?.id) {
                await authService.deleteAccount(user.id);
                await logout();
                router.replace('/welcome');
              } else {
                Alert.alert('Error', 'User ID not found.');
              }
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to delete account.');
            }
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={24} color={colors.accent} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Edit Account</Text>
          <Text style={styles.subtitle}>Update your account details below</Text>
        </View>
        <View style={styles.form}>
          {/* Name */}
          <View>
            <View style={[styles.inputContainer, errors.name && styles.inputContainerError]}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.icon} />
              <Controller
                control={control}
                name="name"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    placeholder="Full Name"
                    placeholderTextColor={colors.textSecondary}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    style={styles.input}
                  />
                )}
              />
            </View>
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
          </View>

          {/* Email */}
          <View>
            <View style={[styles.inputContainer, errors.email && styles.inputContainerError]}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.icon} />
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    autoCapitalize="none"
                    placeholder="Email Address"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="email-address"
                    style={styles.input}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
            </View>
            {errors.email && <Text style={styles.errorText}>{errors.email?.message}</Text>}
          </View>

          {/* Password */}
          <View>
            <View style={[styles.inputContainer, errors.password && styles.inputContainerError]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.icon} />
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    onBlur={onBlur}
                    onChangeText={onChange}
                    placeholder="New Password (optional)"
                    placeholderTextColor={colors.textSecondary}
                    secureTextEntry={!showPassword}
                    style={styles.input}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
          </View>

          {/* Server Error Message */}
          {errors.root?.message && <Text style={styles.serverError}>{errors.root.message}</Text>}

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
            onPress={handleSubmit(handleUpdate)}
            disabled={isSubmitting}
          >
            <Text style={styles.saveButtonText}>{isSubmitting ? 'Updating...' : 'Save Changes'}</Text>
          </TouchableOpacity>
        </View>

        {/* Delete Account Section */}
        <View style={styles.deleteSection}>
          <Text style={styles.deleteTitle}>Danger Zone</Text>
          <Text style={styles.deleteSubtitle}>Deleting your account is permanent and cannot be undone.</Text>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
            <Text style={styles.deleteButtonText}>Delete My Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: Colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      flex: 1,
    },
    scrollContent: {
      alignItems: 'center',
      paddingBottom: 40,
      paddingHorizontal: 24,
      paddingTop: 100,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    backButton: {
      padding: 4,
      position: 'absolute',
      top: 50,
      left: 20,
      zIndex: 10,
    },
    title: {
      color: colors.textHeader,
      fontFamily: 'Poppins',
      fontSize: 24,
      marginBottom: 4,
    },
    subtitle: {
      color: colors.textSecondary,
      fontFamily: 'Poppins_Regular',
      fontSize: 16,
      lineHeight: 24,
      textAlign: 'center',
    },
    form: {
      gap: 18,
      maxWidth: 350,
      width: '100%',
    },
    inputContainer: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderColor: colors.border,
      borderRadius: 12,
      borderWidth: 1,
      elevation: 2,
      flexDirection: 'row',
      height: 54,
      paddingHorizontal: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 8,
    },
    inputContainerError: {
      borderColor: colors.danger,
      borderWidth: 1.5,
    },
    icon: {
      marginRight: 10,
      color: colors.textSecondary,
    },
    input: {
      flex: 1,
      color: colors.textPrimary,
      fontFamily: 'Poppins_Regular',
      fontSize: 16,
      paddingVertical: 0,
    },
    eyeButton: {
      padding: 4,
      marginLeft: 4,
    },
    errorText: {
      color: colors.danger,
      fontFamily: 'Poppins_Regular',
      fontSize: 12,
      marginTop: 6,
      paddingHorizontal: 4,
    },
    serverError: {
      backgroundColor: colors.dangerBg,
      borderRadius: 8,
      color: colors.danger,
      fontFamily: 'Poppins_Regular',
      fontSize: 13,
      marginTop: 4,
      paddingHorizontal: 12,
      paddingVertical: 8,
      textAlign: 'center',
    },
    saveButton: {
      backgroundColor: colors.accent,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 10,
    },
    saveButtonDisabled: {
      opacity: 0.7,
    },
    saveButtonText: {
      color: colors.primary,
      fontFamily: 'Poppins',
      fontSize: 16,
    },
    deleteSection: {
      marginTop: 40,
      width: '100%',
      maxWidth: 350,
      padding: 16,
      backgroundColor: colors.primary,
      borderRadius: 12,
      borderColor: colors.danger,
      borderWidth: 1.5,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 4,
    },
    deleteTitle: {
      fontFamily: 'Poppins',
      fontSize: 18,
      color: colors.danger,
      marginBottom: 4,
      textAlign: 'center',
    },
    deleteSubtitle: {
      fontFamily: 'Poppins_Regular',
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },
    deleteButton: {
      backgroundColor: colors.dangerBg,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      borderColor: colors.danger,
      borderWidth: 1,
    },
    deleteButtonText: {
      color: colors.danger,
      fontFamily: 'Poppins',
      fontSize: 16,
    },
  });
