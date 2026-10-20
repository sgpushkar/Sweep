import {useState,useRef} from 'react';
import {ITEMS} from '../data.js';
import {Art} from './Art.jsx';

export function Swipe(){
  const [i,setI]=useState(0),[hist,setHist]=useState([]),[dx,setDx]=useState(0),[drag,setDrag]=useState(false);
  const [exit,setExit]=useState(0),start=useRef(0);
  const keep=hist.filter(h=>h.d==="k").length,del=hist.filter(h=>h.d==="d");
  const mb=del.reduce((a,h)=>a+parseFloat(ITEMS[h.i].s),0);
  const done=i>=ITEMS.length;
  const decide=d=>{if(done)return;setExit(d==="k"?420:-420);setTimeout(()=>{setHist(h=>[...h,{i,d}]);setI(x=>x+1);setExit(0);setDx(0)},200)};
  const undo=()=>{if(!hist.length)return;const l=hist[hist.length-1];setHist(h=>h.slice(0,-1));setI(l.i)};
  const reset=()=>{setHist([]);setI(0)};
  const down=e=>{start.current=e.clientX;setDrag(true);e.currentTarget.setPointerCapture(e.pointerId)};
  const move=e=>{if(drag)setDx(e.clientX-start.current)};
  const up=()=>{setDrag(false);if(dx>90)decide("k");else if(dx<-90)decide("d");else setDx(0)};
  const key=e=>{if(e.key==="ArrowRight")decide("k");if(e.key==="ArrowLeft")decide("d");if(e.key==="Backspace"||e.key==="z")undo()};
  const x=exit||dx,it=ITEMS[i],nx=ITEMS[i+1];
  return <div className="demo">
    <div>
      <p className="eyebrow">Interactive preview</p>
      <h2>Try the swipe. Nothing here touches your phone.</h2>
      <p className="lead">Drag the card, tap the buttons, or use the arrow keys. This is a website demo with sample items. It never reads or deletes anything on your device.</p>
      <div className="stats" aria-live="polite">
        <div><b>{keep}</b><span>kept</span></div><div><b>{del.length}</b><span>queued to delete</span></div><div><b>{mb.toFixed(1)}</b><span>MB would be freed</span></div>
      </div>
    </div>
    <div style={{paddingBottom:20}}>
      <div className="phone"><div className="screen">
        <div className="bar"><span>REVIEW</span><span>{Math.min(i+1,ITEMS.length)}/{ITEMS.length}</span></div>
        <div className="stage">
          {done?<div style={{height:"100%",display:"grid",placeContent:"center",textAlign:"center",gap:12,padding:20}}>
            <h3 style={{fontSize:26}}>Queue ready</h3><p style={{color:"var(--mut)",fontSize:13}}>{del.length} items marked ({mb.toFixed(1)} MB). On a real device, Android asks you to confirm before anything is removed.</p>
            <button className="btn" onClick={reset}>Restart demo</button></div>:<>
          {nx&&<div className="card back"><Art it={nx}/></div>}
          <div className="card" tabIndex={0} role="group" aria-label={`${it.n}. Arrow right to keep, arrow left to delete.`} onKeyDown={key}
            onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
            style={{transform:`translateX(${x}px) rotate(${x/22}deg)`,transition:drag?"none":"transform .2s"}}>
            <Art it={it}/>
            <span className="stamp k" style={{opacity:Math.max(0,Math.min(1,x/90))}}>KEEP</span>
            <span className="stamp d" style={{opacity:Math.max(0,Math.min(1,-x/90))}}>DELETE</span>
            <div className="meta"><div>{it.n}</div><div style={{color:"var(--mut)"}}>{it.t==="VID"?"Video":"Image"} · {it.s}</div></div>
          </div></>}
        </div>
        <div className="acts">
          <button className="act d" onClick={()=>decide("d")} disabled={done} aria-label="Mark for deletion">✕</button>
          <button className="act" onClick={undo} disabled={!hist.length} aria-label="Undo last decision">↶</button>
          <button className="act k" onClick={()=>decide("k")} disabled={done} aria-label="Keep">✓</button>
        </div>
      </div><span className="pv">PREVIEW · NOT A RELEASED BUILD</span></div>
    </div>
  </div>
}
