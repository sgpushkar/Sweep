export interface ReleaseManifest {
  applicationId: string;
  versionCode: number;
  versionName: string;
  releaseDate: string;
  minSdkVersion: number;
  apkUrl: string;
  apkSizeBytes: number | null;
  sha256: string | null;
  releaseNotes: string[];
  repoUrl?: string | null;
  support?: string | null;
  privacyUrl?: string | null;
}

export interface AppInfo {
  packageName: string;
  versionName: string;
  versionCode: number;
  minSdkVersion: number;
  targetSdkVersion: number;
}

export interface DownloadProgress {
  percent: number;
  downloadedBytes: number;
  totalBytes: number;
}

export type UpdateCheckState =
  | 'idle'
  | 'checking'
  | 'up_to_date'
  | 'update_available'
  | 'downloading'
  | 'downloaded'
  | 'verifying'
  | 'ready_to_install'
  | 'installing'
  | 'error';

export interface DownloadResult {
  filePath: string;
  fileSize: number;
  sha256: string;
  checksumVerified: boolean;
  expectedSha256: string | null;
}
