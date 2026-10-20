import { MediaItem, ReviewDecision, ReviewDecisionMap, ScanSummary } from '../types/media';
import { WhatsAppCleanerNativeBridge } from '../native/WhatsAppCleanerNative';

export interface SavedSession {
  version: number;
  lastScanTimestamp: number;
  currentIndex: number;
  decisions: ReviewDecisionMap;
  history: Array<{ id: string; previousDecision: ReviewDecision; newDecision: ReviewDecision }>;
}

const SESSION_KEY = 'review_session_v1';
const CACHED_SCAN_KEY = 'cached_scan_v1';

export class SessionStore {
  private static inMemorySession: SavedSession = {
    version: 1,
    lastScanTimestamp: 0,
    currentIndex: 0,
    decisions: {},
    history: [],
  };

  static async loadSession(): Promise<SavedSession> {
    const data = await WhatsAppCleanerNativeBridge.loadData<SavedSession>(SESSION_KEY);
    if (data && data.version === 1) {
      this.inMemorySession = data;
    }
    return this.inMemorySession;
  }

  static async saveSession(session: SavedSession): Promise<void> {
    this.inMemorySession = session;
    await WhatsAppCleanerNativeBridge.saveData(SESSION_KEY, session);
  }

  static async getDecisions(): Promise<ReviewDecisionMap> {
    const s = await this.loadSession();
    return s.decisions;
  }

  static async recordDecision(id: string, decision: ReviewDecision): Promise<void> {
    const s = await this.loadSession();
    const prev = s.decisions[id]?.decision || 'PENDING';

    s.decisions[id] = {
      decision,
      decidedAt: Date.now(),
    };

    s.history.push({
      id,
      previousDecision: prev,
      newDecision: decision,
    });

    s.currentIndex = Math.max(0, s.currentIndex + 1);
    await this.saveSession(s);
  }

  static async undoLastDecision(): Promise<{ id: string; restoredDecision: ReviewDecision } | null> {
    const s = await this.loadSession();
    if (s.history.length === 0) return null;

    const lastAction = s.history.pop()!;
    if (lastAction.previousDecision === 'PENDING') {
      delete s.decisions[lastAction.id];
    } else {
      s.decisions[lastAction.id] = {
        decision: lastAction.previousDecision,
        decidedAt: Date.now(),
      };
    }

    s.currentIndex = Math.max(0, s.currentIndex - 1);
    await this.saveSession(s);

    return {
      id: lastAction.id,
      restoredDecision: lastAction.previousDecision,
    };
  }

  static async clearSession(): Promise<void> {
    this.inMemorySession = {
      version: 1,
      lastScanTimestamp: 0,
      currentIndex: 0,
      decisions: {},
      history: [],
    };
    await this.saveSession(this.inMemorySession);
  }

  static async saveScanCache(summary: ScanSummary): Promise<void> {
    await WhatsAppCleanerNativeBridge.saveData(CACHED_SCAN_KEY, summary);
  }

  static async loadScanCache(): Promise<ScanSummary | null> {
    return await WhatsAppCleanerNativeBridge.loadData<ScanSummary>(CACHED_SCAN_KEY);
  }
}
