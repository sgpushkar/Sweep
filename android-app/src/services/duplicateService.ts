import { MediaItem } from '../types/media';

export interface DuplicateGroup {
  size: number;
  items: MediaItem[];
  potentialReclaimableBytes: number;
}

export class DuplicateService {
  /**
   * Identifies candidate exact duplicates based on identical byte size and media type.
   * Only groups items with size > 10KB to avoid trivial zero-byte or tiny icon collisions.
   */
  static findExactDuplicates(items: MediaItem[]): DuplicateGroup[] {
    const sizeMap = new Map<string, MediaItem[]>();

    for (const item of items) {
      if (item.size < 10240) continue; // Skip items under 10KB
      const key = `${item.mediaType}_${item.size}`;
      const group = sizeMap.get(key) || [];
      group.push(item);
      sizeMap.set(key, group);
    }

    const duplicates: DuplicateGroup[] = [];

    for (const [, group] of sizeMap.entries()) {
      if (group.length > 1) {
        // Sort newest first
        group.sort((a, b) => (b.dateAdded || 0) - (a.dateAdded || 0));
        // Potential reclaimed is (count - 1) * size
        const potentialReclaimable = (group.length - 1) * group[0].size;
        duplicates.push({
          size: group[0].size,
          items: group,
          potentialReclaimableBytes: potentialReclaimable,
        });
      }
    }

    // Sort by largest potential reclaimable space
    return duplicates.sort((a, b) => b.potentialReclaimableBytes - a.potentialReclaimableBytes);
  }
}
