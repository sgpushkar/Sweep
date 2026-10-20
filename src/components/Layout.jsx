import {RELEASE} from '../release.js';
import {DlBtn} from './DlBtn.jsx';

export function Nav(){return <nav><div className="wrap">
  <a className="logo" href="#top"><i/>{RELEASE.name}</a>
  <a className="l" href="#features">Features</a><a className="l" href="#privacy">Privacy</a>
  <DlBtn label="Download APK"/></div></nav>}

export function Footer(){return <footer><div className="wrap">
  <div style={{maxWidth:320}}><a className="logo" href="#top" style={{marginBottom:12}}><i/>{RELEASE.name}</a><p>{RELEASE.tagline} An independent Android utility.</p></div>
  <div><a href="#features">Features</a><a href="#privacy">Privacy</a><a href="#download">Download</a><a href="#faq">FAQ</a></div>
  <div>{RELEASE.privacyUrl?<a href={RELEASE.privacyUrl}>Privacy Policy</a>:<span style={{display:"block"}}>Privacy Policy: not published</span>}
    {RELEASE.support&&<a href={RELEASE.support}>Contact</a>}</div>
  <p style={{width:"100%"}}>© {new Date().getFullYear()} {RELEASE.name}. Not affiliated with or endorsed by WhatsApp or Meta.</p>
</div></footer>}

export function NotFound(){return <div className="nf"><p className="eyebrow">404</p><h1 style={{fontSize:56}}>Nothing here.</h1><a className="btn p" href="#top" style={{justifySelf:"center"}}>Back home</a></div>}
