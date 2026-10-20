import { useState, useEffect } from 'react';
import { RELEASE } from '../release.js';
import { DlBtn } from './DlBtn.jsx';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container header-inner">
        <a href="#top" className="masthead-brand">
          <img src="/favicon.png" alt="Sweep" className="brand-mark" width="22" height="22" />
          <span className="brand-title">Sweep</span>
          <span className="brand-version">v{RELEASE.version}</span>
        </a>

        <div className="header-nav">
          <a href="#how-it-works" className="nav-item">How it works</a>
          <a href="#security" className="nav-item">Security</a>
          <a href="#install" className="nav-item">Install</a>
          <a href="#specs" className="nav-item">Specs</a>
          <a href="#faq" className="nav-item">FAQ</a>
        </div>

        <div className="header-action-group">
          <DlBtn small label={`Get APK · ${RELEASE.size}`} />
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    navigator.clipboard?.writeText(RELEASE.sha256);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <div className="footer-brand">
              <img src="/favicon.png" alt="" width="20" height="20" />
              <span>Sweep</span>
            </div>
            <p className="footer-summary">
              A single-purpose, local-first Android utility for reviewing and clearing WhatsApp media.
              Zero network requests, zero analytics, zero accounts.
            </p>
            <span className="footer-meta">
              Android 8.0 to Android 15 · Hermes Runtime · Apache 2.0
            </span>
          </div>

          <div className="footer-links">
            <span className="footer-heading">Navigation</span>
            <a href="#top">Overview</a>
            <a href="#how-it-works">How it works</a>
            <a href="#security">Privacy & Architecture</a>
            <a href="#install">Sideloading Guide</a>
            <a href={RELEASE.repoUrl} target="_blank" rel="noopener noreferrer">GitHub Source</a>
          </div>

          <div className="footer-verify">
            <span className="footer-heading">Verification</span>
            <div className="checksum-box">
              <div className="checksum-header">
                <span>SHA-256 Checksum</span>
                <button type="button" className="checksum-copy" onClick={copyHash}>
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <code>{RELEASE.sha256}</code>
            </div>
            <p className="footer-disclaimer">
              Sweep is an independent utility, not affiliated with or endorsed by WhatsApp LLC or Meta Platforms.
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          <span>{RELEASE.name} v{RELEASE.version} ({RELEASE.date})</span>
          <span>Free and Open Source</span>
        </div>
      </div>
    </footer>
  );
}

export function NotFound() {
  return (
    <div className="not-found-screen">
      <div className="container text-center">
        <h1 className="editorial-h1">Page not found</h1>
        <p className="editorial-lead">Return to the overview to download the latest release.</p>
        <div style={{ marginTop: '24px' }}>
          <a href="#top" className="dl-btn-main">Back to Overview</a>
        </div>
      </div>
    </div>
  );
}
