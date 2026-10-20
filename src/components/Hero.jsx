import {RELEASE,status} from '../release.js';
import {ITEMS} from '../data.js';
import {Art} from './Art.jsx';
import {DlBtn} from './DlBtn.jsx';

export function Hero(){return <header className="hero" id="top"><div className="wrap">
  <div>
    <p className="eyebrow">Android · WhatsApp media</p>
    <h1>Clear the clutter. <em>Skip the scrolling.</em></h1>
    <p className="lead">Swipe through your WhatsApp images and videos, keep what matters, and mark unwanted files for deletion. No endless manual sorting.</p>
    <div className="row"><DlBtn/><a className="btn" href="#features">Explore features</a></div>
    {status!=="ready"&&<p className="tag">No APK published yet. The download unlocks when a release is configured.</p>}
    {status==="ready"&&RELEASE.minAndroid&&<p className="tag">{RELEASE.version&&"v"+RELEASE.version+" · "}{RELEASE.minAndroid}+</p>}
  </div>
  <div style={{paddingBottom:20}} aria-hidden="true"><div className="phone"><div className="screen">
    <div className="bar"><span>REVIEW</span><span>3/128</span></div>
    <div className="stage"><div className="card back" style={{transform:"scale(.94) translateY(14px) rotate(3deg)"}}><Art it={ITEMS[1]}/></div>
    <div className="card" style={{transform:"rotate(-6deg) translateX(-14px)",cursor:"default"}}><Art it={ITEMS[0]}/><span className="stamp d" style={{opacity:.9}}>DELETE</span><div className="meta">IMG-20260412-WA0031.jpg<br/><span style={{color:"var(--mut)"}}>Image · 2.4 MB</span></div></div></div>
    <div className="acts"><span className="act" style={{display:"grid",placeContent:"center",color:"var(--del)"}}>✕</span><span className="act" style={{display:"grid",placeContent:"center",color:"var(--acc)"}}>✓</span></div>
  </div><span className="pv">PREVIEW · NOT A RELEASED BUILD</span></div></div>
</div></header>}
