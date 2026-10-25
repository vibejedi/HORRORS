/**
 * Browser-safe impact stinger for browsers that will only autoplay muted video.
 * Unlocked by a prior player gesture. This is presentation only, not replay RNG.
 */
let context: AudioContext | null = null;

export function unlockScareAudio(): void {
  if(typeof window==='undefined')return;
  try {
    const AudioCtor=window.AudioContext;
    if(!AudioCtor)return;
    context ??= new AudioCtor();
    if(context.state==='suspended')void context.resume().catch(()=>{});
  } catch { /* Audio disabled by browser or device. */ }
}

export function playScareStinger(): boolean {
  const c=context;
  if(!c||c.state!=='running')return false;
  try {
    const start=c.currentTime;
    const sampleCount=Math.floor(c.sampleRate*0.36);
    const buffer=c.createBuffer(1,sampleCount,c.sampleRate);
    const channel=buffer.getChannelData(0);
    // Fixed noise sequence so this cosmetic effect does not touch game randomness.
    let x=0x5eeda11;
    for(let i=0;i<sampleCount;i++){
      x=(Math.imul(x,1664525)+1013904223)>>>0;
      const t=i/sampleCount;
      channel[i]=((x/0xffffffff)*2-1)*Math.pow(1-t,1.5);
    }
    const hiss=c.createBufferSource();
    hiss.buffer=buffer;
    const filter=c.createBiquadFilter();
    filter.type='bandpass';filter.frequency.value=1700;filter.Q.value=.7;
    const volume=c.createGain();
    volume.gain.setValueAtTime(0.0001,start);
    volume.gain.exponentialRampToValueAtTime(.11,start+.012);
    volume.gain.exponentialRampToValueAtTime(.0001,start+.35);
    hiss.connect(filter).connect(volume).connect(c.destination);
    hiss.start(start);hiss.stop(start+.37);
    const tone=c.createOscillator();
    const bass=c.createGain();
    tone.type='sawtooth';
    tone.frequency.setValueAtTime(110,start);
    tone.frequency.exponentialRampToValueAtTime(38,start+.28);
    bass.gain.setValueAtTime(.07,start);
    bass.gain.exponentialRampToValueAtTime(.0001,start+.29);
    tone.connect(bass).connect(c.destination);
    tone.start(start);tone.stop(start+.3);
    return true;
  }catch{return false;}
}
