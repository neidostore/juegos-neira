"use strict";
/* ============ AVENTURA NEIRA · juego ============ */
let TIME=0,shake=0,HC=null,hero=null,hurtFlash=0;
const GAME={on:false,state:'title',reg:0,dead:false,boss:null,cine:0};
const H={x:0,z:-8,vx:0,vz:0,face:Math.PI,hp:6,max:6,gems:0,keys:0,swing:0,swingT:.3,swingCd:0,shield:false,inv:0,bombCd:0,cp:0,moving:false};
const SAVE_K='aventura-neira-v1';
let SAVE=null;try{SAVE=JSON.parse(store.get(SAVE_K))}catch(e){}
function saveGame(){const d={v:1,char:HC?HC.id:'ekain',bosses:REGIONS.map(r=>!!r.beaten),gems:H.gems,max:H.max,chests:CHESTS.filter(c=>c.open).map(c=>c.id),cracks:CRACKS.filter(c=>c.dead).map(c=>c.id),cp:H.cp,time:Date.now()};
  store.set(SAVE_K,JSON.stringify(d));SAVE=d}

/* ---------- héroe ---------- */
let ghost=null;
function setHero(c){if(hero){sc.remove(hero);if(ghost)sc.remove(ghost)}HC=c;hero=makeChar(c);sc.add(hero);
  // silueta que se ve a través de árboles y casas
  ghost=hero.clone(true);const gm=new THREE.MeshBasicMaterial({color:0x5ab8ff,depthWrite:false,depthFunc:THREE.GreaterDepth});hero.traverse(o=>{if(o.isMesh)o.renderOrder=2});
  ghost.traverse(o=>{if(o.isMesh){o.material=o.material.transparent?new THREE.MeshBasicMaterial({visible:false}):gm;o.castShadow=false;o.renderOrder=1}});sc.add(ghost);
}
function heroMaxFor(c){return c.hp+REGIONS.filter(r=>r.beaten).length*2}

/* ---------- controles ---------- */
const keys={};let joyX=0,joyY=0,joyId=null;const joy=$('joy'),knob=joy.firstElementChild;
function joyUpd(e){const r=joy.getBoundingClientRect();let dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);if(ROT){const t=dx;dx=dy;dy=-t}
  const L=Math.hypot(dx,dy),m=48;if(L>m){dx*=m/L;dy*=m/L}joyX=dx/m;joyY=dy/m;knob.style.transform=`translate(${ROT?-dy:dx}px,${ROT?dx:dy}px)`}
joy.addEventListener('pointerdown',e=>{e.preventDefault();joyId=e.pointerId;try{joy.setPointerCapture(joyId)}catch(_){}joyUpd(e)});
joy.addEventListener('pointermove',e=>{if(e.pointerId===joyId)joyUpd(e)});
['pointerup','pointercancel','lostpointercapture'].forEach(t=>joy.addEventListener(t,e=>{if(e.pointerId!==joyId)return;joyId=null;joyX=joyY=0;knob.style.transform=''}));
function hold(id,k){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();keys[k]=true;keys[k+'P']=true;el.classList.add('on');try{el.setPointerCapture(e.pointerId)}catch(_){}});
  const off=()=>{keys[k]=false;el.classList.remove('on')};['pointerup','pointercancel','lostpointercapture'].forEach(t=>el.addEventListener(t,off))}
hold('bSword','sword');hold('bShield','shield');hold('bBomb','bomb');
const KM={' ':'sword',j:'sword',k:'shield',shift:'shield',b:'bomb',l:'bomb'};
addEventListener('keydown',e=>{const k=e.key.toLowerCase();keys[k]=true;if(KM[k]){if(!keys[KM[k]])keys[KM[k]+'P']=true;keys[KM[k]]=true}if(k==='escape'||k==='p')togglePause();if(e.key===' ')e.preventDefault()});
addEventListener('keyup',e=>{const k=e.key.toLowerCase();keys[k]=false;if(KM[k])keys[KM[k]]=false});
addEventListener('blur',()=>{if(GAME.state==='play')togglePause()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&GAME.state==='play')togglePause()});
window.appPause=()=>{if(GAME.state==='play')togglePause()};
window.appBack=()=>{if(GAME.state==='play'){togglePause();return 'pausa'}if(GAME.state==='pause'){togglePause();return 'pausa'}return 'salir'};

/* ---------- HUD ---------- */
function hud(){let h='';for(let i=0;i<H.max;i+=2){const v=H.hp-i;h+=`<span class="${v>=2?'f':v===1?'h':'e'}">♥</span>`}$('hearts').innerHTML=h;$('gemN').textContent=H.gems;$('keyN').textContent=H.keys}
function say(t,ms){const m=$('msg');m.textContent=t;m.style.display='block';clearTimeout(say.t);say.t=setTimeout(()=>m.style.display='none',ms||1800)}
function banner(sub,title,ms=2600){$('bannerS').textContent=sub;$('bannerT').textContent=title;const b=$('banner');b.classList.add('on');clearTimeout(banner.t);banner.t=setTimeout(()=>b.classList.remove('on'),ms)}
let talkSign=null,talkPage=0;$('talk').addEventListener('pointerdown',e=>{e.stopPropagation();if(!talkSign)return;talkPage++;if(talkPage>=talkSign.lines.length){talkPage=0;$('talk').style.display='none';talkSign.done=true}else showTalk()});
function showTalk(){$('talkWho').textContent=talkSign.who||'CARTEL';$('talkTxt').textContent=talkSign.lines[talkPage];$('talk').style.display='block'}
const mini=$('mini').getContext('2d');
function drawMini(){const g=mini,W=120,Hh=150,reg=GAME.reg,[z0,z1]=regZ(reg);const sx=W/(RW*2),sz=Hh/RD;const X=x=>(x+RW)*sx,Z=z=>(z0-z)*sz;
  g.clearRect(0,0,W,Hh);g.fillStyle=REGIONS[reg].mini;g.globalAlpha=.85;g.fillRect(0,0,W,Hh);g.globalAlpha=1;
  if(reg===0){g.fillStyle='#2a8ae8';g.fillRect(X(-18),0,6*sx,Hh)}if(reg===1){g.fillStyle='#2a9ae8';g.fillRect(X(19),0,W,Hh)}if(reg===4){g.fillStyle='#ff6a1a';[22,42].forEach(z=>g.fillRect(0,(z-2.2)*sz,W,4.4*sz))}
  const gt=GATES[reg];if(gt){g.fillStyle=gt.open?'#7aff8a':'#ff4a4a';g.fillRect(X(-3.5),Hh-3-(Hh-3),7*sx,4)}
  g.font='bold 11px system-ui';g.textAlign='center';g.textBaseline='middle';
  CHESTS.forEach(c=>{if(c.reg!==reg||c.open)return;g.fillStyle='#ffd84a';g.fillRect(X(c.x)-3,Z(c.z)-3,6,6)});
  CHECKPOINTS.forEach(c=>{if(c.reg!==reg)return;g.fillStyle='#4ae8ff';g.beginPath();g.arc(X(c.x),Z(c.z),3.5,0,7);g.fill()});
  const B=REGIONS[reg].bossMob;if(B&&!B.dead){g.fillText('💀',X(B.x),Z(B.z))}
  g.save();g.translate(X(H.x),Z(H.z));g.rotate(-H.face+Math.PI);g.fillStyle='#fff';g.strokeStyle='#000';g.lineWidth=1.5;g.beginPath();g.moveTo(0,-6);g.lineTo(4.5,5);g.lineTo(-4.5,5);g.closePath();g.fill();g.stroke();g.restore()}

