import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import { useTheme } from '@/contexts/theme-context';
import { Colors, darkColors, lightColors } from '@/styles/theme';

export default function PdfViewerModal() {
  const { url } = useLocalSearchParams<{ url: string }>();
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;
  const styles = getStyles(colors);

  const encodedUrl = encodeURIComponent(url);
  const pdfUrl =
    Platform.OS === 'ios'
      ? url // iOS WebView can handle direct PDF links
      : `https://docs.google.com/gview?embedded=true&url=${encodedUrl}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close-circle" size={30} color={colors.accent} />
        </TouchableOpacity>
      </View>

      <WebView
        originWhitelist={['*']} // Allows all URLs
        javaScriptEnabled={true} // Needed for the Google viewer
        domStorageEnabled={true} // Needed for the Google viewer
        source={{ uri: pdfUrl }}
        style={{ flex: 1, backgroundColor: colors.background }}
      />
    </SafeAreaView>
  );
}

const getStyles = (colors: Colors) =>
  StyleSheet.create({
    header: {
      padding: 10,
      alignItems: 'flex-end',
      backgroundColor: colors.background,
    },
  });
