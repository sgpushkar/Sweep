import {RELEASE,status} from '../release.js';

export function DlBtn({label="Download APK",small}){
  return status==="ready"
    ?<a className="btn p" href={RELEASE.apkUrl} download rel="noopener">{label} ↓</a>
    :<a className="btn p" aria-disabled="true" role="link" tabIndex={-1}>{status==="error"?"Download unavailable":"Coming soon"}</a>;
}