/* ---------- objetos que se recogen ---------- */
const pickups=[];const GEM_G=new THREE.OctahedronGeometry(.2,0),GEM_M=[0x4aff7a,0x4ab0ff,0xff4a8a].map(c=>P(c,{emissive:c,emissiveIntensity:.6}));
const HEART_SHAPE=(()=>{const s=new THREE.Shape();s.moveTo(0,.25);s.bezierCurveTo(0,.3,-.1,.45,-.25,.45);s.bezierCurveTo(-.5,.45,-.5,.15,-.5,.15);s.bezierCurveTo(-.5,0,-.35,-.2,0,-.4);s.bezierCurveTo(.35,-.2,.5,0,.5,.15);s.bezierCurveTo(.5,.15,.5,.45,.25,.45);s.bezierCurveTo(.1,.45,0,.3,0,.25);return s})();
const HEART_G=new THREE.ExtrudeGeometry(HEART_SHAPE,{depth:.15,bevelEnabled:true,bevelSize:.05,bevelThickness:.05,bevelSegments:2});HEART_G.center();const HEART_M=P(0xff2a4a,{emissive:0xaa0010,emissiveIntensity:.5});
function dropGem(x,z,n){for(let i=0;i<n;i++){const m=new THREE.Mesh(GEM_G,GEM_M[Math.floor(R(0,3))]);m.scale.y=1.5;m.castShadow=true;m.position.set(x,.5,z);sc.add(m);pickups.push({m,kind:'gem',x,z,vx:R(-2.5,2.5),vz:R(-2.5,2.5),vy:R(3,5),y:.5,t:0})}}
function dropHeart(x,z){const m=new THREE.Mesh(HEART_G,HEART_M);m.scale.setScalar(.7);m.castShadow=true;sc.add(m);pickups.push({m,kind:'heart',x,z,vx:R(-1,1),vz:R(-1,1),vy:4,y:.6,t:0})}
function dropKey(x,z){const g=new THREE.Group();const km=P(0xffc84f,{metalness:1,roughness:.15,emissive:0x8a5a00,emissiveIntensity:.9});mk(new THREE.TorusGeometry(.35,.1,10,24),km,0,.55,0,g);mk(new THREE.BoxGeometry(.14,.9,.1),km,0,-.15,0,g);mk(new THREE.BoxGeometry(.3,.12,.1),km,.12,-.45,0,g);mk(new THREE.BoxGeometry(.24,.12,.1),km,.1,-.25,0,g);
  const glow=new THREE.Sprite(new THREE.SpriteMaterial({map:T_dot,color:0xffd84a,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending}));glow.scale.setScalar(3);g.add(glow);g.scale.setScalar(1.3);sc.add(g);pickups.push({m:g,kind:'key',x,z,vx:0,vz:0,vy:6,y:1,t:0})}
function stepPickups(dt){for(let i=pickups.length-1;i>=0;i--){const g=pickups[i];g.t+=dt;if(g.vy||g.y>.5){g.vy-=12*dt;g.y+=g.vy*dt;g.x+=g.vx*dt;g.z+=g.vz*dt;if(g.y<.5){g.y=.5;g.vy=0;g.vx=g.vz=0}}
    const d=Math.hypot(g.x-H.x,g.z-H.z);if(g.t>.5&&d<3.2&&g.kind!=='key'){g.x+=(H.x-g.x)*dt*6;g.z+=(H.z-g.z)*dt*6}
    g.m.position.set(g.x,g.y+(g.kind==='key'?1+Math.sin(TIME*3)*.2:Math.sin(TIME*3+i)*.08),g.z);g.m.rotation.y+=dt*(g.kind==='key'?2:3);
    if(g.t>(g.kind==='key'?1.2:.4)&&d<1){sc.remove(g.m);pickups.splice(i,1);
      if(g.kind==='gem'){H.gems++;SFX.gem()}else if(g.kind==='heart'){H.hp=Math.min(H.max,H.hp+2);SFX.heart();burst(H.x,1,H.z,0xff4a6a,10,1.5)}
      else if(g.kind==='key'){gotKey()}hud()}}}

