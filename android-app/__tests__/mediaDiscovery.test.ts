import { MediaDiscoveryService } from '../src/services/mediaDiscovery';
import { MediaItem } from '../src/types/media';

describe('MediaDiscoveryService', () => {
  const mockItems: MediaItem[] = [
    {
      id: 'img_1',
      name: 'IMG-20240101-WA0001.jpg',
      mimeType: 'image/jpeg',
      mediaType: 'image',
      size: 1048576, // 1 MB
      dateAdded: 1704067200,
      uri: 'content://media/external/images/media/1',
      sourceType: 'mediastore',
    },
    {
      id: 'vid_2',
      name: 'VID-20240102-WA0002.mp4',
      mimeType: 'video/mp4',
      mediaType: 'video',
      size: 52428800, // 50 MB
      dateAdded: 1704153600,
      uri: 'content://media/external/video/media/2',
      sourceType: 'mediastore',
    },
    {
      id: 'img_3',
      name: 'IMG-20240103-WA0003.jpg',
      mimeType: 'image/jpeg',
      mediaType: 'image',
      size: 2097152, // 2 MB
      dateAdded: 1704240000,
      uri: 'content://media/external/images/media/3',
      sourceType: 'mediastore',
    },
  ];

  describe('formatBytes', () => {
    it('formats 0 bytes correctly', () => {
      expect(MediaDiscoveryService.formatBytes(0)).toBe('0 B');
      expect(MediaDiscoveryService.formatBytes(-50)).toBe('0 B');
    });

    it('formats bytes, kilobytes, megabytes, and gigabytes accurately', () => {
      expect(MediaDiscoveryService.formatBytes(500)).toBe('500 B');
      expect(MediaDiscoveryService.formatBytes(1024)).toBe('1 KB');
      expect(MediaDiscoveryService.formatBytes(1048576)).toBe('1 MB');
      expect(MediaDiscoveryService.formatBytes(1073741824)).toBe('1 GB');
      expect(MediaDiscoveryService.formatBytes(52428800)).toBe('50 MB');
    });
  });

  describe('formatDuration', () => {
    it('formats video duration ms into mm:ss', () => {
      expect(MediaDiscoveryService.formatDuration(0)).toBe('0:00');
      expect(MediaDiscoveryService.formatDuration(5000)).toBe('0:05');
      expect(MediaDiscoveryService.formatDuration(65000)).toBe('1:05');
      expect(MediaDiscoveryService.formatDuration(3600000)).toBe('60:00');
    });
  });

  describe('sortMedia', () => {
    it('sorts newest first (date_desc)', () => {
      const sorted = MediaDiscoveryService.sortMedia(mockItems, 'date_desc');
      expect(sorted[0].id).toBe('img_3');
      expect(sorted[1].id).toBe('vid_2');
      expect(sorted[2].id).toBe('img_1');
    });

    it('sorts oldest first (date_asc)', () => {
      const sorted = MediaDiscoveryService.sortMedia(mockItems, 'date_asc');
      expect(sorted[0].id).toBe('img_1');
      expect(sorted[2].id).toBe('img_3');
    });

    it('sorts largest first (size_desc)', () => {
      const sorted = MediaDiscoveryService.sortMedia(mockItems, 'size_desc');
      expect(sorted[0].id).toBe('vid_2');
      expect(sorted[1].id).toBe('img_3');
      expect(sorted[2].id).toBe('img_1');
    });

    it('sorts smallest first (size_asc)', () => {
      const sorted = MediaDiscoveryService.sortMedia(mockItems, 'size_asc');
      expect(sorted[0].id).toBe('img_1');
      expect(sorted[1].id).toBe('img_3');
      expect(sorted[2].id).toBe('vid_2');
    });
  });
});
