export type MediaType = 'image' | 'video';

export type ReviewDecision = 'KEEP' | 'DELETE' | 'SKIP' | 'PENDING';

export type MediaSourceType = 'mediastore' | 'saf';

export interface MediaItem {
  id: string; // e.g. "img_12345" or "vid_67890"
  mediaStoreId?: number;
  uri: string; // content:// URI or file path
  name: string; // e.g. "IMG-20240214-WA0012.jpg"
  mimeType: string; // e.g. "image/jpeg", "video/mp4"
  mediaType: MediaType;
  size: number; // in bytes
  relativePath?: string;
  dateAdded: number; // timestamp in seconds
  dateModified?: number; // timestamp in seconds
  width?: number;
  height?: number;
  duration?: number; // duration in ms for video
  sourceType: MediaSourceType;
  isUnavailable?: boolean;
}

export interface ReviewStateItem {
  decision: ReviewDecision;
  decidedAt: number;
}

export type ReviewDecisionMap = Record<string, ReviewStateItem>;

export interface ScanSummary {
  totalCount: number;
  imageCount: number;
  videoCount: number;
  totalSizeBytes: number;
  items: MediaItem[];
  scannedAt: number;
  isPartialAccess?: boolean;
  permissionStatus?: 'granted' | 'partial' | 'denied' | 'not_determined';
}

export interface DeleteResult {
  status: 'completed' | 'partial' | 'cancelled' | 'error';
  requestedCount: number;
  deletedCount: number;
  deletedUris: string[];
  failedUris: string[];
  errorMessage?: string;
}

export interface PermissionStatus {
  status: 'granted' | 'partial' | 'denied' | 'not_determined';
  canReadImages: boolean;
  canReadVideos: boolean;
  isPartialAccess: boolean;
  apiLevel: number;
}
