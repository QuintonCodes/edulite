import { Text } from 'react-native';

import { useTheme } from '@/contexts/theme-context';
import { darkColors, lightColors } from '@/styles/theme';

type HighlightedTextProps = {
  text: string;
  highlight: string;
  style: any;
};

export default function HighlightedText({ text, highlight, style }: HighlightedTextProps) {
  const { theme } = useTheme();
  const colors = theme === 'dark' ? darkColors : lightColors;

  if (!highlight.trim()) {
    return <Text style={style}>{text}</Text>;
  }

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <Text style={style}>
      {parts.map((part, index) =>
        regex.test(part) ? (
          <Text key={index} style={{ backgroundColor: colors.warning, color: colors.primary }}>
            {part}
          </Text>
        ) : (
          <Text key={index}>{part}</Text>
        ),
      )}
    </Text>
  );
}
