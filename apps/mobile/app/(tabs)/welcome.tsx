import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

type Language = 'english' | 'afrikaans' | null;

export default function WelcomeScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleLanguageSelect = (language: Language) => {
    setSelectedLanguage(language);
    setErrorMessage(''); // Clear error when language is selected
  };

  const handleNavigation = (route: string) => {
    if (!selectedLanguage) {
      setErrorMessage('Please select a language before continuing.');
      return;
    }
    
    // Clear error and navigate
    setErrorMessage('');
    router.push(route as any);
  };

  const handleGuestContinue = () => {
    // Guest can continue without selecting language
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Ionicons name="school" size={40} color="#4285F4" />
          </View>
          <Text style={styles.appName}>EduLite</Text>
          <Text style={styles.subtitle}>Welcome to your learning journey</Text>
        </View>

        {/* Language Selection */}
        <View style={styles.languageSection}>
          <View style={styles.languageHeader}>
            <Ionicons name="globe-outline" size={20} color="#666" />
            <Text style={styles.languageLabel}>Choose your language</Text>
          </View>
          
          <View style={styles.languageButtons}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                selectedLanguage === 'english' && styles.selectedLanguageButton
              ]}
              onPress={() => handleLanguageSelect('english')}
            >
              <View style={styles.languageButtonContent}>
                <Text style={styles.flagEmoji}>🇺🇸</Text>
                <Text style={[
                  styles.languageButtonText,
                  selectedLanguage === 'english' && styles.selectedLanguageText
                ]}>
                  English
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageButton,
                selectedLanguage === 'afrikaans' && styles.selectedLanguageButton
              ]}
              onPress={() => handleLanguageSelect('afrikaans')}
            >
              <View style={styles.languageButtonContent}>
                <Text style={styles.flagEmoji}>🇿🇦</Text>
                <Text style={[
                  styles.languageButtonText,
                  selectedLanguage === 'afrikaans' && styles.selectedLanguageText
                ]}>
                  Afrikaans
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {errorMessage ? (
            <Text style={styles.errorText}>{errorMessage}</Text>
          ) : null}
        </View>

        {/* Navigation Buttons */}
        <View style={styles.navigationSection}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => handleNavigation('/login')}
          >
            <Text style={styles.primaryButtonText}>Log In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => handleNavigation('/signup')}
          >
            <Text style={styles.secondaryButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.guestButton}
            onPress={handleGuestContinue}
          >
            <Ionicons name="person-outline" size={16} color="#666" />
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms of Service
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E3F2FD',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    backgroundColor: 'white',
    paddingVertical: 40,
    paddingHorizontal: 30,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    width: '100%',
    maxWidth: 350,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#E8F0FE',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
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
  languageSection: {
    width: '100%',
    maxWidth: 350,
    marginBottom: 30,
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    justifyContent: 'center',
  },
  languageLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  languageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
  },
  languageButton: {
    flex: 1,
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedLanguageButton: {
    borderColor: '#4285F4',
    backgroundColor: '#F8FAFF',
  },
  languageButtonContent: {
    alignItems: 'center',
  },
  flagEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  languageButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  selectedLanguageText: {
    color: '#4285F4',
    fontWeight: '600',
  },
  errorText: {
    color: '#E53E3E',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    fontWeight: '500',
  },
  navigationSection: {
    width: '100%',
    maxWidth: 350,
    gap: 15,
  },
  primaryButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#4285F4',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderColor: '#4285F4',
    borderWidth: 2,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  secondaryButtonText: {
    color: '#4285F4',
    fontSize: 16,
    fontWeight: '600',
  },
  guestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  guestButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
});