/* ---------- combate ---------- */
function shieldBlocks(vx,vz){if(!H.shield)return false;if(HC.bigShield)return true;const l=Math.hypot(vx,vz)||1;return (Math.sin(H.face)*-vx/l+Math.cos(H.face)*-vz/l)>.3}
function hurt(n,kx,kz,src){if(H.inv>0||GAME.dead||GAME.state!=='play')return;const kl=Math.hypot(kx,kz)||1;
  if(H.shield&&shieldBlocks(-kx,-kz)){SFX.block();burst(H.x+Math.sin(H.face)*.6,1,H.z+Math.cos(H.face)*.6,0xffffff,8,2);H.vx=kx/kl*4;H.vz=kz/kl*4;H.inv=.25;if(src&&src.vx!==undefined&&src.g){src.vx=-kx/kl*7;src.vz=-kz/kl*7;src.hitT=.2;if(src.state==='charge'){src.state='stun';src.st=1.4}}return}
  H.hp=Math.max(0,H.hp-n);H.inv=1.2;H.vx=kx/kl*9;H.vz=kz/kl*9;SFX.hurt();shake=.3;hurtFlash=1;hud();$('hearts').classList.remove('hit');void $('hearts').offsetWidth;$('hearts').classList.add('hit');
  try{navigator.vibrate&&navigator.vibrate(60)}catch(e){}if(H.hp<=0)die()}
function die(){GAME.dead=true;SFX.tone(400,1,'triangle',.08,100);fade(1);setTimeout(()=>{respawn();fade(0);GAME.dead=false},1100)}
function respawn(){const cp=CHECKPOINTS.find(c=>c.reg===H.cp)||CHECKPOINTS[0];H.x=cp.x;H.z=cp.z-2;H.vx=H.vz=0;H.hp=H.max;H.inv=1.5;hud();
  REGIONS.forEach(r=>{const b=r.bossMob;if(b&&!r.beaten){b.hp=b.max;b.x=b.home[0];b.z=b.home[1];b.state='sleep';b.y=0;b.vx=b.vz=0;if(b.mark)b.mark.visible=false;if(b.dead){b.dead=false;sc.add(b.g)}}});
  hazards.forEach(h=>sc.remove(h.m));hazards.length=0;GAME.boss=null;$('bossbar').style.display='none';Music.play(REGIONS[regionAt(H.z)].song);say('¡Otra vez! Vuelves al último cristal de guardado',2200)}
function fade(v){$('fade').style.opacity=v}
function nearestTarget(range,cone){let best=null,bd=1e9;for(const m of mobs){if(m.dead||!m.active)continue;const dx=m.x-H.x,dz=m.z-H.z,d=Math.hypot(dx,dz);if(d>range+m.r)continue;
    const a=Math.abs(angDiff(Math.atan2(dx,dz),H.face));if(a>cone)continue;const score=d+a*2;if(score<bd){bd=score;best=m}}return best}
const shots=[];
function attack(){if(H.swingCd>0)return;H.swing=H.swingT=HC.ranged?.28:.3;H.swingCd=HC.ranged?.42:.38;
  if(HC.ranged){const t=nearestTarget(12,Math.PI*.6)||nearestTarget(7,Math.PI);if(t)H.face=Math.atan2(t.x-H.x,t.z-H.z);H.pend={t:HC.weapon==='ball'?.12:.06,f:()=>shoot(t)};return}
  SFX.swish();const t=nearestTarget(HC.reach+1.2,Math.PI*.65);if(t&&!HC.spin)H.face=Math.atan2(t.x-H.x,t.z-H.z);const fx=Math.sin(H.face),fz=Math.cos(H.face),reach=HC.reach*HC.h;
  H.pend={t:.07,f:()=>{for(const s of mobs){if(s.dead||!s.active)continue;const dx=s.x-H.x,dz=s.z-H.z,d=Math.hypot(dx,dz)-s.r*.6;if(d>reach)continue;if(!HC.spin&&(dx*fx+dz*fz)/Math.max(.01,Math.hypot(dx,dz))<-.15)continue;hitMob(s,dx/Math.max(.01,d+s.r*.6),dz/Math.max(.01,d+s.r*.6),HC.dmg)}
    for(const c of CHESTS){if(!c.open&&Math.hypot(c.x-H.x,c.z-H.z)<reach+.7)openChest(c)}
    for(const p of POTS){if(!p.dead&&Math.hypot(p.x-H.x,p.z-H.z)<reach+.4)breakPot(p)}}}}
function shoot(t){const ball=HC.weapon==='ball';(ball?SFX.kick:SFX.shoot).call(SFX);const fx=Math.sin(H.face),fz=Math.cos(H.face);
  const m=ball?new THREE.Mesh(new THREE.SphereGeometry(.22,16,12),S(0xffffff,{map:BALL_T,roughness:.4})):new THREE.Mesh(new THREE.OctahedronGeometry(.18,0),P(0xff4ad8,{emissive:0xff2ad8,emissiveIntensity:2}));m.castShadow=true;
  if(!ball)m.scale.set(.7,.7,2.2);m.position.set(H.x+fx*.7,.7,H.z+fz*.7);sc.add(m);const sp=ball?12:17;
  shots.push({m,x:m.position.x,z:m.position.z,y:.7,vx:fx*sp,vz:fz*sp,vy:ball?2.5:0,sp,life:ball?1.8:1.1,target:t,ball,hits:0,maxHits:ball?2:3,hit:new Set()})}
