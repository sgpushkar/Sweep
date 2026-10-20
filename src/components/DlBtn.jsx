import { RELEASE, status } from '../release.js';

export function DlBtn({ label, small = false }) {
  const isAvailable = status === 'ready';
  const displayLabel = label || `Download APK · ${RELEASE.size}`;

  if (!isAvailable) {
    return (
      <span className={`dl-btn-disabled ${small ? 'dl-btn-sm' : ''}`}>
        {status === 'error' ? 'Download unavailable' : 'Build in progress'}
      </span>
    );
  }

  const apkHref =
    RELEASE.apkUrl && RELEASE.apkUrl.startsWith('/') && !RELEASE.apkUrl.startsWith('//')
      ? import.meta.env.BASE_URL.replace(/\/$/, '') + RELEASE.apkUrl
      : RELEASE.apkUrl || '#';

  return (
    <a
      href={apkHref}
      download="WhatsAppMediaCleaner.apk"
      className={`dl-btn-main ${small ? 'dl-btn-sm' : ''}`}
      rel="noopener noreferrer"
    >
      <span>{displayLabel}</span>
      <span className="dl-btn-arrow">↓</span>
    </a>
  );
}
