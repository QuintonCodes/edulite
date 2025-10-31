import { StyleSheet } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={[styles.toastBase, styles.toastSuccess]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text1NumberOfLines={2}
      text2NumberOfLines={2}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      style={[styles.toastBase, styles.toastError]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text1NumberOfLines={2}
      text2NumberOfLines={2}
    />
  ),

  info: (props: any) => (
    <BaseToast
      {...props}
      style={[styles.toastBase, styles.toastInfo]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text1NumberOfLines={2}
      text2NumberOfLines={2}
    />
  ),
};

const styles = StyleSheet.create({
  toastBase: {
    borderLeftWidth: 6,
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    elevation: 4,
  },
  toastSuccess: {
    borderLeftColor: '#4CAF50', // green
  },
  toastError: {
    borderLeftColor: '#E53935', // red
  },
  toastInfo: {
    borderLeftColor: '#1976D2', // EduLite blue
  },
  contentContainer: {
    paddingHorizontal: 10,
  },
  text1: {
    fontFamily: 'Poppins',
    fontWeight: undefined,
    fontSize: 15,
    color: '#222',
  },
  text2: {
    fontFamily: 'Poppins_Regular',
    fontSize: 13,
    color: '#555',
  },
});