function stepShots(dt){for(let i=shots.length-1;i>=0;i--){const s=shots[i];s.life-=dt;
    if(s.target&&!s.target.dead){const dx=s.target.x-s.x,dz=s.target.z-s.z,d=Math.hypot(dx,dz)||1;const want=Math.atan2(dx,dz),cur=Math.atan2(s.vx,s.vz);const na=cur+clamp(angDiff(want,cur),-dt*14,dt*14);s.vx=Math.sin(na)*s.sp;s.vz=Math.cos(na)*s.sp}
    s.x+=s.vx*dt;s.z+=s.vz*dt;if(s.ball){s.vy-=16*dt;s.y+=s.vy*dt;if(s.y<.22){s.y=.22;s.vy=Math.abs(s.vy)*.65}}s.m.position.set(s.x,s.y+(s.ball?0:.3),s.z);
    if(s.ball)s.m.rotation.x+=dt*14;else s.m.lookAt(s.x+s.vx,s.y+.3,s.z+s.vz);
    if(blocked(s.x,s.z,.15))s.life=0;
    for(const m of mobs){if(m.dead||!m.active||s.hit.has(m))continue;if(Math.hypot(m.x-s.x,m.z-s.z)<m.r+.6){s.hit.add(m);hitMob(m,s.vx/s.sp,s.vz/s.sp,HC.dmg);s.hits++;
      if(s.ball){const nx=nearestFrom(s.x,s.z,9,s.hit);s.target=nx;if(!nx){s.vx*=-.6;s.vz*=-.6}else s.vy=3}
      if(s.hits>=s.maxHits)s.life=0;break}}
    for(const c of CHESTS){if(!c.open&&Math.hypot(c.x-s.x,c.z-s.z)<.9){openChest(c);s.life=0}}
    for(const p of POTS){if(!p.dead&&Math.hypot(p.x-s.x,p.z-s.z)<.7){breakPot(p);s.life=0}}
    if(s.life<=0){sc.remove(s.m);shots.splice(i,1)}}}
function nearestFrom(x,z,r,skip){let b=null,bd=r;for(const m of mobs){if(m.dead||!m.active||skip.has(m))continue;const d=Math.hypot(m.x-x,m.z-z);if(d<bd){bd=d;b=m}}return b}
const bombs=[];const BOMB_M=P(0x1a1a28,{roughness:.2});
function placeBomb(){if(H.bombCd>0)return;H.bombCd=1.3;const g=new THREE.Group();mk(new THREE.SphereGeometry(.34,18,14),BOMB_M,0,.34,0,g);mk(new THREE.CylinderGeometry(.13,.13,.1,10),SM(0x8a8a96,{metalness:.7}),0,.68,0,g);mk(new THREE.CylinderGeometry(.03,.03,.22,6),SM(0xd8c8a0),0,.82,0,g);
  const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:T_dot,color:0xffd84a,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));sp.scale.setScalar(.5);sp.position.y=.95;g.add(sp);
  const fx=Math.sin(H.face),fz=Math.cos(H.face);let bx=H.x+fx*1,bz=H.z+fz*1;if(blocked(bx,bz,.2)){bx=H.x;bz=H.z}g.position.set(bx,0,bz);sc.add(g);bombs.push({g,sp,x:bx,z:bz,t:1.7});SFX.tone(600,.08,'square',.04)}
function explode(b){sc.remove(b.g);SFX.boom();burst(b.x,.6,b.z,0xffa020,34,4.5,.12);burst(b.x,.6,b.z,0xffe08a,14,3,.08);puff(b.x,.5,b.z,0x555555,12,.5);
  const fl=new THREE.PointLight(0xffa040,5,10);fl.position.set(b.x,1.5,b.z);sc.add(fl);setTimeout(()=>sc.remove(fl),160);shake=Math.max(shake,.45);
  for(const s of mobs){if(!s.dead&&s.active&&Math.hypot(s.x-b.x,s.z-b.z)<2.9+s.r*.5){const d=Math.max(.1,Math.hypot(s.x-b.x,s.z-b.z));hitMob(s,(s.x-b.x)/d,(s.z-b.z)/d,2)}}
  for(const c of CRACKS){if(!c.dead&&Math.hypot(c.x-b.x,c.z-b.z)<3.2){c.dead=true;c.col.dead=true;c.m.visible=false;burst(c.x,1,c.z,0x9a9aa6,34,3.5,.14);puff(c.x,.8,c.z,0xaaaaaa,10,.6);SFX.door();say('¡La roca se ha roto! Hay algo dentro…',2200);saveGame()}}
  if(Math.hypot(H.x-b.x,H.z-b.z)<2.2)hurt(1,H.x-b.x,H.z-b.z)}
function breakPot(p){p.dead=true;p.col.dead=true;p.m.visible=false;SFX.noise(.25,.14,2500);SFX.tone(500,.1,'square',.04,200);burst(p.x,.5,p.z,0xc8784a,16,2.5,.1);
  const r=Math.random();if(r<.35)dropHeart(p.x,p.z);else if(r<.85)dropGem(p.x,p.z,Math.floor(R(1,4)))}
function openChest(c){if(c.open)return;c.open=true;SFX.chest();c.glow.material.opacity=.9;c.spark.visible=false;burst(c.x,1.1,c.z,0xffd84a,20,2.2);
  if(c.gift==='big'){say('¡TESORO SECRETO! +20 diamantes y un corazón',2400);dropGem(c.x,c.z,20);dropHeart(c.x,c.z)}else{say('¡Cofre! +8 diamantes',1800);dropGem(c.x,c.z,8)}saveGame()}

/* ---------- jefes ---------- */
function startBoss(b){GAME.boss=b;GAME.cine=1.8;b.st=Math.max(b.st,2.2);$('bossName').textContent=b.boss.name;$('bossbar').style.display='block';updBoss();Music.play('jefe');banner('¡JEFE!',b.boss.name,2200);SFX.door()}
function updBoss(){const b=GAME.boss;if(!b)return;$('bossHp').style.width=Math.max(0,b.hp/b.max*100)+'%'}
function onBossDefeated(b){const r=REGIONS[b.region];r.beaten=true;GAME.boss=null;$('bossbar').style.display='none';if(b.mark)b.mark.visible=false;
  hazards.forEach(h=>sc.remove(h.m));hazards.length=0;shake=.8;SFX.boom();for(let i=0;i<4;i++)setTimeout(()=>burst(b.x+R(-2,2),R(1,3),b.z+R(-2,2),pick([0xffd84a,0xff5a8a,0x5ad8ff]),24,4),i*220);
  mobs.forEach(m=>{if(m.region===b.region&&!m.dead&&(m.kind==='armadura'||m.kind==='slime')&&Math.hypot(m.x-b.x,m.z-b.z)<14){m.dead=true;sc.remove(m.g);burst(m.x,.6,m.z,m.col,12,2)}});
  Music.play('victoria');banner('¡JEFE DERROTADO!',b.boss.name,2600);dropGem(b.x,b.z,15);setTimeout(()=>dropKey(b.x,b.z),700)}
