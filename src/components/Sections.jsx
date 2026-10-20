import { useState } from 'react';
import { RELEASE } from '../release.js';
import { EDITORIAL_FAQ } from '../data.js';
import { DlBtn } from './DlBtn.jsx';

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Index locally',
      desc: 'Queries Android’s MediaStore index in under 300ms. Runs entirely on-device with zero network transmissions.',
    },
    {
      num: '02',
      title: 'Swipe to triage',
      desc: 'Swipe left to stage a file for removal, right to preserve it. Files remain untouched until you review the queue.',
    },
    {
      num: '03',
      title: 'Confirm with Android',
      desc: 'Android’s own system prompt asks you to authorize the batch delete. Sweep never erases files without approval.',
    },
  ];

  return (
    <section id="how-it-works" className="editorial-section border-top">
      <div className="container">
        <div className="section-header">
          <span className="mono-kicker">Protocol</span>
          <h2 className="section-title">How it works.</h2>
        </div>

        <div className="steps-grid">
          {steps.map((st) => (
            <div key={st.num} className="step-item">
              <span className="step-num">{st.num}</span>
              <h3 className="step-title">{st.title}</h3>
              <p className="step-desc">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SecurityAndPrivacy() {
  const guarantees = [
    {
      title: 'Zero Network Access',
      desc: 'Sweep declares zero internet permissions in its Android manifest. It is physically impossible for the app to send data to any remote server.',
    },
    {
      title: 'Safe MediaStore API',
      desc: 'Deletions are handed off to Android’s native MediaStore.createDeleteRequest(). The operating system itself owns the final confirmation.',
    },
    {
      title: 'Hermes Runtime',
      desc: 'Precompiled Ahead-of-Time JavaScript bytecode ensures instant startup, low memory footprint, and consistent 60fps pan gestures.',
    },
  ];

  return (
    <section id="security" className="editorial-section border-top">
      <div className="container">
        <div className="section-header">
          <span className="mono-kicker">Architecture</span>
          <h2 className="section-title">Built for privacy.</h2>
        </div>

        <div className="guarantees-grid">
          {guarantees.map((g, idx) => (
            <div key={idx} className="guarantee-card">
              <h3 className="guarantee-title">{g.title}</h3>
              <p className="guarantee-desc">{g.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function InstallGuide() {
  const steps = [
    {
      num: '1',
      title: 'Download the APK',
      desc: 'Save WhatsAppMediaCleaner.apk to your phone directly from this page.',
    },
    {
      num: '2',
      title: 'Allow Installation',
      desc: 'When Android prompts, toggle "Install unknown apps" in system settings.',
    },
    {
      num: '3',
      title: 'Review and clean',
      desc: 'Open Sweep, grant media read permission, and swipe through your WhatsApp files.',
    },
  ];

  return (
    <section id="install" className="editorial-section border-top">
      <div className="container">
        <div className="section-header">
          <span className="mono-kicker">Distribution</span>
          <h2 className="section-title">Installing on Android.</h2>
        </div>

        <div className="install-grid">
          {steps.map((st) => (
            <div key={st.num} className="install-col">
              <span className="install-step-badge">Step {st.num}</span>
              <h3 className="install-col-title">{st.title}</h3>
              <p className="install-col-desc">{st.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SpecsSection() {
  const [copied, setCopied] = useState(false);

  const copyHash = () => {
    navigator.clipboard?.writeText(RELEASE.sha256);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const specs = [
    { label: 'Package', val: 'com.whatsappmediacleaner' },
    { label: 'Version', val: `v${RELEASE.version}` },
    { label: 'Binary Size', val: RELEASE.size },
    { label: 'Compatibility', val: `${RELEASE.minAndroid} through Android 15` },
    { label: 'Architectures', val: 'arm64-v8a, armeabi-v7a, x86_64' },
    { label: 'Permissions', val: 'READ_MEDIA_IMAGES, READ_MEDIA_VIDEO' },
    { label: 'Network', val: '0 KB (No internet permission)' },
  ];

  return (
    <section id="specs" className="editorial-section border-top">
      <div className="container">
        <div className="section-header">
          <span className="mono-kicker">Verification</span>
          <h2 className="section-title">Technical specifications.</h2>
        </div>

        <div className="specs-card">
          <div className="specs-table">
            {specs.map((s, idx) => (
              <div key={idx} className="specs-row">
                <span className="specs-label">{s.label}</span>
                <span className="specs-value">{s.val}</span>
              </div>
            ))}
            <div className="specs-row hash-row">
              <span className="specs-label">SHA-256</span>
              <div className="hash-val-wrap">
                <code className="specs-hash">{RELEASE.sha256}</code>
                <button type="button" className="copy-hash-btn" onClick={copyHash}>
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="specs-cta-banner">
          <div className="cta-banner-text">
            <h3>Ready to clean your gallery?</h3>
            <p>Free, open source, and runs 100% on your device.</p>
          </div>
          <DlBtn label={`Download APK · ${RELEASE.size}`} />
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="editorial-section border-top">
      <div className="container">
        <div className="section-header">
          <span className="mono-kicker">Questions</span>
          <h2 className="section-title">Frequently asked questions.</h2>
        </div>

        <div className="faq-list">
          {EDITORIAL_FAQ.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`faq-item ${isOpen ? 'open' : ''}`}
                onClick={() => toggle(idx)}
              >
                <div className="faq-header">
                  <span className="faq-q">{faq.q}</span>
                  <span className="faq-toggle">{isOpen ? '−' : '+'}</span>
                </div>
                {isOpen && (
                  <div className="faq-body">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
