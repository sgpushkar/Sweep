import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  display: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
    color: '#f4f4f5',
  },
  h1: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#f4f4f5',
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: '#f4f4f5',
  },
  h3: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: '#f4f4f5',
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#f4f4f5',
  },
  bodySecondary: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#a1a1aa',
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#a1a1aa',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#71717a',
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#a1a1aa',
  },
};