function gotKey(){H.keys++;const reg=REGIONS.findIndex(r=>r.beaten&&!r.keyTaken);if(reg>=0)REGIONS[reg].keyTaken=true;SFX.key();H.max+=2;H.hp=H.max;hud();
  burst(H.x,1.5,H.z,0xffd84a,30,3);banner('¡LLAVE DEL TALLER '+H.keys+'/6!','+1 CORAZÓN',2800);
  const g=GATES[reg];if(g&&!g.open)setTimeout(()=>openGate(g,true),1400);else if(reg===5)setTimeout(theEnd,2400);
  setTimeout(()=>Music.play(REGIONS[regionAt(H.z)].song),2600);saveGame()}
function openGate(g,anim){g.open=true;g.col.dead=true;if(anim){SFX.door();shake=.4;say('¡La puerta del norte se ha abierto!',2600);g.anim=1}else{g.door.position.y=-4.8;g.door.visible=false}}
function theEnd(){GAME.state='end';$('endTxt').innerHTML=`Has recuperado las 6 llaves del taller con <b>${HC.name}</b>.<br>Diamantes: <b>${H.gems}</b> · Corazones: <b>${H.max/2}</b><br>¡El pueblo de Neira te lo agradece!`;$('endS').classList.add('on');Music.play('title')}
$('endB').onclick=()=>{$('endS').classList.remove('on');GAME.state='play';last=performance.now()};

/* ---------- partículas del ambiente ---------- */
const AMB_N=MOBILE?160:280;const ambG=new THREE.BufferGeometry();const ambP=new Float32Array(AMB_N*3),ambV=new Float32Array(AMB_N*3);ambG.setAttribute('position',new THREE.BufferAttribute(ambP,3));
const ambM=new THREE.PointsMaterial({color:0xffffff,size:.13,map:T_dot,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});const amb=new THREE.Points(ambG,ambM);amb.frustumCulled=false;sc.add(amb);
function ambReset(i,top){const mode=REGIONS[GAME.reg].parts.mode;ambP[i*3]=H.x+R(-18,18);ambP[i*3+2]=H.z+R(-20,10);ambP[i*3+1]=mode==='snow'?(top?R(8,12):R(0,12)):mode==='ember'?(top?0:R(0,8)):R(.3,5);
  ambV[i*3]=mode==='dust'?R(1.5,3):mode==='drift'?R(-.5,.5):R(-.2,.2);ambV[i*3+1]=mode==='snow'?-R(.8,1.6):mode==='ember'?R(.8,2):R(-.1,.1);ambV[i*3+2]=R(-.2,.2)}
function stepAmb(dt){const mode=REGIONS[GAME.reg].parts.mode;for(let i=0;i<AMB_N;i++){const o=i*3;ambP[o]+=ambV[o]*dt+(mode==='snow'?Math.sin(TIME+i)*.3*dt:0);ambP[o+1]+=ambV[o+1]*dt;ambP[o+2]+=ambV[o+2]*dt;
    if(mode==='firefly'){ambV[o]+=R(-.6,.6)*dt;ambV[o+2]+=R(-.6,.6)*dt;ambV[o]=clamp(ambV[o],-.5,.5);ambV[o+2]=clamp(ambV[o+2],-.5,.5)}
    if(ambP[o+1]<0||ambP[o+1]>13||Math.abs(ambP[o]-H.x)>20||ambP[o+2]-H.z>12||ambP[o+2]-H.z<-22)ambReset(i,true)}ambG.attributes.position.needsUpdate=true}

/* ---------- luz de cada mundo (cambia suave al cruzar) ---------- */
const LIT={fog:new THREE.Color(),sun:new THREE.Color(),hs:new THREE.Color(),hg:new THREE.Color(),near:40,far:110,si:2,expo:.72,warm:new THREE.Vector3(1,1,1)};
function lightTarget(r){return {fog:new THREE.Color(r.fog[0]),near:r.fog[1],far:r.fog[2],sun:new THREE.Color(r.sun[0]),si:r.sun[1],hs:new THREE.Color(r.hemi[0]),hg:new THREE.Color(r.hemi[1]),expo:r.expo,warm:new THREE.Vector3(...r.warm)}}
let LT=null;function applyLight(t,k){LIT.fog.lerp(t.fog,k);LIT.sun.lerp(t.sun,k);LIT.hs.lerp(t.hs,k);LIT.hg.lerp(t.hg,k);LIT.near=lerp(LIT.near,t.near,k);LIT.far=lerp(LIT.far,t.far,k);LIT.si=lerp(LIT.si,t.si,k);LIT.expo=lerp(LIT.expo,t.expo,k);LIT.warm.lerp(t.warm,k);
  sc.fog.color.copy(LIT.fog);sc.fog.near=LIT.near;sc.fog.far=LIT.far;sun.color.copy(LIT.sun);sun.intensity=LIT.si;hemi.color.copy(LIT.hs);hemi.groundColor.copy(LIT.hg);
  if(finalPass){finalPass.uniforms.expo.value=LIT.expo;finalPass.uniforms.warm.value.copy(LIT.warm)}else ren.toneMappingExposure=LIT.expo}
function enterRegion(i,instant){const r=REGIONS[i];GAME.reg=i;if(!instant&&GAME.state==='play'&&i>H.cp){H.cp=i;saveGame()}paintSky(r.sky);LT=lightTarget(r);if(instant)applyLight(LT,1);ambM.color.setHex(r.parts.col);ambM.size=r.parts.size;ambM.blending=r.parts.mode==='snow'||r.parts.mode==='dust'?THREE.NormalBlending:THREE.AdditiveBlending;ambM.needsUpdate=true;
  for(let k=0;k<AMB_N;k++)ambReset(k,false);REG_GROUPS.forEach((g,k)=>g.visible=Math.abs(k-i)<=1);if(!GAME.boss)Music.play(r.song);if(!instant)banner(r.sub,r.name)}

