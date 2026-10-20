import { DeletionManager } from '../src/services/deletionManager';
import { MediaItem, ReviewDecisionMap } from '../src/types/media';

describe('DeletionManager', () => {
  const sampleItems: MediaItem[] = [
    {
      id: 'img_1',
      name: 'IMG_001.jpg',
      mimeType: 'image/jpeg',
      mediaType: 'image',
      size: 1000000,
      dateAdded: 1700000000,
      uri: 'content://media/external/images/media/1',
      sourceType: 'mediastore',
    },
    {
      id: 'img_2',
      name: 'IMG_002.jpg',
      mimeType: 'image/jpeg',
      mediaType: 'image',
      size: 2000000,
      dateAdded: 1700000100,
      uri: 'content://media/external/images/media/2',
      sourceType: 'mediastore',
    },
    {
      id: 'vid_3',
      name: 'VID_003.mp4',
      mimeType: 'video/mp4',
      mediaType: 'video',
      size: 30000000,
      dateAdded: 1700000200,
      uri: 'content://media/external/video/media/3',
      sourceType: 'mediastore',
    },
  ];

  it('filters only items explicitly marked DELETE', () => {
    const decisions: ReviewDecisionMap = {
      img_1: { decision: 'DELETE', decidedAt: Date.now() },
      img_2: { decision: 'KEEP', decidedAt: Date.now() },
      // vid_3 is PENDING (no decision)
    };

    const candidates = DeletionManager.getDeletionCandidates(sampleItems, decisions);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].id).toBe('img_1');
  });

  it('never includes KEEP or PENDING items in deletion queue', () => {
    const decisions: ReviewDecisionMap = {
      img_1: { decision: 'KEEP', decidedAt: Date.now() },
      img_2: { decision: 'KEEP', decidedAt: Date.now() },
      vid_3: { decision: 'SKIP', decidedAt: Date.now() },
    };

    const candidates = DeletionManager.getDeletionCandidates(sampleItems, decisions);
    expect(candidates).toHaveLength(0);
  });

  it('accurately calculates total reclaimable byte size', () => {
    const itemsToDelete = [sampleItems[0], sampleItems[2]];
    const reclaimable = DeletionManager.calculateReclaimableSize(itemsToDelete);
    expect(reclaimable).toBe(31000000); // 1,000,000 + 30,000,000
  });

  it('handles empty deletion candidates gracefully', async () => {
    const result = await DeletionManager.executeSafeDeletion([]);
    expect(result.status).toBe('completed');
    expect(result.requestedCount).toBe(0);
    expect(result.deletedCount).toBe(0);
  });
});
