import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/auth-context';
import { VerifyFormInput, verifySchema } from '@/utils/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';

export default function Verify() {
  const { email } = useLocalSearchParams();
  const { verify, resendCode } = useAuth();

  const [resendTimer, setResendTimer] = useState(0);
  const inputs = [useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null), useRef<TextInput>(null)];

  const {
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { isSubmitting, errors },
    watch,
    reset,
  } = useForm<VerifyFormInput>({
    resolver: zodResolver(verifySchema),
    defaultValues: { otp: '' },
  });

  const otp = watch('otp');

  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer((t) => t - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  function handleDigitChange(value: string, index: number) {
    if (!/^\d*$/.test(value)) return; // only digits

    const newOtp = otp.split('');
    newOtp[index] = value;
    const joined = newOtp.join('');
    setValue('otp', joined);

    if (value && index < 3) inputs[index + 1].current?.focus();
    else if (!value && index > 0) inputs[index - 1].current?.focus();

    if (joined.length === 4) {
      Keyboard.dismiss();
      handleSubmit(onVerify)();
    }
  }

  async function onVerify(data: VerifyFormInput) {
    try {
      const result = await verify(email as string, data.otp);

      if (result.error) {
        setError('otp', { message: result.error });
        Toast.show({
          type: 'error',
          text1: 'Verification Failed',
          text2: result.error,
        });
        // Clear OTP fields on error
        reset();
        inputs[0].current?.focus();
        return;
      }

      Toast.show({
        type: 'success',
        text1: 'Email Verified',
        text2: 'Your account has been verified successfully',
      });

      setTimeout(() => {
        router.replace('/');
      }, 500);
    } catch (error) {
      const errorMessage = 'Unexpected error occurred. Please try again.';
      setError('otp', { message: errorMessage });
      Toast.show({
        type: 'error',
        text1: 'Verification Failed',
        text2: errorMessage,
      });
      console.error('Verification error:', error);
      reset();
      inputs[0].current?.focus();
    }
  }

  async function onResend() {
    if (resendTimer > 0) return;

    try {
      const result = await resendCode(email as string);

      if (result?.error) {
        Toast.show({
          type: 'error',
          text1: 'Resend Failed',
          text2: result.error,
        });
        return;
      }

      Toast.show({
        type: 'success',
        text1: 'Code Sent',
        text2: 'A new verification code has been sent to your email',
      });

      setResendTimer(30); // 30s cooldown
      reset();
      inputs[0].current?.focus();
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Resend Failed',
        text2: 'Failed to resend code. Please try again.',
      });
      console.error('Resend error:', error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#4285f4" />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={styles.title}>Verify Email</Text>
        <Text style={styles.subtitle}>
          We&apos;ve sent a 4-digit code to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <Controller
          control={control}
          name="otp"
          render={({ field: { value } }) => (
            <View style={styles.otpContainer}>
              {[0, 1, 2, 3].map((index) => (
                <TextInput
                  key={index}
                  ref={inputs[index]}
                  style={[styles.otpInput, value[index] && styles.otpInputFilled, errors.otp && styles.otpInputError]}
                  value={value[index] || ''}
                  onChangeText={(v) => handleDigitChange(v, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>
          )}
        />

        {/* Error Message */}
        {errors.otp && <Text style={styles.errorText}>{errors.otp.message}</Text>}

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyButton, isSubmitting && styles.verifyButtonDisabled]}
          onPress={handleSubmit(onVerify)}
          disabled={isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.verifyButtonText}>Verify</Text>}
        </TouchableOpacity>

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn&apos;t receive the code? </Text>
          <TouchableOpacity onPress={onResend} disabled={resendTimer > 0}>
            <Text style={[styles.resendLink, resendTimer > 0 && styles.resendLinkDisabled]}>
              {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend'}
            </Text>
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
  title: {
    color: '#1976d2',
    fontFamily: 'Poppins',
    fontSize: 28,
    marginBottom: 4,
  },
  subtitle: {
    color: '#666',
    fontFamily: 'Poppins_Regular',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  email: {
    color: '#1976d2',
    fontFamily: 'Poppins',
  },
  otpContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginVertical: 20,
  },
  otpInput: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    color: '#1e293b',
    elevation: 2,
    fontFamily: 'Poppins',
    fontSize: 24,
    flex: 1,
    height: 64,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    textAlign: 'center',
  },
  otpInputFilled: {
    borderColor: '#4285F4',
  },
  otpInputError: {
    borderColor: '#e53e3e',
  },
  errorText: {
    color: '#e53e3e',
    fontFamily: 'Poppins_Regular',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  verifyButton: {
    alignItems: 'center',
    backgroundColor: '#4285f4',
    borderRadius: 16,
    elevation: 4,
    height: 56,
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#4285f4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    width: '100%',
  },
  verifyButtonDisabled: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: '#fff',
    fontFamily: 'Poppins',
    fontSize: 16,
  },
  resendContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  resendText: {
    color: '#64748b',
    fontFamily: 'Poppins_Regular',
    fontSize: 14,
  },
  resendLink: {
    color: '#4285F4',
    fontFamily: 'Poppins',
    fontSize: 14,
  },
  resendLinkDisabled: {
    opacity: 0.5,
  },
});
