"use strict";
/* ============ música: cada mundo tiene su canción ============ */
const NOTE={C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
function nm(s){const m=s.match(/^([A-G][#b]?)(-?\d)$/);return 12*(+m[2]+1)+NOTE[m[1]]}
// "C5:2 E5:2 -:4 G5:8" → [[paso,nota,duración],...] (16 pasos por compás)
function bar(str){const out=[];let t=0;str.trim().split(/\s+/).forEach(tok=>{const [n,l]=tok.split(':');const d=+(l||2);if(n!=='-')out.push([t,nm(n),d]);t+=d});return out}
function chord(s){return s.split(' ').map(nm)}
const SONGS={
  title:{tempo:104,wave:'triangle',vol:.08,bw:'triangle',echo:.45,drums:{k:[0,8],s:[],h:[4,12],hv:.012},arp:true,
    bass:['C3','A2','F2','G2','C3','A2','F2','G2'].map(nm),chords:['C4 E4 G4','A3 C4 E4','F3 A3 C4','G3 B3 D4','C4 E4 G4','A3 C4 E4','F3 A3 C4','G3 B3 D4'].map(chord),
    lead:['E5:4 G5:4 C6:6 B5:2','A5:6 G5:2 E5:8','F5:4 A5:4 C6:4 A5:4','G5:12 -:4','E5:4 G5:4 C6:6 D6:2','E6:6 D6:2 C6:8','A5:4 C6:4 F6:4 E6:2 D6:2','C6:12 -:4'].map(bar)},
  bosque:{tempo:132,wave:'square',vol:.045,bw:'triangle',echo:.28,drums:{k:[0,8,10],s:[4,12],h:[0,2,4,6,8,10,12,14]},arp:false,
    bass:['C3','C3','F2','G2','A2','E2','F2','G2'].map(nm),chords:['C4 E4 G4','C4 E4 G4','F3 A3 C4','G3 B3 D4','A3 C4 E4','E3 G#3 B3','F3 A3 C4','G3 B3 D4'].map(chord),
    lead:['C5:2 E5:2 G5:4 E5:2 G5:2 C6:4','B5:2 A5:2 G5:4 E5:4 -:4','F5:2 A5:2 C6:4 A5:2 F5:2 A5:4','G5:6 F5:2 D5:8','E5:2 A5:2 C6:4 B5:2 A5:2 E5:4','G#5:4 B5:4 E6:6 D6:2','C6:2 A5:2 F5:4 A5:2 C6:2 F6:4','D6:4 B5:4 G5:4 D6:4'].map(bar)},
  playa:{tempo:140,wave:'triangle',vol:.085,bw:'square',echo:.25,drums:{k:[0,8],s:[6,12],h:[0,2,4,6,8,10,12,14],tam:[3,11]},arp:false,
    bass:['F2','F2','Bb2','C3','F2','D3','Bb2','C3'].map(nm),chords:['F3 A3 C4','F3 A3 C4','Bb3 D4 F4','C4 E4 G4','F3 A3 C4','D3 F3 A3','Bb3 D4 F4','C4 E4 G4'].map(chord),
    lead:['A5:2 C6:2 -:2 A5:2 F5:4 G5:4','A5:6 G5:2 F5:8','D6:2 D6:2 -:2 C6:2 Bb5:4 A5:4','G5:6 A5:2 Bb5:4 C6:4','A5:2 C6:2 -:2 F6:2 E6:4 C6:4','D6:4 A5:4 F5:8','Bb5:2 D6:2 F6:4 E6:2 D6:2 C6:4','C6:6 E6:2 F6:8'].map(bar)},
  desierto:{tempo:118,wave:'sawtooth',vol:.03,bw:'triangle',echo:.4,drums:{k:[0,6,8],s:[4,12],h:[2,6,10,14],tam:[3,7,11,15]},arp:true,
    bass:['E2','E2','F2','E2','A2','G#2','F2','E2'].map(nm),chords:['E3 G#3 B3','E3 G#3 B3','F3 A3 C4','E3 G#3 B3','A3 C4 E4','G#3 B3 D4','F3 A3 C4','E3 G#3 B3'].map(chord),
    lead:['E5:4 F5:2 G#5:2 A5:4 G#5:4','F5:2 E5:2 -:4 B4:8','C5:2 D5:2 E5:4 F5:4 E5:4','G#5:12 -:4','A5:4 B5:2 C6:2 D6:4 C6:4','B5:2 G#5:2 F5:4 E5:8','D5:2 E5:2 F5:4 A5:4 G#5:4','E5:12 -:4'].map(bar)},
  nieve:{tempo:96,wave:'sine',vol:.11,bw:'triangle',echo:.55,drums:{k:[0],s:[],h:[8],hv:.012,chime:[0,10]},arp:true,
    bass:['D3','Bb2','F2','C3','D3','Bb2','G2','A2'].map(nm),chords:['D4 F4 A4','Bb3 D4 F4','F3 A3 C4','C4 E4 G4','D4 F4 A4','Bb3 D4 F4','G3 Bb3 D4','A3 C#4 E4'].map(chord),
    lead:['A5:6 F5:2 D5:8','F5:4 G5:4 A5:8','C6:6 A5:2 F5:8','E5:4 F5:4 G5:8','A5:4 D6:4 C6:4 A5:4','Bb5:6 A5:2 F5:8','G5:4 Bb5:4 D6:4 C6:4','C#6:12 -:4'].map(bar)},
  volcan:{tempo:160,wave:'sawtooth',vol:.032,bw:'sawtooth',echo:.22,drums:{k:[0,3,8,11],s:[4,12],h:[0,2,4,6,8,10,12,14],tom:[14,15]},arp:false,
    bass:['A2','A2','F2','G2','A2','A2','D3','E3'].map(nm),chords:['A3 C4 E4','A3 C4 E4','F3 A3 C4','G3 B3 D4','A3 C4 E4','A3 C4 E4','D4 F4 A4','E4 G#4 B4'].map(chord),
    lead:['A5:2 A5:2 C6:2 A5:2 E6:4 D6:4','C6:2 B5:2 A5:4 E5:8','F5:2 A5:2 C6:4 F6:4 E6:4','D6:4 B5:4 G5:8','A5:2 C6:2 E6:2 A6:2 G6:4 E6:4','F6:4 E6:4 C6:8','D6:2 F6:2 A6:4 G6:2 F6:2 D6:4','E6:4 G#6:4 B6:8'].map(bar)},
  castillo:{tempo:146,wave:'square',vol:.04,bw:'sawtooth',echo:.35,drums:{k:[0,6,8,14],s:[4,12],h:[0,4,8,12],tom:[13,14,15]},arp:true,
    bass:['D3','D3','Bb2','C3','D3','F2','G2','A2'].map(nm),chords:['D4 F4 A4','D4 F4 A4','Bb3 D4 F4','C4 E4 G4','D4 F4 A4','F3 A3 C4','G3 Bb3 D4','A3 C#4 E4'].map(chord),
    lead:['D5:4 A5:4 F5:2 E5:2 D5:4','C#5:2 D5:2 E5:4 A4:8','Bb4:4 D5:4 F5:4 Bb5:4','A5:6 G5:2 E5:8','D6:4 C6:2 A5:2 F5:4 A5:4','C6:4 A5:4 F5:8','G5:2 A5:2 Bb5:4 D6:4 C6:4','C#6:4 E6:4 A6:8'].map(bar)},
  jefe:{tempo:174,wave:'sawtooth',vol:.032,bw:'square',echo:.2,drums:{k:[0,2,4,8,10,12],s:[4,12],h:[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],tom:[13,14,15],hv:.012},arp:false,
    bass:['E2','E2','F2','E2','E2','E2','G2','F#2'].map(nm),chords:['E3 G3 B3','E3 G3 B3','F3 A3 C4','E3 G3 B3','E3 G3 B3','E3 G3 B3','G3 B3 D4','F#3 A#3 C#4'].map(chord),
    lead:['E5:2 E5:2 G5:2 E5:2 B5:4 A#5:4','A5:2 G5:2 F#5:4 E5:8','F5:2 A5:2 C6:4 B5:2 A5:2 F5:4','E5:4 G5:4 B5:8','E6:2 D6:2 B5:2 G5:2 E5:4 G5:4','B5:4 A#5:4 B5:8','G5:2 B5:2 D6:4 C6:2 B5:2 G5:4','F#5:4 A#5:4 C#6:8'].map(bar)},
  victoria:{tempo:150,wave:'square',vol:.05,bw:'triangle',echo:.3,drums:{k:[0,8],s:[4,12],h:[0,2,4,6,8,10,12,14]},arp:false,once:2,
    bass:['C3','G2'].map(nm),chords:['C4 E4 G4','G3 B3 D4'].map(chord),lead:['C5:2 E5:2 G5:2 C6:4 G5:2 C6:4','D6:2 E6:2 F6:2 G6:10'].map(bar)},
};
const Music={ac:null,on:store.get('av-mus')!=='0',song:null,key:null,step:0,next:0,timer:null,out:null,delay:null,
  init(){if(this.ac)return;SFX.init();this.ac=SFX.ac;if(!this.ac)return;const a=this.ac;this.out=a.createGain();this.out.gain.value=.8;
    this.delay=a.createDelay(1);const fb=a.createGain();fb.gain.value=.28;this.fb=fb;const dl=a.createGain();dl.gain.value=.22;this.out.connect(SFX.master);this.out.connect(this.delay);this.delay.connect(fb);fb.connect(this.delay);this.delay.connect(dl);dl.connect(SFX.master)},
  play(k){if(this.key===k&&this.timer)return;this.key=k;this.song=SONGS[k];this.step=0;this.loops=0;if(!this.on)return;this.init();if(!this.ac)return;
    if(this.out){const g=this.out.gain,t=this.ac.currentTime;g.cancelScheduledValues(t);g.setValueAtTime(0,t);g.linearRampToValueAtTime(.8,t+.6)}
    this.delay.delayTime.value=60/this.song.tempo*.75;this.fb.gain.value=this.song.echo||.28;this.next=this.ac.currentTime+.1;if(!this.timer)this.timer=setInterval(()=>this.tick(),25)},
  stop(){clearInterval(this.timer);this.timer=null},
  toggle(){this.on=!this.on;store.set('av-mus',this.on?'1':'0');if(this.on){const k=this.key;this.key=null;this.play(k||'title')}else this.stop()},
  osc(f,t,d,type,v,att=.01){const a=this.ac,o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+att);g.gain.exponentialRampToValueAtTime(.0008,t+d);o.connect(g).connect(this.out);o.start(t);o.stop(t+d+.05)},
  drum(kind,t,v){const a=this.ac;if(kind==='k'){const o=a.createOscillator(),g=a.createGain();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(40,t+.12);g.gain.setValueAtTime(.32,t);g.gain.exponentialRampToValueAtTime(.001,t+.16);o.connect(g).connect(this.out);o.start(t);o.stop(t+.2);return}
    const len=kind==='s'?.12:kind==='tom'?.15:kind==='tam'?.08:.035;const n=Math.floor(a.sampleRate*len),b=a.createBuffer(1,n,a.sampleRate),c=b.getChannelData(0);for(let i=0;i<n;i++)c[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);
    const s=a.createBufferSource();s.buffer=b;const f=a.createBiquadFilter();f.type=kind==='h'?'highpass':kind==='tom'?'lowpass':'bandpass';f.frequency.value=kind==='h'?7000:kind==='s'?1800:kind==='tom'?300:3200;
    const g=a.createGain();g.gain.value=v;s.connect(f).connect(g).connect(this.out);s.start(t)},
  tick(){const a=this.ac,s=this.song;if(!a||!s)return;const spb=60/s.tempo/4;
    while(this.next<a.currentTime+.12){const st=this.step%16,b=Math.floor(this.step/16)%s.lead.length,t=this.next;
      if(s.once&&Math.floor(this.step/16)>=s.once){this.next+=spb;this.step++;continue}
      const D=s.drums;if(D.k&&D.k.includes(st))this.drum('k',t,.3);if(D.s&&D.s.includes(st))this.drum('s',t,.13);if(D.h&&D.h.includes(st))this.drum('h',t,D.hv||.02);if(D.tom&&D.tom.includes(st))this.drum('tom',t,.12);if(D.tam&&D.tam.includes(st))this.drum('tam',t,.05);
      if(D.chime&&D.chime.includes(st))this.osc(Music.f(s.chords[b][2]+24),t,1.2,'sine',.03,.005);
      if(st%4===0)this.osc(Music.f(s.bass[b]),t,spb*3.6,s.bw||'triangle',s.bw==='sawtooth'||s.bw==='square'?.05:.11);
      if(st===0||st===8)s.chords[b].forEach(n=>this.osc(Music.f(n),t,spb*7,'triangle',.022,.03));
      if(s.arp&&st%2===0){const ch=s.chords[b];this.osc(Music.f(ch[(st/2)%3]+12),t,spb*1.6,'triangle',.018)}
      s.lead[b].forEach(([p,n,d])=>{if(p===st){this.osc(Music.f(n),t,spb*d*.95,s.wave,s.vol);if(s.wave==='square')this.osc(Music.f(n)*1.004,t,spb*d*.9,'square',s.vol*.4)}});
      this.next+=spb;this.step++}},
  f(n){return 440*Math.pow(2,(n-69)/12)}};
