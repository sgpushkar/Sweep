/* ===== EDIT ME: single source of truth for release info. null / "" = not published. ===== */
export const RELEASE={
  name:"Sweep",
  tagline:"Clean up WhatsApp media with a swipe.",
  version:"1.0.0",
  apkUrl:"/releases/WhatsAppMediaCleaner.apk",
  size:"113.7 MB",
  date:"2026-10-13",
  minAndroid:"Android 8.0 (API 26)",
  sha256:"7cbecf463d42104bf3ed3c687f5acc8824c98bc2cea71a15c0e239e0a27a00ac",
  notes:[
    "Initial production release of WhatsApp Media Cleaner",
    "Real Android MediaStore image and video discovery",
    "Fast swipe-to-clean review cards with full undo stack",
    "System-authorized safe deletion via MediaStore.createDeleteRequest()",
    "Storage insights, largest space consumers, and duplicate candidate analysis",
    "In-app APK release and update screen with cryptographic SHA-256 verification"
  ],
  repoUrl:"https://github.com/sgpushkar/Sweep",
  support:null,
  privacyUrl:null
};

const urlOk=u=>{
  if (typeof u === 'string' && (u.startsWith('/') || u.startsWith('./'))) return true;
  try{return new URL(u).protocol==="https:"}catch{return false}
};
const compute=()=>RELEASE.loadError?"error":!RELEASE.apkUrl?"unavailable":urlOk(RELEASE.apkUrl)?"ready":"error";

/** Live binding: "ready" | "unavailable" | "error". Recomputed by applyRelease(). */
export let status=compute();

export function applyRelease(over={}){Object.assign(RELEASE,over);status=compute()}

/** Optionally overrides the config above with /release.json (served from /public).
 *  Missing file -> keep static config. Present but invalid -> error state. */
export async function loadRelease(){
  const ctl=new AbortController(),t=setTimeout(()=>ctl.abort(),3000);
  try{
    const r=await fetch(import.meta.env.BASE_URL+"release.json",{cache:"no-store",signal:ctl.signal});
    if(!r.ok||!(r.headers.get("content-type")||"").includes("json"))return applyRelease();
    applyRelease(await r.json());
  }catch(e){
    if(e.name!=="AbortError")applyRelease({loadError:true});else applyRelease();
  }finally{clearTimeout(t)}
}