/* ---------- bucle ---------- */
const tmpV=new THREE.Vector3();let last=performance.now(),stepT=0,cpT=0;
function step(dt){if(GAME.hitstop>0&&GAME.state==='play'){GAME.hitstop-=dt;return}TIME+=dt;windU.value=TIME;ANIM.forEach(f=>f(dt));stepParts(dt);
  if(GAME.state!=='play'){stepTitle(dt);return}
  if(GAME.dead){updateCam(dt);return}
  if(GAME.cine>0){GAME.cine-=dt;hero.position.set(H.x,0,H.z);animChar(hero,{time:TIME,moving:false,shield:false,swing:0,swingT:.3});const b=GAME.boss;if(b){b.t+=dt;b.g.position.set(b.x,b.y||0,b.z);b.g.rotation.y+=angDiff(Math.atan2(H.x-b.x,H.z-b.z),b.g.rotation.y)*dt*4;b.body.position.y=Math.abs(Math.sin(TIME*6))*.15}updateCam(dt);drawMini();return}
  // movimiento
  let mx=joyX,mz=joyY;if(keys.arrowleft||keys.a)mx=-1;if(keys.arrowright||keys.d)mx=1;if(keys.arrowup||keys.w)mz=-1;if(keys.arrowdown||keys.s)mz=1;
  const ml=Math.min(1,Math.hypot(mx,mz));H.shield=!!keys.shield;const spd=HC.spd*(H.shield?.45:1)*(H.swing>0&&!HC.ranged?.55:1);H.moving=ml>.15;
  if(H.moving){if(!(H.swing>0))H.face=Math.atan2(mx,mz);H.x+=mx/Math.max(ml,1)*spd*dt;H.z+=mz/Math.max(ml,1)*spd*dt;stepT-=dt*ml;if(stepT<=0){stepT=.28;SFX.step();if(GAME.reg===3||GAME.reg===2)puff(H.x,.1,H.z,GAME.reg===3?0xffffff:0xe8c890,1,.12)}}
  H.x+=H.vx*dt;H.z+=H.vz*dt;H.vx*=Math.pow(.002,dt);H.vz*=Math.pow(.002,dt);collide(H,.45);
  if(keys.swordP){keys.swordP=false;attack()}if(keys.bombP){keys.bombP=false;placeBomb()}keys.shieldP=false;
  if(H.pend){H.pend.t-=dt;if(H.pend.t<=0){const f=H.pend.f;H.pend=null;f()}}
  H.swing=Math.max(0,H.swing-dt);H.swingCd=Math.max(0,H.swingCd-dt);H.inv=Math.max(0,H.inv-dt);H.bombCd=Math.max(0,H.bombCd-dt);$('bBomb').classList.toggle('cd',H.bombCd>0);
  hero.position.set(H.x,0,H.z);hero.rotation.y+=angDiff(H.face,hero.rotation.y)*Math.min(1,dt*16);animChar(hero,{time:TIME,moving:H.moving,shield:H.shield,swing:H.swing,swingT:H.swingT});
  hero.visible=H.inv<=0||Math.floor(H.inv*14)%2===0;ghost.visible=hero.visible&&occluded();if(ghost.visible)syncGhost();
  // región (y solo se dibujan las regiones cercanas)
  const reg=regionAt(H.z);if(reg!==GAME.reg)enterRegion(reg);
  REG_GROUPS.forEach((g,k)=>{const [z0,z1]=regZ(k);const d=H.z>z0?H.z-z0:H.z<z1?z1-H.z:0;g.visible=d<52});if(LT)applyLight(LT,1-Math.pow(.25,dt));
  // cristales de guardado
  cpT-=dt;for(const c of CHECKPOINTS){if(Math.hypot(c.x-H.x,c.z-H.z)<1.8&&cpT<=0){cpT=6;if(H.cp!==c.reg||H.hp<H.max){H.cp=c.reg;H.hp=H.max;hud();SFX.heart();burst(c.x,1.5,c.z,0x6ae8ff,24,2);saveGame();say('Partida guardada · corazones llenos',2000)}}}
  // carteles
  NPCS.forEach((n,i)=>{const d=Math.hypot(n.x-H.x,n.z-H.z);if(d>30)return;animChar(n.m,{time:TIME+i*1.7,moving:false,shield:false,swing:0,swingT:.3});const want=d<5?Math.atan2(H.x-n.x,H.z-n.z):n.ry;n.m.rotation.y+=angDiff(want,n.m.rotation.y)*Math.min(1,dt*4)});
  let near=null;for(const s of SIGNS)if(Math.hypot(s.x-H.x,s.z-H.z)<(s.r||2.4)){near=s;break}
  if(near!==talkSign){talkSign=near;talkPage=0;if(near)showTalk();else $('talk').style.display='none'}
  if(GAME.boss){const b=GAME.boss;if(Math.hypot(H.x-b.home[0],H.z-b.home[1])>30){b.hp=b.max;b.x=b.home[0];b.z=b.home[1];b.state='sleep';b.y=0;b.vx=b.vz=0;if(b.mark)b.mark.visible=false;GAME.boss=null;$('bossbar').style.display='none';Music.play(REGIONS[GAME.reg].song)}}
  updateMobs(dt);updateHazards(dt);stepShots(dt);stepPickups(dt);updBoss();
  for(let i=bombs.length-1;i>=0;i--){const b=bombs[i];b.t-=dt;b.sp.visible=Math.floor(b.t*(b.t<.6?16:6))%2===0;b.g.scale.setScalar(1+(b.t<.5?(.5-b.t)*.6:0));if(b.t<=0){explode(b);bombs.splice(i,1)}}
  for(const c of CHESTS)if(c.open){c.lid.rotation.x=Math.max(-1.9,c.lid.rotation.x-dt*5);c.glow.material.opacity=Math.max(0,c.glow.material.opacity-dt*.5)}else c.spark.material.opacity=.5+Math.sin(TIME*4+c.x)*.4;
  for(const g of GATES)if(g.anim){g.door.position.y-=dt*1.6;g.door.position.x=Math.sin(TIME*40)*.05;if(g.door.position.y<-4.8){g.anim=0;g.door.visible=false;puff(0,1,g.z,0xaaaaaa,14,.8)}}
  if(GAME.reg===4&&Math.random()<dt*3){const v=pick(VENTS);if(v&&Math.hypot(v[0]-H.x,v[1]-H.z)<20)puff(v[0],.6,v[1],0x555555,1,.35)}
  FLAMES.forEach((f,i)=>{f.scale.set(1,1+Math.sin(TIME*14+i)*.2,1)});
  stepAmb(dt);hurtFlash=Math.max(0,hurtFlash-dt*2.5);if(finalPass)finalPass.uniforms.hurt.value=hurtFlash*.5;
  updateCam(dt);drawMini()}
