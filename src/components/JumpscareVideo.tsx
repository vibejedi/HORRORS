import { useCallback, useEffect, useRef, useState } from 'react';
import type { JumpscareClip } from '../game/jumpscares.ts';
import { playScareStinger } from '../animation/scareAudio.ts';

interface Props {
  clip: JumpscareClip;
  preview: boolean;
  title: string;
  detail: string;
  poster: string;
  soundEnabled: boolean;
  onComplete: () => void;
}
type Playback = 'loading' | 'playing' | 'fallback';

/**
 * Fatal scare video is a UI-only effect. The engine has already committed
 * the result; closing the overlay merely reveals the incident report.
 * A blocked unmuted autoplay retries in muted mode instead of skipping the scare.
 */
export function JumpscareVideo({clip,preview,title,detail,poster,soundEnabled,onComplete}:Props) {
  const videoRef = useRef<HTMLVideoElement|null>(null);
  const skipRef = useRef<HTMLButtonElement|null>(null);
  const completeRef = useRef(false);
  const [playback,setPlayback] = useState<Playback>('loading');
  const [audioBlocked,setAudioBlocked] = useState(false);
  const [seconds,setSeconds] = useState(0);
  const finish = useCallback(()=>{
    if(completeRef.current)return;
    completeRef.current=true;
    onComplete();
  },[onComplete]);

  useEffect(()=>{
    const previousFocus=document.activeElement as HTMLElement|null;
    const originalOverflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    skipRef.current?.focus();
    const key=(e:KeyboardEvent)=>{
      if(e.key==='Escape'||e.key==='Enter'||e.key===' '){e.preventDefault();finish();}
      if(e.key==='Tab'){e.preventDefault();skipRef.current?.focus();}
    };
    window.addEventListener('keydown',key);
    return ()=>{
      window.removeEventListener('keydown',key);
      document.body.style.overflow=originalOverflow;
      previousFocus?.focus?.();
    };
  },[finish]);

  useEffect(()=>{
    const video=videoRef.current;
    if(!video)return;
    video.muted=!soundEnabled;
    video.volume=0.75;
    video.currentTime=0;
    // Browsers may block sound unless the player has interacted with this origin.
    // Retry muted playback, preserving video, and offer a clear tap-to-unmute control.
    const start=async()=>{
      try{ await video.play(); }
      catch{
        video.muted=true;
        setAudioBlocked(soundEnabled);
        try{await video.play();}
        catch{setPlayback('fallback');}
      }
    };
    void start();
    const failsafe=window.setTimeout(()=>setPlayback(s=>s==='playing'?s:'fallback'),4600);
    const hardStop=window.setTimeout(finish,Math.max(6500,(clip.expectedSeconds+3)*1000));
    let stinger: number|undefined;
    const ready=()=>{
      setPlayback('playing');
      if(soundEnabled){
        stinger=window.setTimeout(()=>{
          // Use one synthesized impact only when autoplay policy muted the film.
          if(video.muted)playScareStinger();
        },410);
      }
    };
    const bad=()=>setPlayback('fallback');
    video.addEventListener('playing',ready);
    video.addEventListener('error',bad);
    return ()=>{
      window.clearTimeout(failsafe);window.clearTimeout(hardStop);
      if(stinger!==undefined)window.clearTimeout(stinger);
      video.removeEventListener('playing',ready);
      video.removeEventListener('error',bad);
      video.pause();
    };
  },[clip.mp4,clip.webm,clip.expectedSeconds,soundEnabled,finish]);

  useEffect(()=>{
    if(playback!=='fallback')return;
    const timeout=window.setTimeout(finish,1100);
    return ()=>window.clearTimeout(timeout);
  },[playback,finish]);

  const enableSound=()=>{
    const video=videoRef.current;
    if(!video)return;
    video.muted=false;
    video.volume=0.75;
    setAudioBlocked(false);
    void video.play().catch(()=>{
      video.muted=true;
      setAudioBlocked(true);
    });
  };
  return <div className={`video-scare video-scare--${playback}`} role="alertdialog" aria-modal="true" aria-label={preview?'Jumpscare preview':'Fatal archive transmission'}>
    <div className="video-scare__blackout" aria-hidden="true"/>
    {playback!=='fallback'&&<video ref={videoRef} className="video-scare__movie" playsInline autoPlay preload="auto"
      muted={!soundEnabled} disablePictureInPicture onTimeUpdate={e=>setSeconds(e.currentTarget.currentTime)}
      onEnded={finish}>
      {clip.webm&&<source src={clip.webm} type="video/webm"/>}
      <source src={clip.mp4} type="video/mp4"/>
    </video>}
    {playback==='fallback'&&<div className="video-scare__still" aria-hidden="true"><img src={poster} alt=""/><span className="video-scare__static"/></div>}
    {playback==='fallback'&&<div className="video-scare__caption"><strong>{title}</strong><p>{detail}</p></div>}
    {playback==='playing'&&audioBlocked&&soundEnabled&&<button type="button" className="video-scare__sound" onClick={enableSound}>TAP TO ENABLE SOUND</button>}
    <div className="video-scare__controls">
      {playback==='loading'&&<span>RESTORING CORRUPTED FOOTAGE...</span>}
      {playback==='playing'&&<span>TRANSMISSION / {seconds.toFixed(1)}S</span>}
      <button type="button" ref={skipRef} className="video-scare__skip" onClick={finish}>{preview?'EXIT PREVIEW':'SKIP → INCIDENT REPORT'}</button>
    </div>
  </div>;
}
