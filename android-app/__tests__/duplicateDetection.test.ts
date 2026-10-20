import { DuplicateService } from '../src/services/duplicateService';
import { MediaItem } from '../src/types/media';

describe('DuplicateService', () => {
  const items: MediaItem[] = [
    {
      id: 'img_1',
      name: 'IMG-20240101-WA0001.jpg',
      mimeType: 'image/jpeg',
      mediaType: 'image',
      size: 500000, // 500KB
      dateAdded: 1700000000,
      uri: 'content://media/external/images/media/1',
      sourceType: 'mediastore',
    },
    {
      id: 'img_2',
      name: 'IMG-20240102-WA0002.jpg',
      mimeType: 'image/jpeg',
      mediaType: 'image',
      size: 500000, // Same size: identical copy!
      dateAdded: 1700000500,
      uri: 'content://media/external/images/media/2',
      sourceType: 'mediastore',
    },
    {
      id: 'img_3',
      name: 'IMG-20240103-WA0003.jpg',
      mimeType: 'image/jpeg',
      mediaType: 'image',
      size: 120000, // Unique
      dateAdded: 1700000600,
      uri: 'content://media/external/images/media/3',
      sourceType: 'mediastore',
    },
    {
      id: 'vid_4',
      name: 'VID-20240104-WA0004.mp4',
      mimeType: 'video/mp4',
      mediaType: 'video',
      size: 15000000, // 15MB
      dateAdded: 1700000700,
      uri: 'content://media/external/video/media/4',
      sourceType: 'mediastore',
    },
    {
      id: 'vid_5',
      name: 'VID-20240105-WA0005.mp4',
      mimeType: 'video/mp4',
      mediaType: 'video',
      size: 15000000, // Same size video copy!
      dateAdded: 1700000800,
      uri: 'content://media/external/video/media/5',
      sourceType: 'mediastore',
    },
  ];

  it('groups files with identical byte sizes and media types', () => {
    const duplicates = DuplicateService.findExactDuplicates(items);
    expect(duplicates).toHaveLength(2);

    // Sorted by potential reclaimable bytes descending (video 15MB > image 500KB)
    expect(duplicates[0].size).toBe(15000000);
    expect(duplicates[0].items).toHaveLength(2);
    expect(duplicates[0].potentialReclaimableBytes).toBe(15000000);

    expect(duplicates[1].size).toBe(500000);
    expect(duplicates[1].items).toHaveLength(2);
    expect(duplicates[1].potentialReclaimableBytes).toBe(500000);
  });

  it('ignores files below minimum size threshold (<10KB)', () => {
    const tinyItems: MediaItem[] = [
      {
        id: 'img_tiny1',
        name: 'tiny1.jpg',
        mimeType: 'image/jpeg',
        mediaType: 'image',
        size: 512, // Tiny
        dateAdded: 1700000000,
        uri: 'content://media/1',
        sourceType: 'mediastore',
      },
      {
        id: 'img_tiny2',
        name: 'tiny2.jpg',
        mimeType: 'image/jpeg',
        mediaType: 'image',
        size: 512, // Tiny
        dateAdded: 1700000100,
        uri: 'content://media/2',
        sourceType: 'mediastore',
      },
    ];

    const duplicates = DuplicateService.findExactDuplicates(tinyItems);
    expect(duplicates).toHaveLength(0);
  });
});