/* ¿hay algo entre la cámara y el héroe? (árboles, casas, rocas grandes) */
function occluded(){const cx=cam.position.x,cz=cam.position.z,hx=H.x,hz=H.z;const dx=hx-cx,dz=hz-cz,L2=dx*dx+dz*dz;let hit=false;
  eachCol(H.z,c=>{if(hit)return;if(c.box){const [x0,x1,z0,z1]=c.box;if(z1-z0>10||x1-x0>14)return;const mx=(x0+x1)/2,mz=(z0+z1)/2,r=Math.max(x1-x0,z1-z0)/2;const t=clamp(((mx-cx)*dx+(mz-cz)*dz)/L2,0,1);if(t>.2&&Math.hypot(cx+dx*t-mx,cz+dz*t-mz)<r)hit=true;return}
    if(c.r<.5)return;const t=clamp(((c.x-cx)*dx+(c.z-cz)*dz)/L2,0,1);if(t<.25||t>.97)return;if(Math.hypot(cx+dx*t-c.x,cz+dz*t-c.z)<c.r*2.4)hit=true});return hit}
function syncGhost(){ghost.position.copy(hero.position);ghost.rotation.copy(hero.rotation);ghost.scale.copy(hero.scale);
  const a=[],b=[];hero.traverse(o=>a.push(o));ghost.traverse(o=>b.push(o));for(let i=1;i<a.length&&i<b.length;i++){b[i].position.copy(a[i].position);b[i].rotation.copy(a[i].rotation);b[i].scale.copy(a[i].scale);b[i].visible=a[i].visible}}
const camT={x:0,z:0,h:10.8,d:8.6};
function updateCam(dt){shake=Math.max(0,shake-dt*1.6);const b=GAME.boss;let tx=H.x,tz=H.z,h=10.8,dd=8.6;
  if(b&&!b.dead&&GAME.cine>0){tx=b.x;tz=b.z+1;h=9.5;dd=8.5}
  else if(b&&!b.dead){const k=.42;tx=lerp(H.x,b.x,k);tz=lerp(H.z,b.z,k);const sep=Math.hypot(b.x-H.x,b.z-H.z);h=clamp(11+sep*.35,11,16);dd=h*.8}
  const kk=1-Math.exp(-4*dt);camT.x=lerp(camT.x,tx,kk);camT.z=lerp(camT.z,tz,kk);camT.h=lerp(camT.h,h,kk*.6);camT.d=lerp(camT.d,dd,kk*.6);
  tmpV.set(camT.x,camT.h,camT.z+camT.d);cam.position.lerp(tmpV,1-Math.exp(-7*dt));
  if(shake>0){cam.position.x+=R(-1,1)*shake*.35;cam.position.y+=R(-1,1)*shake*.35}cam.lookAt(cam.position.x,.3,cam.position.z-camT.d+.5);
  sun.position.set(H.x-9,20,H.z+9);sun.target.position.set(H.x,0,H.z-2);rim.position.set(H.x+8,6,H.z-10);rim.target.position.set(H.x,0,H.z)}
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;if(GAME.state==='pause')return;try{step(dt);renderFrame()}catch(e){const el=$('err');el.style.display='block';el.textContent=e.message+' '+(e.stack||'').split('\n')[1]}}

/* ---------- portada y elección ---------- */
let lineup=[],selIdx=-1;const TITLE_POS={x:2,z:-20};
function stepTitle(dt){if(GAME.state==='title'){const a=TIME*.12;cam.position.set(TITLE_POS.x+Math.sin(a)*16,9,TITLE_POS.z+Math.cos(a)*16);cam.lookAt(TITLE_POS.x,1,TITLE_POS.z);
    sun.position.set(TITLE_POS.x-9,20,TITLE_POS.z+9);sun.target.position.set(TITLE_POS.x,0,TITLE_POS.z)}
  if(GAME.state==='select'){lineup.forEach((m,i)=>{const u=m.userData;animChar(m,{time:TIME+i,moving:false,shield:false,swing:0,swingT:.3});u.body.position.y=i===selIdx?Math.abs(Math.sin(TIME*6))*.3:0;m.rotation.y=Math.sin(TIME*.8+i)*.25+(i===selIdx?Math.sin(TIME*3)*.3:0)});
    cam.position.set(1,3.0,-14.6);cam.lookAt(1,1.2,-20.5);sun.position.set(-8,20,-12);sun.target.position.set(1,0,-20.5)}}
function showTitle(){GAME.state='title';document.body.classList.add('title');$('titleS').classList.add('on');$('contB').style.display=SAVE?'':'none';
  if(SAVE){const c=CHARS.find(q=>q.id===SAVE.char)||CHARS[0];$('contB').innerHTML='CONTINUAR<small>'+c.name+' · '+REGIONS[SAVE.cp||0].name+' · 🗝 '+SAVE.bosses.filter(Boolean).length+'/6</small>'}$('newB').textContent=SAVE?'NUEVA PARTIDA':'¡JUGAR!';Music.play('title')}
