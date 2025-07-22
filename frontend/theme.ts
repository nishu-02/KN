import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { createContext, useContext } from 'react';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#6D4C41',
    secondary: '#BCAAA4',
    background: '#F5F5F5',
    card: '#FFFFFF',
    text: '#222',
    subtext: '#888',
    critical: '#FFCDD2',
    high: '#FFE0B2',
    moderate: '#FFF9C4',
    low: '#C8E6C9',
    accent: '#F5F5F5',
    shadow: 'rgba(0,0,0,0.08)',
    border: '#E0E0E0', // required for navigation
    notification: '#FF7043', // required for navigation
    // UserBottomTabs palette
    tabBackground1: '#F5F5DC',
    tabBackground2: '#DEB887',
    tabBackground3: '#D2B48C',
    tabBackground4: '#CD853F',
    tabActive: '#8B4513',
    tabInactive: '#A0826D',
    cameraGradient1: '#D2691E',
    cameraGradient2: '#8B4513',
    cameraGradient3: '#654321',
    cameraBorder: '#F5F5DC',
  },
  cardShadow: {
    shadowColor: 'rgba(0,0,0,0.12)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 12,
    elevation: 6,
  },
  spacing: {
    radius: 16,
    padding: 16,
    margin: 16,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#BCAAA4',
    secondary: '#6D4C41',
    background: '#181818',
    card: '#232323',
    text: '#F5F5F5',
    subtext: '#B0B0B0',
    critical: '#FF8A80',
    high: '#FFD180',
    moderate: '#FFF59D',
    low: '#A5D6A7',
    accent: '#232323',
    shadow: 'rgba(0,0,0,0.32)',
    border: '#333', // required for navigation
    notification: '#FFAB91', // required for navigation
    // UserBottomTabs palette (dark variants)
    tabBackground1: '#23231A',
    tabBackground2: '#6D4C41',
    tabBackground3: '#8B6F4E',
    tabBackground4: '#654321',
    tabActive: '#F5F5DC',
    tabInactive: '#A0826D',
    cameraGradient1: '#8B4513',
    cameraGradient2: '#654321',
    cameraGradient3: '#23231A',
    cameraBorder: '#F5F5DC',
  },
  cardShadow: {
    shadowColor: 'rgba(0,0,0,0.32)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.32,
    shadowRadius: 12,
    elevation: 8,
  },
  spacing: {
    radius: 16,
    padding: 16,
    margin: 16,
  },
};

export const ThemeContext = createContext({
  theme: lightTheme,
  toggleTheme: () => {},
  isDark: false,
});

export function useThemeContext() {
  return useContext(ThemeContext);
} 