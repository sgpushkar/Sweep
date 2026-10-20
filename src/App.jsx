import {useState,useEffect} from 'react';
import {RELEASE} from './release.js';
import {Nav,Footer,NotFound} from './components/Layout.jsx';
import {Hero} from './components/Hero.jsx';
import {Swipe} from './components/Swipe.jsx';
import {Features,How,Privacy,Download,Faq} from './components/Sections.jsx';

export default function App(){
  const [h,setH]=useState(location.hash);
  useEffect(()=>{const f=()=>setH(location.hash);addEventListener("hashchange",f);return()=>removeEventListener("hashchange",f)},[]);
  useEffect(()=>{document.title=`${RELEASE.name} — ${RELEASE.tagline}`},[]);
  const ok=["","#","#top","#features","#how","#privacy","#download","#faq","#demo"].includes(h);
  if(!ok)return <><Nav/><NotFound/><Footer/></>;
  return <><Nav/><main><Hero/><section id="demo"><div className="wrap"><Swipe/></div></section><Features/><How/><Privacy/><Download/><Faq/></main><Footer/></>;
}
