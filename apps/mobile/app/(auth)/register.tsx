import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import { useAuth } from '@/contexts/auth-context';
import { useLanguageStore } from '@/hooks/useLanguageStore';
import { RegisterInput, registerSchema } from '@/utils/types';

export default function Register() {
  const { register: registerUser } = useAuth();
  const { selectedLanguage } = useLanguageStore();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      language: selectedLanguage ?? 'english',
    },
  });

  async function onSubmit(data: RegisterInput) {
    try {
      const payload = { ...data, language: selectedLanguage || 'english' };
      const result = await registerUser(payload);

      if (result?.error) {
        setError('root', { type: 'server', message: result.error });
        Toast.show({
          type: 'error',
          text1: 'Registration Failed',
          text2: result.error,
        });
        return;
      }

      Toast.show({
        type: 'success',
        text1: 'Registration Successful',
        text2: 'You can now log in with your credentials.',
      });

      reset();
      router.replace(`/verify?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      console.error('Register error: ', error);
      setError('root', { type: 'server', message: 'Something went wrong. Please try again later.' });
      Toast.show({
        type: 'error',
        text1: 'Something went wrong',
        text2: 'Please try again later.',
      });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔙 Back Button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#4285F4" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 🎯 Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join EduLite and start learning today</Text>
        </View>

        {/* 📝 Register Form */}
        <View style={styles.form}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={20} color="#666" style={{ marginRight: 10 }} />
            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor="#999"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  style={styles.input}
                />
              )}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name.message}</Text>}
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={{ marginRight: 10 }} />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  autoCapitalize="none"
                  placeholder="Email Address"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  style={styles.input}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email?.message}</Text>}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={{ marginRight: 10 }} />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  placeholder="Password"
                  placeholderTextColor="#999"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  secureTextEntry
                  style={styles.input}
                />
              )}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password?.message}</Text>}
          </View>

          {errors.root?.message && <Text style={styles.serverError}>{errors.root.message}</Text>}

          {/* 🔐 Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, isSubmitting && styles.signUpButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text style={styles.signUpButtonText}>{isSubmitting ? 'Creating account...' : 'Create account'}</Text>
          </TouchableOpacity>
        </View>

        {/* 🔑 Login Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.footerLink}>Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e3f2fd',
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 24,
    paddingTop: 100,
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    elevation: 3,
    height: 38,
    justifyContent: 'center',
    left: 20,
    position: 'absolute',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    top: 50,
    width: 38,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    color: '#1976d2',
    fontFamily: 'Poppins',
    fontSize: 24,
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
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
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    borderRadius: 12,
    borderWidth: 1,
    elevation: 2,
    flexDirection: 'row',
    height: 54,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  input: {
    color: '#333',
    flex: 1,
    fontFamily: 'Poppins_Regular',
    fontSize: 16,
    paddingVertical: 0,
  },
  errorText: {
    color: '#e53e3e',
    fontFamily: 'Poppins',
    fontSize: 14,
    marginTop: 4,
  },
  serverError: {
    color: '#e53e3e',
    fontFamily: 'Poppins',
    marginTop: 8,
    textAlign: 'center',
  },
  signUpButton: {
    alignItems: 'center',
    backgroundColor: '#4285f4',
    borderRadius: 12,
    marginTop: 10,
    paddingVertical: 16,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: '#fff',
    fontFamily: 'Poppins',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#666',
    fontFamily: 'Poppins_Regular',
    fontSize: 14,
  },
  footerLink: {
    color: '#4285f4',
    fontFamily: 'Poppins',
    fontSize: 14,
  },
});
