// 📄 FILE: app/login.tsx
// This is the Login screen. It appears when the user taps "Log In" on the Welcome screen.
// It includes fields for email and password, and a "Log In" button.
// After a successful (simulated) login, it navigates to the home screen ('/').

// 🔹 Import necessary tools from React and React Native
import React, { useState } from 'react'; // useState lets us manage form data
import {
    Alert,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

// 🔹 Import navigation tool from Expo Router
import { router } from 'expo-router';

// 🔹 Import icons (same as in welcome.tsx)
import { Ionicons } from '@expo/vector-icons';

// 🔹 Define the LoginScreen component
export default function LoginScreen() {
  // 💡 State to store what the user types in the email field
  const [email, setEmail] = useState<string>('');
  
  // 💡 State to store what the user types in the password field
  const [password, setPassword] = useState<string>('');
  
  // 💡 State to show loading or disable button during "login"
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // 🔹 Function that runs when user taps "Log In"
  const handleLogin = () => {
    // 🚨 Basic validation: check if fields are filled
    if (!email.trim() || !password.trim()) {
      Alert.alert('Oops!', 'Please enter both email and password.');
      return;
    }

    // 🔄 Simulate a network request (e.g., to a server)
    setIsLoading(true);

    // ⏳ Fake delay to mimic real login (2 seconds)
    setTimeout(() => {
      setIsLoading(false);
      
      // ✅ For demo purposes: assume login always succeeds
      // In a real app, you'd check with a backend here
      
      Alert.alert('Success!', 'You are now logged in!', [
        {
          text: 'OK',
          onPress: () => {
            // 🚀 Navigate to the home screen after login
            router.replace('/'); // replace() removes login screen from history
          },
        },
      ]);
    }, 2000);
  };

  // 🔹 Function to go back to the welcome screen
  const handleGoBack = () => {
    router.back(); // Go back to welcome.tsx
  };

  // 🔹 Render the UI
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* 🔙 Back Button */}
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#4285F4" />
        </TouchableOpacity>

        {/* 🎯 Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Sign in to continue your learning</Text>
        </View>

        {/* 📝 Login Form */}
        <View style={styles.form}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail} // Update email state when user types
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#999"
              secureTextEntry // Hides text as dots (••••)
              value={password}
              onChangeText={setPassword} // Update password state when user types
            />
          </View>

          {/* Forgot Password? (optional) */}
          <TouchableOpacity>
            <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>

          {/* 🔐 Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={isLoading} // Disable button while "loading"
          >
            {isLoading ? (
              <Text style={styles.loginButtonText}>Signing in...</Text>
            ) : (
              <Text style={styles.loginButtonText}>Log In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ➕ Sign Up Link */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// 🔹 Styles for the Login screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD', // Light blue background (same as welcome)
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  backButton: {
    marginBottom: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 350,
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  forgotPassword: {
    color: '#4285F4',
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '500',
  },
  loginButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  footerText: {
    color: '#666',
    fontSize: 14,
  },
  footerLink: {
    color: '#4285F4',
    fontSize: 14,
    fontWeight: '600',
  },
});