import { useEffect, useRef, useState } from 'react';
import type { JumpscareClip } from '../game/jumpscares.ts';

interface Props {
  clip: JumpscareClip;
  preview: boolean;
  title: string;
  detail: string;
  poster: string;
  onComplete: () => void;
}
/** Independent of the game engine. Never mutates saved/replayable game state. */
export function JumpscareVideo({clip,preview,title,detail,poster,onComplete}:Props) {
  const videoRef=useRef<HTMLVideoElement>(null);
  const completeRef=useRef(false);
  const [fallback,setFallback]=useState(false);
  const [canSkip,setCanSkip]=useState(false);
  const [hasVideo,setHasVideo]=useState(false);
  const complete=()=>{ if(completeRef.current)return;completeRef.current=true;onComplete(); };
  useEffect(()=>{
    const el=videoRef.current;
    const skip=window.setTimeout(()=>setCanSkip(true),900);
    const watchdog=window.setTimeout(()=>setFallback(true),7800);
    const start=window.setTimeout(()=>{
      if(!el)return;
      const promise=el.play();
      if(promise && typeof promise.catch==='function')void promise.catch(()=>setFallback(true));
    },0);
    return ()=>{window.clearTimeout(skip);window.clearTimeout(watchdog);window.clearTimeout(start);el?.pause();};
  },[clip.mp4,clip.webm]);
  useEffect(()=>{
    if(!fallback)return;
    const timeout=window.setTimeout(complete,1200);
    return ()=>window.clearTimeout(timeout);
  });
  useEffect(()=>{
    const key=(e:KeyboardEvent)=>{if(['Escape','Enter',' '].includes(e.key)){e.preventDefault();complete();}};
    window.addEventListener('keydown',key);
    return ()=>window.removeEventListener('keydown',key);
  });
  return <div className="video-scare" role="alertdialog" aria-modal="true" aria-label={preview?'Jumpscare preview':'Fatal archive transmission'}>
    {!fallback && <video ref={videoRef} className="video-scare__movie" playsInline preload="auto" muted autoPlay disablePictureInPicture poster={poster} onPlaying={()=>setHasVideo(true)} onEnded={complete} onError={()=>setFallback(true)}>
      <source src={clip.webm} type="video/webm"/><source src={clip.mp4} type="video/mp4"/>
    </video>}
    {(fallback||!hasVideo)&&<div className="video-scare__still" aria-hidden="true"><img src={poster} alt=""/><span className="video-scare__static"/></div>}
    {fallback&&<div className="video-scare__caption"><strong>{title}</strong><p>{detail}</p></div>}
    <button type="button" className="video-scare__skip" onClick={complete}>{canSkip?(preview?'EXIT PREVIEW':'VIEW INCIDENT REPORT ↗'):'SKIP'}</button>
  </div>;
}
