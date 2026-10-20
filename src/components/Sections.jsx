import {RELEASE,status} from '../release.js';
import {FAQ} from '../data.js';
import {DlBtn} from './DlBtn.jsx';

export function Features(){
  const sw=["#3a4a3f","#46344d","#4d3a30","#2f3f52","#52483a"];
  return <section id="features"><div className="wrap">
  <p className="eyebrow">Features</p><h2>Built to do one job well.</h2>
  <div className="feat">
    <div className="f1"><h3>Browse everything in one place</h3><p>Scans the WhatsApp images and videos the app is permitted to access, then lines them up for review.</p>
      <div className="mini">{sw.map(c=><i key={c} style={{background:c}}/>)}<i style={{background:"var(--bg2)",border:"1px dashed var(--line)"}}/></div></div>
    <div className="f2"><h3>Swipe to decide</h3><p>Right keeps it. Left marks it for deletion. Made a wrong call? Undo it.</p>
      <p style={{marginTop:22,fontSize:36,fontFamily:"Fraunces,Georgia,serif"}}><span style={{color:"var(--del)"}}>←</span> <span style={{color:"var(--mut)",fontSize:14,fontFamily:"inherit"}}>swipe</span> <span style={{color:"var(--acc)"}}>→</span></p></div>
    <div className="f3"><h3>Review the queue</h3><p>Nothing is removed on swipe alone. Inspect everything you marked before continuing.</p></div>
    <div className="f4"><h3>See what you'd free</h3><p>Item counts, file sizes and estimated storage savings for the items in your queue.</p>
      <div className="bars"><i style={{width:"82%"}}/><i style={{width:"54%",opacity:.6}}/><i style={{width:"31%",opacity:.35}}/></div></div>
    <div className="f5"><h3>Local-first</h3><p>Media is processed on your device. No account, no cloud upload.</p></div>
  </div></div></section>}

export function How(){return <section id="how"><div className="wrap">
  <p className="eyebrow">How it works</p><h2>Three steps, no account.</h2>
  <ol className="steps" style={{padding:0}}>
    <li><h3>Install the APK</h3><p>Download the file and open it. Android may ask you to allow installs from your browser or file manager.</p></li>
    <li><h3>Grant media access</h3><p>Allow the permissions needed to find accessible WhatsApp images and videos, then start reviewing.</p></li>
    <li><h3>Queue, check, confirm</h3><p>Mark unwanted items, inspect the deletion queue, and confirm deletion through Android's own prompt.</p></li>
  </ol>
  <p className="note">Exact permission and installation steps vary by Android version and device settings.</p>
</div></section>}

export function Privacy(){return <section id="privacy"><div className="wrap">
  <p className="eyebrow">Privacy & safety</p><h2>Your media stays your media.</h2>
  <div className="priv">
    <p className="lead" style={{marginTop:0}}>The app is designed to process media on your device. It doesn't require an account and doesn't upload your photos or videos to a cloud service. We make no claim of independent audit or guaranteed privacy, so check the source and checksum if you can.</p>
    <dl>
      <dt>Why it asks for access</dt><dd>Android requires media permissions before an app can discover images and videos. Sweep uses them to list accessible WhatsApp media for review.</dd>
      <dt>Why deletion needs you</dt><dd>Android may show a system confirmation before files are removed. The app can't delete without that authorization.</dd>
      <dt>Why swiping isn't deleting</dt><dd>A left swipe only adds an item to your queue. You review the queue first.</dd>
    </dl>
  </div></div></section>}

export function Download(){
  const R=RELEASE;
  const rows=[["Version",R.version&&"v"+R.version],["File size",R.size],["Release date",R.date],["Minimum Android",R.minAndroid]];
  const cap={ready:["Release available","var(--acc)"],unavailable:["Build not yet published","var(--mut)"],error:["Release URL invalid (must be https)","var(--del)"]}[status];
  return <section id="download"><div className="wrap">
  <p className="eyebrow">Download</p><h2>Get the APK.</h2>
  <div className="dl">
    <div>
      <span className="state" style={{color:cap[1]}}>{cap[0]}</span>
      <h3>{status==="ready"?`${R.name}${R.version?" "+R.version:""}`:"Not available yet"}</h3>
      <p style={{color:"var(--mut)",marginBottom:24,fontSize:15}}>{status==="ready"?"Direct download for Android.":status==="error"?"The configured download link isn't a valid https URL, so the button is disabled.":"No release has been published. The download button stays disabled until a real URL is configured."}</p>
      <DlBtn/>
      <div style={{marginTop:28,display:"flex",gap:20,fontSize:14,flexWrap:"wrap"}}>
        {R.repoUrl&&<a href={R.repoUrl} rel="noopener">Source / report issues ↗</a>}
        {R.support&&<a href={R.support}>Support</a>}
      </div>
      {R.notes.length>0&&<><h3 style={{fontSize:20,margin:"32px 0 8px"}}>Release notes</h3><ul style={{color:"var(--mut)",paddingLeft:18,fontSize:15}}>{R.notes.map(n=><li key={n}>{n}</li>)}</ul></>}
    </div>
    <div>
      <table className="meta-t"><tbody>
        {rows.map(([k,v])=><tr key={k}><td>{k}</td><td>{v||<span style={{color:"var(--mut)"}}>Not provided</span>}</td></tr>)}
        <tr><td>SHA-256</td><td>{R.sha256?<code>{R.sha256}</code>:<span style={{color:"var(--mut)"}}>Not provided</span>}</td></tr>
      </tbody></table>
      <h3 style={{fontSize:20,margin:"32px 0 8px"}}>Install</h3>
      <ol><li>Download the APK on your Android phone.</li><li>Open it from notifications or Files.</li><li>If prompted, allow installs from that app.</li><li>Open the app and grant media access.</li></ol>
    </div>
  </div></div></section>}

export function Faq(){return <section id="faq"><div className="wrap">
  <p className="eyebrow">FAQ</p><h2>Straight answers.</h2>
  <div style={{marginTop:48,maxWidth:760}}>{FAQ.map(([q,a])=><details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
</div></section>}
