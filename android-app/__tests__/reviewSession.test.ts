import { SessionStore } from '../src/storage/sessionStore';

describe('SessionStore Review State Transitions', () => {
  beforeEach(async () => {
    await SessionStore.clearSession();
  });

  it('records decisions and advances current index', async () => {
    await SessionStore.recordDecision('img_1', 'KEEP');
    await SessionStore.recordDecision('img_2', 'DELETE');

    const decisions = await SessionStore.getDecisions();
    expect(decisions['img_1'].decision).toBe('KEEP');
    expect(decisions['img_2'].decision).toBe('DELETE');

    const session = await SessionStore.loadSession();
    expect(session.currentIndex).toBe(2);
    expect(session.history).toHaveLength(2);
  });

  it('correctly reverts the last decision on undo', async () => {
    await SessionStore.recordDecision('img_1', 'DELETE');
    await SessionStore.recordDecision('img_2', 'KEEP');

    let session = await SessionStore.loadSession();
    expect(session.currentIndex).toBe(2);

    // Undo last (img_2)
    const undoResult = await SessionStore.undoLastDecision();
    expect(undoResult).not.toBeNull();
    expect(undoResult?.id).toBe('img_2');
    expect(undoResult?.restoredDecision).toBe('PENDING');

    const decisions = await SessionStore.getDecisions();
    expect(decisions['img_2']).toBeUndefined();
    expect(decisions['img_1'].decision).toBe('DELETE');

    session = await SessionStore.loadSession();
    expect(session.currentIndex).toBe(1);
    expect(session.history).toHaveLength(1);
  });

  it('returns null on undo when history is empty', async () => {
    const result = await SessionStore.undoLastDecision();
    expect(result).toBeNull();
  });

  it('resets all progress on clearSession', async () => {
    await SessionStore.recordDecision('img_1', 'KEEP');
    await SessionStore.clearSession();

    const decisions = await SessionStore.getDecisions();
    expect(Object.keys(decisions)).toHaveLength(0);

    const session = await SessionStore.loadSession();
    expect(session.currentIndex).toBe(0);
    expect(session.history).toHaveLength(0);
  });
});