function showSelect(fromPause){GAME.state='select';document.body.classList.add('title');$('titleS').classList.remove('on');$('pauseS').classList.remove('on');$('selS').classList.add('on');selIdx=-1;$('goB').classList.remove('on');
  document.querySelectorAll('.card').forEach(e=>e.classList.remove('pick'));if(hero)hero.visible=false;if(ghost)ghost.visible=false;
  if(!lineup.length)lineup=CHARS.map((c,i)=>{const m=makeChar(c);m.position.set(-2.4+i*1.7,0,-20.5);sc.add(m);return m});lineup.forEach(m=>m.visible=true);showSelect.from=fromPause}
$('cards').innerHTML=CHARS.map((c,i)=>`<div class="card" data-i="${i}"><b>${c.name}</b><span>${c.desc}</span><em>${c.power}</em></div>`).join('');
document.querySelectorAll('.card').forEach(e=>e.onclick=()=>{SFX.init();Music.init();selIdx=+e.dataset.i;document.querySelectorAll('.card').forEach((x,k)=>x.classList.toggle('pick',k===selIdx));$('goB').classList.add('on');SFX.tone(660,.08,'square',.05)});
$('goB').onclick=()=>{if(selIdx<0)return;lineup.forEach(m=>m.visible=false);$('selS').classList.remove('on');const c=CHARS[selIdx];
  const keep=showSelect.from;setHero(c);if(!keep){newGame()}else{H.max=heroMaxFor(c);H.hp=H.max}startPlay();saveGame()};
let newArm=0;$('newB').onclick=()=>{SFX.init();Music.init();if(SAVE){if(!newArm){newArm=1;$('newB').textContent='¿SEGURO? TOCA OTRA VEZ';setTimeout(()=>{newArm=0;$('newB').textContent='NUEVA PARTIDA'},3500);return}store.set(SAVE_K,'');location.href=location.pathname+'?nuevo=1';return}showSelect(false)};
$('contB').onclick=()=>{SFX.init();Music.init();loadGame();startPlay()};
function newGame(){H.gems=0;H.keys=0;H.cp=0;H.max=HC.hp;H.hp=H.max;const cp=CHECKPOINTS[0];H.x=cp.x;H.z=cp.z-2;H.face=Math.PI}
function loadGame(){const d=SAVE;const c=CHARS.find(c=>c.id===d.char)||CHARS[0];setHero(c);
  REGIONS.forEach((r,i)=>{if(d.bosses[i]){r.beaten=true;r.keyTaken=true;const b=r.bossMob;if(b&&!b.dead){b.dead=true;sc.remove(b.g)}if(GATES[i])openGate(GATES[i],false)}});
  CHESTS.forEach(c2=>{if(d.chests.includes(c2.id)){c2.open=true;c2.lid.rotation.x=-1.9;c2.spark.visible=false}});
  CRACKS.forEach(c2=>{if(d.cracks.includes(c2.id)){c2.dead=true;c2.col.dead=true;c2.m.visible=false}});
  H.gems=d.gems||0;H.keys=REGIONS.filter(r=>r.beaten).length;H.max=heroMaxFor(c);H.hp=H.max;H.cp=d.cp||0;const cp=CHECKPOINTS.find(q=>q.reg===H.cp)||CHECKPOINTS[0];H.x=cp.x;H.z=cp.z-2;H.face=Math.PI}
function startPlay(){GAME.state='play';GAME.on=true;document.body.classList.remove('title');$('titleS').classList.remove('on');hero.visible=true;
  enterRegion(regionAt(H.z),true);banner(REGIONS[GAME.reg].sub,REGIONS[GAME.reg].name,2400);camT.x=H.x;camT.z=H.z;camT.h=10.8;camT.d=8.6;cam.position.set(H.x,10.8,H.z+8.6);hud();last=performance.now()}
function togglePause(){if(GAME.state==='play'){GAME.state='pause';$('pauseS').classList.add('on');Music.stop();keys.sword=keys.shield=keys.bomb=false;joyX=joyY=0;knob.style.transform='';
    $('pStats').innerHTML=`${HC.name} · ${REGIONS[GAME.reg].name}<br>Llaves: ${H.keys}/6 · Diamantes: ${H.gems} · Corazones: ${H.max/2}`;$('musB').textContent='MÚSICA: '+(Music.on?'SÍ':'NO');$('qB').textContent='GRÁFICOS: '+(QUALITY==='alta'?'ALTOS':'BAJOS')}
  else if(GAME.state==='pause'){GAME.state='play';$('pauseS').classList.remove('on');const k=Music.key;Music.key=null;Music.play(k||REGIONS[GAME.reg].song);last=performance.now()}}
$('pauseB').onclick=togglePause;$('resB').onclick=togglePause;
$('musB').onclick=()=>{Music.toggle();if(GAME.state==='pause')Music.stop();$('musB').textContent='MÚSICA: '+(Music.on?'SÍ':'NO')};
$('qB').onclick=()=>{QUALITY=QUALITY==='alta'?'baja':'alta';store.set('av-q',QUALITY);applyQuality();if(LT)applyLight(LT,1);$('qB').textContent='GRÁFICOS: '+(QUALITY==='alta'?'ALTOS':'BAJOS');renderFrame()};
$('charB').onclick=()=>{saveGame();showSelect(true)};
$('exitB').onclick=()=>{saveGame();location.href='../'};

/* ---------- arranque ---------- */
function boot(){applyQuality();setTimeout(()=>{try{buildWorld();if(!CHECKPOINTS.length)throw new Error('sin cristales');
    enterRegion(0,true);$('loading').style.display='none';if(/nuevo=1/.test(location.search)){SAVE=null;history.replaceState(null,'',location.pathname);showTitle();showSelect(false)}else showTitle();requestAnimationFrame(frame)}catch(e){$('loadTxt').textContent='Error: '+e.message;throw e}},60)}
boot();
if('serviceWorker' in navigator)navigator.serviceWorker.register('../sw.js',{scope:'../'}).catch(()=>{});
