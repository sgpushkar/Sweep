import { TextStyle } from 'react-native';

export const typography: Record<string, TextStyle> = {
  display: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.8,
    color: '#F1F5F9',
  },
  h1: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#F1F5F9',
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.3,
    color: '#F1F5F9',
  },
  h3: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: -0.2,
    color: '#F1F5F9',
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#F1F5F9',
  },
  bodySecondary: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    color: '#94A3B8',
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    color: '#94A3B8',
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#64748B',
  },
  mono: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: '#94A3B8',
  },
};
