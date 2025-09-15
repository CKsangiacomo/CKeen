export type ThemeName = 'light' | 'dark';

const TOKENS = {
  light: {
    bg: '#ffffff',
    fg: '#111111',
    border: '#e5e7eb',
    accent: '#111111',
    radius: 8,
    gap: 8,
    pad: 16
  },
  dark: {
    bg: '#111111',
    fg: '#f5f5f5',
    border: '#374151',
    accent: '#f5f5f5',
    radius: 8,
    gap: 8,
    pad: 16
  }
} as const;

export function getTokens(theme: ThemeName = 'light') {
  return (TOKENS as any)[theme] ?? (TOKENS as any).light;
}

export const themes: ThemeName[] = ['light', 'dark'];


