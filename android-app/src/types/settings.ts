export type SwipeSensitivity = 'low' | 'normal' | 'high';

export interface UserSettings {
  hapticFeedbackEnabled: boolean;
  swipeSensitivity: SwipeSensitivity;
  autoAdvanceOnDecision: boolean;
  releaseManifestUrl: string;
  theme: 'dark' | 'amoled';
  includeVideosInReview: boolean;
  includeImagesInReview: boolean;
  sortBy: 'date_desc' | 'date_asc' | 'size_desc' | 'size_asc';
}

export const DEFAULT_SETTINGS: UserSettings = {
  hapticFeedbackEnabled: true,
  swipeSensitivity: 'normal',
  autoAdvanceOnDecision: true,
  releaseManifestUrl: 'https://raw.githubusercontent.com/sgpushkar/Sweep/main/public/release.json',
  theme: 'dark',
  includeVideosInReview: true,
  includeImagesInReview: true,
  sortBy: 'date_desc',
};
