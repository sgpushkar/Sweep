import { useState, useRef, useEffect } from 'react';
import { RELEASE } from '../release.js';
import { SAMPLE_MEDIA } from '../data.js';
import { DlBtn } from './DlBtn.jsx';

export function Hero() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [history, setHistory] = useState([]);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [animatingDir, setAnimatingDir] = useState(null);

  const startXRef = useRef(0);
  const currentItem = SAMPLE_MEDIA[activeIdx % SAMPLE_MEDIA.length];

  const stagedItems = history.filter((h) => h.decision === 'discard');
  const stagedCount = stagedItems.length;
  const stagedMb = stagedItems.reduce((acc, h) => acc + (parseFloat(h.item.size) || 3.0), 0).toFixed(1);

  const handleDecision = (decision) => {
    if (animatingDir) return;
    setAnimatingDir(decision === 'discard' ? 'left' : 'right');

    setTimeout(() => {
      setHistory((prev) => [...prev, { item: currentItem, decision }]);
      setActiveIdx((i) => i + 1);
      setDragOffset(0);
      setAnimatingDir(null);
    }, 200);
  };

  const handleUndo = () => {
    if (history.length === 0 || animatingDir) return;
    setHistory((prev) => prev.slice(0, -1));
    setActiveIdx((i) => Math.max(0, i - 1));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') handleDecision('discard');
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') handleDecision('keep');
      else if (e.key === 'Backspace' || e.key === 'z' || e.key === 'Z') handleUndo();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const onPointerDown = (e) => {
    startXRef.current = e.clientX;
    setIsDragging(true);
    setDragOffset(0);
    if (e.currentTarget.setPointerCapture) {
      try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) {}
    }
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    setDragOffset(e.clientX - startXRef.current);
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset < -60) handleDecision('discard');
    else if (dragOffset > 60) handleDecision('keep');
    else setDragOffset(0);
  };

  let translateX = dragOffset;
  let rotateDeg = dragOffset * 0.05;
  let opacityVal = 1;

  if (animatingDir === 'left') {
    translateX = -320;
    rotateDeg = -12;
    opacityVal = 0;
  } else if (animatingDir === 'right') {
    translateX = 320;
    rotateDeg = 12;
    opacityVal = 0;
  }

  return (
    <section className="hero-section" id="top">
      <div className="container">
        <div className="hero-grid">
          {/* Left: Direct, honest typography */}
          <div className="hero-text">
            <span className="mono-kicker">Android Utility</span>

            <h1 className="hero-title">
              Clean up WhatsApp media with a swipe.
            </h1>

            <p className="hero-lead">
              WhatsApp quietly saves every forwarded video, meme, and screenshot to your device.
              Sweep surfaces them one by one. Swipe left to stage for deletion, right to keep.
              Android confirms the batch before anything is removed.
            </p>

            <div className="hero-actions">
              <DlBtn label={`Download APK · ${RELEASE.size}`} />
              <a
                href={RELEASE.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="secondary-link"
              >
                Source code →
              </a>
            </div>

            <div className="hero-meta-row">
              <span>{RELEASE.minAndroid}</span>
              <span>·</span>
              <span>0 KB Network Traffic</span>
              <span>·</span>
              <span>MediaStore Protocol</span>
            </div>
          </div>

          {/* Right: Quiet, minimal interactive card */}
          <div className="hero-preview">
            <div className="preview-card-frame">
              <div className="preview-card-header">
                <span className="preview-label">Review Card</span>
                <span className="preview-counter">
                  {(activeIdx % SAMPLE_MEDIA.length) + 1} of {SAMPLE_MEDIA.length}
                </span>
              </div>

              {/* Media Card */}
              <div
                className={`preview-media-card ${isDragging ? 'dragging' : ''}`}
                style={{
                  transform: `translate3d(${translateX}px, 0, 0) rotate(${rotateDeg}deg)`,
                  opacity: opacityVal,
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
              >
                <div className="media-image-container">
                  <img src={currentItem.image} alt={currentItem.name} draggable="false" />
                  <div className="media-overlay-tags">
                    <span>{currentItem.type}</span>
                    <span className="tag-size">{currentItem.size}</span>
                  </div>
                </div>

                <div className="media-caption-panel">
                  <span className="caption-text">{currentItem.caption}</span>
                  <span className="caption-sub">{currentItem.origin}</span>
                </div>
              </div>

              {/* Clean Controls */}
              <div className="preview-controls">
                <button
                  type="button"
                  className="control-btn btn-discard"
                  onClick={() => handleDecision('discard')}
                >
                  ← Discard
                </button>

                <button
                  type="button"
                  className="control-btn-undo"
                  onClick={handleUndo}
                  disabled={history.length === 0}
                  title="Undo"
                >
                  ↺
                </button>

                <button
                  type="button"
                  className="control-btn btn-keep"
                  onClick={() => handleDecision('keep')}
                >
                  Keep →
                </button>
              </div>

              {/* Status bar */}
              <div className="preview-footer-status">
                <span>Queued for deletion:</span>
                <span className="status-val">{stagedCount} files ({stagedMb} MB)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
