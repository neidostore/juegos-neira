"use strict";
/* ============ bichos y jefes ============ */
const mobs=[],hazards=[];
function eyes(g,y,z,sp,s,col){[-1,1].forEach(sd=>{const w=mk(new THREE.SphereGeometry(.12*s,14,10),SM(0xffffff,{roughness:.2}),sd*sp,y,z,g,false);w.scale.z=.7;
  mk(new THREE.SphereGeometry(.07*s,10,8),col?SM(col,{emissive:col,emissiveIntensity:1.4}):SM(0x111111,{roughness:.1}),sd*sp,y-.01*s,z+.07*s,g,false);
  mk(new THREE.SphereGeometry(.025*s,6,4),SM(0xffffff,{emissive:0xffffff,emissiveIntensity:1}),sd*sp+.025*s,y+.03*s,z+.11*s,g,false)})}
function brows(g,y,z,sp,s,angry){[-1,1].forEach(sd=>{const b=mk(new THREE.BoxGeometry(.16*s,.04*s,.04*s),SM(0x1a1018),sd*sp,y,z,g,false);b.rotation.z=(angry?.45:-.2)*sd})}
function crown(g,y,s){const cm=PM(0xffc84f,{metalness:1,roughness:.2,emissive:0x6a4400,emissiveIntensity:.4});const c=new THREE.Group();mk(new THREE.CylinderGeometry(.3*s,.32*s,.18*s,12,1,true),cm,0,0,0,c);
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;mk(new THREE.ConeGeometry(.07*s,.2*s,5),cm,Math.cos(a)*.3*s,.17*s,Math.sin(a)*.3*s,c)}mk(new THREE.OctahedronGeometry(.07*s,0),PM(0xff3a5a,{emissive:0xaa0020,emissiveIntensity:1}),0,.02*s,.32*s,c);c.position.y=y;g.add(c);return c}
const MOB={
  slime:{hp:2,r:.5,ai:'hop',spd:1.7,col:0xff4a4a,make(m,col){const mat=new THREE.MeshPhysicalMaterial({color:LIN(col),roughness:.06,clearcoat:1,transparent:true,opacity:.86,emissive:col,emissiveIntensity:.2});m.mats=[mat];
    const b=m.body;const o=outline(mk(new THREE.SphereGeometry(.55,26,16),mat,0,.42,0,b),1.05);o.scale.set(1,.78,1);
    mk(new THREE.SphereGeometry(.28,14,10),new THREE.MeshStandardMaterial({color:LIN(col),emissive:col,emissiveIntensity:.6,transparent:true,opacity:.6}),0,.38,0,b,false);
    outline(mk(new THREE.ConeGeometry(.2,.32,14),mat,0,.86,0,b));eyes(b,.55,.42,.18,1);
    const mo=mk(new THREE.TorusGeometry(.07,.02,6,12,Math.PI),SM(0x1a1018),0,.4,.5,b,false);mo.rotation.z=Math.PI;
    mk(new THREE.SphereGeometry(.09,8,6),SM(0xffffff,{emissive:0xffffff,emissiveIntensity:.8}),-.24,.74,.26,b,false);blobShadow(m.g,.7)}},
  seta:{hp:3,r:.55,ai:'walk',spd:1.9,col:0xe8302a,make(m,col){const red=P(col,{roughness:.35}),cream=SM(0xfff0d8,{roughness:.6}),wh=SM(0xffffff,{roughness:.4});m.mats=[red];const b=m.body;
    outline(mk(new THREE.CylinderGeometry(.3,.36,.6,18),cream,0,.48,0,b));const cap=outline(mk(new THREE.SphereGeometry(.62,26,14,0,Math.PI*2,0,Math.PI*.55),red,0,.72,0,b),1.05);cap.scale.set(1.1,.85,1.1);
    for(let i=0;i<9;i++){const a=i/9*Math.PI*2,t=i%2?.45:.25;const d=mk(new THREE.SphereGeometry(.1,10,6),wh,Math.cos(a)*.6*Math.sin(t+.6),.72+.5*Math.cos(t+.6),Math.sin(a)*.6*Math.sin(t+.6),b,false);d.scale.set(1,.4,1);d.lookAt(0,.4,0)}
    eyes(b,.55,.29,.13,.85);brows(b,.68,.33,.13,.85,true);
    m.feet=[-1,1].map(sd=>{const f=outline(mk(new THREE.SphereGeometry(.13,12,8),SM(0x8a5a2a),.17*sd,.1,.05,m.g));f.scale.set(1,.6,1.4);return f});blobShadow(m.g,.75)}},
  escarabajo:{hp:3,r:.6,ai:'charge',spd:10,col:0x1a4aa8,make(m,col){const sh=P(col,{metalness:.5,roughness:.2,emissive:0x0a1a4a,emissiveIntensity:.3}),dk=SM(0x141420,{roughness:.5});m.mats=[sh];const b=m.body;
    const shell=outline(mk(new THREE.SphereGeometry(.6,26,14,0,Math.PI*2,0,Math.PI/2),sh,0,.25,-.1,b),1.05);shell.scale.set(1,.75,1.25);
    mk(new THREE.BoxGeometry(.03,.42,1.3),dk,0,.5,-.1,b,false);const hd=outline(mk(new THREE.SphereGeometry(.3,18,14),dk,0,.32,.55,b));
    const horn=outline(mk(new THREE.ConeGeometry(.08,.45,10),PM(0xffc84f,{metalness:.8,roughness:.2}),0,.52,.82,b));horn.rotation.x=1.1;eyes(b,.42,.78,.13,.7,0xff3a2a);
    m.legs=[];for(let i=0;i<3;i++)[-1,1].forEach(sd=>{const l=mk(new THREE.CylinderGeometry(.035,.025,.42,6),dk,.48*sd,.14,.3-i*.38,b,false);l.rotation.z=.9*sd;m.legs.push(l)});blobShadow(m.g,.85)}},
  murcielago:{hp:1,r:.45,ai:'fly',spd:3.4,col:0x5a2a8a,make(m,col){const fur=S(col,{roughness:.7}),wing=new THREE.MeshStandardMaterial({color:LIN(new THREE.Color(col).multiplyScalar(.6)),roughness:.8,side:THREE.DoubleSide});m.mats=[fur];const b=m.body;
    outline(mk(new THREE.SphereGeometry(.32,20,14),fur,0,0,0,b));
    [-1,1].forEach(sd=>{const e=outline(mk(new THREE.ConeGeometry(.11,.3,8),fur,.16*sd,.3,0,b));e.rotation.z=-.3*sd;mk(new THREE.ConeGeometry(.06,.18,8),SM(0xff9ad0),.16*sd,.3,.04,b,false).rotation.z=-.3*sd});
    eyes(b,.07,.24,.12,.75,0xffd84a);[-1,1].forEach(sd=>mk(new THREE.ConeGeometry(.025,.08,6),SM(0xffffff),.05*sd,-.1,.29,b,false).rotation.x=Math.PI);
    const shp=new THREE.Shape();shp.moveTo(0,0);shp.lineTo(.9,.35);shp.lineTo(.8,-.05);shp.lineTo(.62,.08);shp.lineTo(.5,-.14);shp.lineTo(.32,0);shp.lineTo(.18,-.2);shp.lineTo(0,-.12);
    m.wings=[-1,1].map(sd=>{const p=new THREE.Group();p.position.set(.22*sd,.05,-.05);b.add(p);const w=new THREE.Mesh(new THREE.ShapeGeometry(shp),wing);w.castShadow=true;w.scale.x=sd;p.add(w);return p});m.sh=blobShadow(m.g,.6)}},
  golem:{hp:6,r:.95,ai:'walk',spd:1.1,dmg:2,col:0x6a6a7a,make(m,col,o){const rk=S(col,{roughness:.85,flatShading:true,emissive:o.glow||0,emissiveIntensity:o.glow?.25:0}),ms=SM(o.top||0x4f9a34,{roughness:.9,flatShading:true});m.mats=[rk];const b=m.body;
    const bd=outline(mk(bumpy(new THREE.DodecahedronGeometry(.8,1),.1),rk,0,1,0,b));bd.scale.set(1.1,1,.9);
    outline(mk(bumpy(new THREE.DodecahedronGeometry(.45,1),.1),rk,0,1.95,.1,b));mk(bumpy(new THREE.SphereGeometry(.42,12,6,0,Math.PI*2,0,Math.PI*.4),.1),ms,0,2.1,.1,b,false);
    eyes(b,1.98,.5,.17,.9,o.eye||0x4affe8);brows(b,2.15,.52,.17,.9,true);
    if(o.glow){for(let i=0;i<5;i++){const cr=mk(new THREE.BoxGeometry(.06,R(.3,.6),.04),SM(o.glow,{emissive:o.glow,emissiveIntensity:2}),R(-.5,.5),R(.6,1.4),.72,b,false);cr.rotation.z=R(-.6,.6)}}
    m.arms=[-1,1].map(sd=>{const p=new THREE.Group();p.position.set(1*sd,1.35,0);b.add(p);outline(mk(bumpy(new THREE.DodecahedronGeometry(.36,1),.1),rk,0,-.3,0,p));outline(mk(bumpy(new THREE.DodecahedronGeometry(.4,1),.1),rk,.05*sd,-.85,.1,p));return p});
    [-1,1].forEach(sd=>outline(mk(bumpy(new THREE.DodecahedronGeometry(.32,1),.1),rk,.42*sd,.28,0,b)));blobShadow(m.g,1.4)}},
  cangrejo:{hp:3,r:.6,ai:'walk',spd:2.2,col:0xff5a2a,make(m,col){const sh=P(col,{roughness:.3}),wh=SM(0xfff0e0);m.mats=[sh];const b=m.body;
    const bd=outline(mk(new THREE.SphereGeometry(.5,24,14),sh,0,.4,0,b),1.05);bd.scale.set(1.3,.6,.9);
    [-1,1].forEach(sd=>{const st=mk(new THREE.CylinderGeometry(.03,.03,.25,6),sh,.14*sd,.75,.2,b,false);const e=mk(new THREE.SphereGeometry(.09,10,8),wh,.14*sd,.9,.2,b,false);mk(new THREE.SphereGeometry(.05,8,6),SM(0x111111),.14*sd,.91,.27,b,false)});
    m.claws=[-1,1].map(sd=>{const p=new THREE.Group();p.position.set(.68*sd,.45,.25);b.add(p);const c1=outline(mk(new THREE.SphereGeometry(.2,14,10),sh,0,0,.1,p));c1.scale.set(1,.7,1.3);const c2=mk(new THREE.ConeGeometry(.08,.3,8),sh,.05*sd,.08,.32,p);c2.rotation.x=1.3;return p});
    m.legs=[];for(let i=0;i<3;i++)[-1,1].forEach(sd=>{const l=mk(new THREE.CylinderGeometry(.03,.02,.4,6),sh,.55*sd,.2,-.2+i*.14,b,false);l.rotation.z=1*sd;m.legs.push(l)});blobShadow(m.g,.9)}},
  escorpion:{hp:4,r:.65,ai:'charge',spd:9,col:0xc8862a,shoot:true,make(m,col){const sh=P(col,{roughness:.35,metalness:.2}),dk=SM(0x3a2410);m.mats=[sh];const b=m.body;
    for(let i=0;i<3;i++){const seg=outline(mk(new THREE.SphereGeometry(.34-i*.04,18,12),sh,0,.32,.2-i*.42,b),1.05);seg.scale.set(1.1,.6,1)}
    const hd=outline(mk(new THREE.SphereGeometry(.28,16,12),sh,0,.35,.62,b));eyes(b,.48,.82,.1,.6,0xff3a2a);
    const tail=new THREE.Group();tail.position.set(0,.4,-.85);b.add(tail);let y=0,z=0;for(let i=0;i<5;i++){y+=.22;z-=.1*(2-i);outline(mk(new THREE.SphereGeometry(.13-i*.01,12,8),sh,0,y,z,tail))}
    const st=outline(mk(new THREE.ConeGeometry(.08,.3,8),PM(0x2a1a2a),0,y+.1,z+.22,tail));st.rotation.x=2.2;m.tail=tail;
    m.claws=[-1,1].map(sd=>{const p=new THREE.Group();p.position.set(.45*sd,.35,.75);b.add(p);const c=outline(mk(new THREE.SphereGeometry(.17,12,8),sh,0,0,.2,p));c.scale.set(1,.6,1.4);return p});
    m.legs=[];for(let i=0;i<4;i++)[-1,1].forEach(sd=>{const l=mk(new THREE.CylinderGeometry(.03,.02,.45,6),dk,.45*sd,.18,.3-i*.25,b,false);l.rotation.z=1*sd;m.legs.push(l)});blobShadow(m.g,1)}},
  cactus:{hp:3,r:.55,ai:'turret',spd:0,col:0x3aa84a,make(m,col){const gm=P(col,{roughness:.45}),sp=SM(0xfff4c0);m.mats=[gm];const b=m.body;
    outline(mk(new THREE.CylinderGeometry(.4,.45,1.5,14),gm,0,.75,0,b));outline(mk(new THREE.SphereGeometry(.4,14,10),gm,0,1.5,0,b));
    [-1,1].forEach(sd=>{outline(mk(new THREE.CylinderGeometry(.16,.18,.45,10),gm,.48*sd,.85,0,b)).rotation.z=Math.PI/2;outline(mk(new THREE.CylinderGeometry(.16,.16,.55,10),gm,.68*sd,1.12,0,b))});
    for(let i=0;i<16;i++){const a=R(0,6.3),y=R(.2,1.6);const s=mk(new THREE.ConeGeometry(.025,.12,4),sp,Math.cos(a)*.42,y,Math.sin(a)*.42,b,false);s.lookAt(Math.cos(a)*2,y,Math.sin(a)*2);s.rotateX(Math.PI/2)}
    const fl=mk(new THREE.SphereGeometry(.12,10,8),SM(0xff5aa8,{emissive:0xaa2a6a,emissiveIntensity:.4}),0,1.9,0,b);fl.scale.y=.6;
    eyes(b,1.25,.36,.13,.8);brows(b,1.4,.4,.13,.8,true);blobShadow(m.g,.8)}},
  pinguino:{hp:3,r:.55,ai:'charge',spd:9,col:0x1d2230,make(m,col){const bk=P(col,{roughness:.35}),wh=SM(0xfaf8f0),or=SM(0xffa020);m.mats=[bk];const b=m.body;
    const bd=outline(mk(new THREE.SphereGeometry(.45,22,16),bk,0,.6,0,b));bd.scale.set(.9,1.2,.85);const bl=mk(new THREE.SphereGeometry(.42,18,12),wh,0,.52,.14,b);bl.scale.set(.65,.95,.6);
    const bkk=mk(new THREE.ConeGeometry(.08,.22,8),or,0,.85,.42,b);bkk.rotation.x=Math.PI/2;eyes(b,.98,.34,.13,.75);
    [-1,1].forEach(sd=>{const f=mk(new THREE.BoxGeometry(.2,.06,.26),or,.15*sd,.04,.1,b);const w=outline(mk(new THREE.SphereGeometry(.16,10,8),bk,.42*sd,.6,0,b));w.scale.set(.3,1.1,.7);w.rotation.z=.3*sd});
    const sc2=mk(new THREE.TorusGeometry(.3,.07,8,18),SM(0xe8302a),0,.95,0,b);sc2.rotation.x=Math.PI/2;blobShadow(m.g,.75)}},
  armadura:{hp:5,r:.6,ai:'walk',spd:1.6,dmg:2,col:0x9aa2ae,make(m,col){const ar=new THREE.MeshStandardMaterial({color:LIN(col),roughness:.25,metalness:.85}),dk=SM(0x1a1a22),rd=SM(0xd8202a,{roughness:.6});m.mats=[ar];const b=m.body;
    const bd=outline(mk(new THREE.CylinderGeometry(.38,.32,.8,14),ar,0,.95,0,b));const hm=outline(mk(new THREE.SphereGeometry(.32,18,14),ar,0,1.62,0,b));
    mk(new THREE.BoxGeometry(.4,.06,.06),dk,0,1.6,.3,b,false);mk(new THREE.BoxGeometry(.06,.25,.06),dk,0,1.5,.3,b,false);const pl=mk(new THREE.SphereGeometry(.12,10,8),rd,0,1.95,-.05,b);pl.scale.set(.5,1.4,1.4);
    const eg=mk(new THREE.BoxGeometry(.3,.03,.03),SM(0xff3a2a,{emissive:0xff2a1a,emissiveIntensity:2}),0,1.6,.32,b,false);
    [-1,1].forEach(sd=>outline(mk(new THREE.CylinderGeometry(.13,.12,.55,10),ar,.16*sd,.28,0,b)));const tab=mk(new THREE.BoxGeometry(.5,.35,.05),rd,0,.95,.36,b,false);
    const sh=outline(mk(new THREE.BoxGeometry(.5,.7,.08),PM(0x3a4a8a,{metalness:.4}),-.48,1,.2,b));sh.rotation.y=.3;m.spear=new THREE.Group();m.spear.position.set(.48,1.1,.1);b.add(m.spear);
    mk(new THREE.CylinderGeometry(.03,.03,2,6),SM(0x5a3a1a),0,.3,0,m.spear);mk(new THREE.ConeGeometry(.08,.3,6),ar,0,1.4,0,m.spear);blobShadow(m.g,.85)}},
  yeti:{hp:20,r:1.4,ai:'boss',dmg:2,col:0xc8d4ea,make(m,col){const fur=P(col,{roughness:.8,clearcoat:.1}),bl=P(0x6ab0e8,{roughness:.4}),hn=PM(0xd8c8a0);m.mats=[fur,bl];const b=m.body;
    const bd=outline(mk(bumpy(new THREE.SphereGeometry(1.1,24,18),.06,9),fur,0,1.5,0,b),1.04);bd.scale.set(1.1,1.15,.9);const hd=outline(mk(bumpy(new THREE.SphereGeometry(.65,20,14),.06,9),fur,0,2.85,.15,b));
    const face=mk(new THREE.SphereGeometry(.48,18,12),bl,0,2.8,.42,b);face.scale.set(1,.9,.55);eyes(b,2.9,.68,.18,1.1);brows(b,3.1,.7,.18,1.1,true);
    const mo=mk(new THREE.BoxGeometry(.4,.1,.05),SM(0x1a1018),0,2.6,.68,b,false);[-1,1].forEach(sd=>{const t=mk(new THREE.ConeGeometry(.05,.12,6),SM(0xffffff),.12*sd,2.66,.69,b,false)});
    [-1,1].forEach(sd=>{const h=outline(mk(new THREE.ConeGeometry(.14,.6,10),hn,.45*sd,3.4,0,b));h.rotation.z=-.6*sd});
    m.arms=[-1,1].map(sd=>{const p=new THREE.Group();p.position.set(1.2*sd,2.1,0);b.add(p);outline(mk(new THREE.SphereGeometry(.4,16,12),fur,0,-.5,0,p)).scale.set(.8,1.4,.8);mk(new THREE.SphereGeometry(.32,14,10),bl,0,-1.15,.05,p);return p});
    [-1,1].forEach(sd=>outline(mk(new THREE.SphereGeometry(.4,14,10),fur,.5*sd,.35,0,b)).scale.set(1,.8,1.2));blobShadow(m.g,2.2)}},
};
function makeMob(kind,x,z,o={}){const t=MOB[kind];const col=o.col||t.col;
  const m={kind,ai:o.ai||t.ai,x,z,vx:0,vz:0,hp:o.hp||t.hp,max:o.hp||t.hp,r:t.r*(o.scale||1),t:R(0,6),hitT:0,col,home:[x,z],g:new THREE.Group(),body:new THREE.Group(),state:'idle',st:R(1,3),dir:R(0,6),y:0,
    fly:t.ai==='fly',dmg:o.dmg||t.dmg||1,spd:(o.spd||t.spd),shoot:o.shoot!==undefined?o.shoot:t.shoot,boss:o.boss||null,region:o.region,scale:o.scale||1,active:false};
  m.g.add(m.body);t.make(m,col,o);if(o.crown)crown(m.body,o.crown,1.2);m.g.scale.setScalar(m.scale);
  m.g.traverse(n=>{if(n.isMesh&&n.material!==OUT&&!n.material.transparent)n.castShadow=true});m.g.position.set(x,0,z);sc.add(m.g);mobs.push(m);return m}
/* proyectiles enemigos */
const HZ_G={bolt:new THREE.OctahedronGeometry(.18,0),ball:new THREE.SphereGeometry(.25,14,10),big:new THREE.SphereGeometry(.5,16,12),spike:new THREE.ConeGeometry(.08,.4,6)};
const HZ_M={fire:PM(0xff7a1a,{emissive:0xff4a00,emissiveIntensity:2.5}),snow:PM(0xffffff,{emissive:0x8ab8ff,emissiveIntensity:.3}),ink:PM(0x8a3aff,{emissive:0x6a2ad8,emissiveIntensity:1.6}),
  spike:SM(0xfff4c0),bubble:new THREE.MeshPhysicalMaterial({color:LIN(0xbfe8ff),roughness:0,clearcoat:1,transparent:true,opacity:.6,emissive:0x3a8aff,emissiveIntensity:.4}),sting:PM(0x8aff4a,{emissive:0x4aa82a,emissiveIntensity:1.5})};
function spawnHazard(kind,x,y,z,vx,vy,vz,o={}){const geo=o.geo||'bolt';const m=new THREE.Mesh(HZ_G[geo],HZ_M[kind]);m.castShadow=true;m.position.set(x,y,z);m.scale.setScalar(o.scale||1);sc.add(m);
  hazards.push({m,kind,x,y,z,vx,vy,vz,g:o.g||0,r:(o.r||.35)*(o.scale||1),dmg:o.dmg||1,life:o.life||3,splash:o.splash||0,geo})}
function updateHazards(dt){for(let i=hazards.length-1;i>=0;i--){const h=hazards[i];h.life-=dt;h.vy-=h.g*dt;h.x+=h.vx*dt;h.y+=h.vy*dt;h.z+=h.vz*dt;
  h.m.position.set(h.x,h.y,h.z);h.m.rotation.x+=dt*8;h.m.rotation.y+=dt*6;if(h.geo==='spike'){h.m.rotation.set(Math.PI/2,0,0);h.m.lookAt(h.x+h.vx,h.y,h.z+h.vz);h.m.rotateX(Math.PI/2)}
  let dead=h.life<=0;if(h.y<=.15&&h.g){dead=true;if(h.splash){burst(h.x,.3,h.z,h.kind==='snow'?0xffffff:0xff8a2a,14,2.5);if(Math.hypot(H.x-h.x,H.z-h.z)<h.splash)hurt(h.dmg,H.x-h.x,H.z-h.z,h)}}
  if(!dead&&blocked(h.x,h.z,h.r))dead=true;
  if(!dead&&h.y<2&&Math.hypot(H.x-h.x,H.z-h.z)<h.r+.45){if(shieldBlocks(h.vx,h.vz)){SFX.block();burst(h.x,h.y,h.z,0xffffff,8,2);dead=true}else{hurt(h.dmg,h.vx,h.vz,h);dead=true}}
  if(dead){sc.remove(h.m);hazards.splice(i,1)}}}
function aimAt(m,sp,y=1){const dx=H.x-m.x,dz=H.z-m.z,d=Math.hypot(dx,dz)||1;return [dx/d*sp,dz/d*sp]}
/* golpe a un bicho */
function hitMob(s,nx,nz,dmg){if(s.dead||s.hitT>.12)return;if(s.kind==='armadura'&&!s.boss&&s.state!=='stun'){const f=Math.sin(s.g.rotation.y)*-nx+Math.cos(s.g.rotation.y)*-nz;if(f>.55&&!(HC&&HC.dmg>1)){SFX.block();burst(s.x,1,s.z,0xffffff,6,2);s.hitT=.2;s.vx=nx*4;s.vz=nz*4;return}}
  if(s.state==='stun')dmg*=2;s.hp-=dmg;s.hitT=.28;const kb=s.boss?1.5:s.kind==='golem'?3:9;s.vx=nx*kb;s.vz=nz*kb;if(s.state==='charge'&&!s.boss){s.state='idle';s.st=1}
  SFX.hit();burst(s.x,.8*s.scale+s.y,s.z,s.col,10,2);shake=Math.max(shake,s.boss?.12:.05);
  if(s.hp<=0){s.dead=true;sc.remove(s.g);burst(s.x,.6+s.y,s.z,s.col,26,3);burst(s.x,.6+s.y,s.z,0xffffff,10,2);
    if(s.boss){onBossDefeated(s);return}
    dropGem(s.x,s.z,Math.min(4,s.max));if(Math.random()<.3)dropHeart(s.x,s.z);
    setTimeout(()=>{if(!GAME.on||s.boss)return;s.dead=false;s.hp=s.max;s.x=s.home[0];s.z=s.home[1];s.state='idle';s.hitT=0;sc.add(s.g)},25000)}}
/* inteligencia de cada bicho */
function updateMobs(dt){for(const s of mobs){if(s.dead)continue;const dx=H.x-s.x,dz=H.z-s.z,d=Math.hypot(dx,dz)||.01;
    s.active=d<34;s.g.visible=d<46;if(!s.active)continue;s.t+=dt;let face=Math.atan2(dx,dz);
    const flash=s.hitT>0?1.4:0;s.mats.forEach(mt=>{if(mt.emissive){if(mt.userData.e0===undefined)mt.userData.e0=mt.emissiveIntensity;mt.emissiveIntensity=flash||mt.userData.e0}});
    if(s.boss&&s.state==='sleep'){if(d<15&&!GAME.dead){s.state='idle';s.st=1.2;startBoss(s)}else{s.g.position.set(s.x,0,s.z);s.body.position.y=Math.sin(s.t*1.5)*.04;continue}}
    if(s.hitT>0){s.hitT-=dt;s.vx*=Math.pow(.01,dt);s.vz*=Math.pow(.01,dt)}
    else if(s.boss)bossAI(s,dt,dx,dz,d);
    else if(s.ai==='hop'){if(d<10){s.vx+=(dx/d*s.spd-s.vx)*dt*2;s.vz+=(dz/d*s.spd-s.vz)*dt*2}else{s.vx*=.95;s.vz*=.95}}
    else if(s.ai==='walk'){s.st-=dt;if(d<(s.kind==='golem'?11:7)){s.vx+=(dx/d*s.spd-s.vx)*dt*3;s.vz+=(dz/d*s.spd-s.vz)*dt*3}else{if(s.st<=0){s.st=R(1.5,3);s.dir=R(0,6.3);s.go=Math.random()<.7}
      const sp=s.go?s.spd*.5:0;s.vx+=(Math.sin(s.dir)*sp-s.vx)*dt*3;s.vz+=(Math.cos(s.dir)*sp-s.vz)*dt*3;if(sp)face=s.dir}}
    else if(s.ai==='charge'){s.st-=dt;
      if(s.state==='idle'){s.vx*=.9;s.vz*=.9;if(d<9&&s.st<=0){if(s.shoot&&Math.random()<.5){s.state='shoot';s.st=.5}else{s.state='aim';s.st=.6;s.cx=dx/d;s.cz=dz/d}}}
      else if(s.state==='shoot'){if(s.st<=0){const [vx,vz]=aimAt(s,9);spawnHazard('sting',s.x,1,s.z,vx,0,vz,{life:2});SFX.shoot();s.state='idle';s.st=1.4}}
      else if(s.state==='aim'){face=Math.atan2(s.cx,s.cz);s.body.position.x=R(-.04,.04);if(s.st<=0){s.state='charge';s.st=.85;SFX.tone(160,.3,'sawtooth',.05,90)}}
      else if(s.state==='charge'){face=Math.atan2(s.cx,s.cz);s.vx=s.cx*s.spd;s.vz=s.cz*s.spd;if(s.st<=0){s.state='idle';s.st=1.4}}
      else if(s.state==='stun'){s.vx*=.85;s.vz*=.85;if(s.st<=0){s.state='idle';s.st=1}}}
    else if(s.ai==='fly'){const near=d<12;const tx=near?H.x+Math.sin(s.t*1.3)*2.5:s.home[0]+Math.sin(s.t*.7)*3,tz=near?H.z+Math.cos(s.t*1.1)*2.5:s.home[1]+Math.cos(s.t*.6)*3;
      const ex=tx-s.x,ez=tz-s.z,el=Math.hypot(ex,ez)||1;s.vx+=(ex/el*s.spd-s.vx)*dt*2.5;s.vz+=(ez/el*s.spd-s.vz)*dt*2.5;s.y=(d<2.4?.75:1.7)+Math.sin(s.t*4)*.18}
    else if(s.ai==='turret'){s.st-=dt;if(d<10&&s.st<=0){s.st=2.6;for(let k=0;k<8;k++){const a=k/8*Math.PI*2+s.t;spawnHazard('spike',s.x,1,s.z,Math.sin(a)*6,0,Math.cos(a)*6,{geo:'spike',life:1.6,r:.25})}SFX.shoot();s.body.scale.set(1.15,.85,1.15)}
      s.body.scale.lerp(new THREE.Vector3(1,1,1),dt*6)}
    const ox=s.x,oz=s.z;s.x+=s.vx*dt;s.z+=s.vz*dt;
    if(!s.fly){collide(s,s.r);const moved=Math.abs(s.x-ox-s.vx*dt)+Math.abs(s.z-oz-s.vz*dt);if(s.state==='charge'&&moved>.01){s.state='stun';s.st=s.boss?2.2:1.6;shake=.2;SFX.tone(200,.2,'square',.06,60);burst(s.x,.8,s.z,0xffe08a,12,2)}}
    else{s.x=clamp(s.x,WORLD.minX,WORLD.maxX);s.z=clamp(s.z,WORLD.minZ,WORLD.maxZ)}
    // animación
    let dr=angDiff(face,s.g.rotation.y);s.g.rotation.y+=dr*Math.min(1,dt*8);const spd=Math.hypot(s.vx,s.vz);const sc1=s.scale;
    if(s.kind==='slime'){const hop=Math.abs(Math.sin(s.t*(s.boss?2.4:5)));s.g.position.set(s.x,s.boss?s.y:hop*.28,s.z);if(!s.boss)s.body.scale.set(1+(1-hop)*.16,1-(1-hop)*.16,1+(1-hop)*.16)}
    else if(s.kind==='seta'){s.g.position.set(s.x,0,s.z);const w=spd>.2?s.t*12:0;s.feet.forEach((f,i)=>{f.position.z=.05+Math.sin(w+i*Math.PI)*.12;f.position.y=.1+Math.max(0,Math.cos(w+i*Math.PI))*.06});s.body.position.y=spd>.2?Math.abs(Math.sin(w))*.06:Math.sin(s.t*2)*.02;s.body.rotation.z=spd>.2?Math.sin(w)*.08:0}
    else if(s.kind==='escarabajo'||s.kind==='escorpion'||s.kind==='cangrejo'){s.g.position.set(s.x,0,s.z);const w=s.t*(s.state==='charge'?40:spd>.2?14:2);s.legs.forEach((l,i)=>l.rotation.x=Math.sin(w+i)*.5);
      s.body.rotation.z=s.state==='stun'?Math.sin(s.t*20)*.15:0;if(s.state!=='aim')s.body.position.x=0;if(s.claws)s.claws.forEach((c,i)=>c.rotation.y=Math.sin(s.t*6+i)*.3);if(s.tail)s.tail.rotation.x=Math.sin(s.t*3)*.15+(s.state==='shoot'?-.4:0)}
    else if(s.kind==='pinguino'){s.g.position.set(s.x,0,s.z);s.body.rotation.x=s.state==='charge'?1.25:0;s.body.position.y=s.state==='charge'?.25:Math.abs(Math.sin(s.t*8))*(spd>.2?.08:0);s.body.rotation.z=spd>.2&&s.state!=='charge'?Math.sin(s.t*8)*.15:0}
    else if(s.kind==='murcielago'){s.g.position.set(s.x,s.y,s.z);const f=Math.sin(s.t*18);s.wings[0].rotation.z=f*.7;s.wings[1].rotation.z=-f*.7;s.sh.position.y=-s.y/sc1+.03}
    else if(s.kind==='golem'||s.kind==='yeti'){s.g.position.set(s.x,s.y||0,s.z);const w=spd>.2?s.t*5:0;s.body.position.y=Math.abs(Math.sin(w))*.08;s.body.rotation.z=Math.sin(w)*.05;if(!s.pose)s.arms.forEach((a,i)=>a.rotation.x=Math.sin(w+i*Math.PI)*.5)}
    else if(s.kind==='armadura'){s.g.position.set(s.x,0,s.z);const w=spd>.2?s.t*8:0;s.body.position.y=Math.abs(Math.sin(w))*.05;s.spear.rotation.x=s.hitT>0?-.6:Math.sin(w)*.1}
    else if(s.kind==='cactus'){s.g.position.set(s.x,0,s.z);s.body.rotation.z=Math.sin(s.t*2)*.04}
    const hitR=s.r+.45;if(d<hitR&&s.hitT<=0&&(!s.fly||s.y<1.1)&&s.state!=='stun'&&!(s.boss&&s.state==='air'))hurt(s.dmg,dx,dz,s)}}
/* jefes: cada uno pelea a su manera */
function bossAI(s,dt,dx,dz,d){s.st-=dt;const B=s.boss;
  if(B.type==='rey'){ // Rey Gelatina: salta encima de ti
    if(s.state==='idle'){s.vx*=.9;s.vz*=.9;if(s.st<=0){s.state='air';s.st=1.0;s.tx=H.x;s.tz=H.z;s.sx=s.x;s.sz=s.z;SFX.tone(300,.5,'triangle',.06,900);
        if(!s.mark){s.mark=new THREE.Mesh(new THREE.RingGeometry(1.6,2.1,32),new THREE.MeshBasicMaterial({color:0xff3a3a,transparent:true,opacity:.6,depthWrite:false}));s.mark.rotation.x=-Math.PI/2;sc.add(s.mark)}s.mark.visible=true;s.mark.position.set(s.tx,.06,s.tz)}}
    else if(s.state==='air'){const k=1-s.st/1;s.x=lerp(s.sx,s.tx,k);s.z=lerp(s.sz,s.tz,k);s.y=Math.sin(k*Math.PI)*6;s.vx=s.vz=0;s.mark.material.opacity=.3+k*.5;
      if(s.st<=0){s.y=0;s.state='idle';s.st=s.hp<s.max/2?1.1:1.7;s.mark.visible=false;shake=.5;SFX.boom();puff(s.x,.3,s.z,0xffffff,10,.6);burst(s.x,.5,s.z,s.col,30,4);
        if(Math.hypot(H.x-s.x,H.z-s.z)<2.6&&!H.shield)hurt(2,H.x-s.x,H.z-s.z,s);if(s.hp<s.max/2&&!s.split){s.split=1;[-1,1].forEach(sd=>makeMob('slime',s.x+sd*2,s.z+1,{col:s.col,region:s.region}))}}}
    s.body.scale.set(1+(s.state==='idle'?Math.sin(s.t*6)*.05:0),1-(s.state==='idle'?Math.sin(s.t*6)*.05:0),1)}
  else if(B.type==='cangrejo'||B.type==='escorpion'){ // embiste y dispara
    if(s.state==='idle'){s.vx*=.9;s.vz*=.9;if(s.st<=0){const r=Math.random();if(r<.45){s.state='shoot';s.st=.4;s.n=B.type==='escorpion'?3:1}else{s.state='aim';s.st=.7;s.cx=dx/d;s.cz=dz/d}}}
    else if(s.state==='shoot'){if(s.st<=0){if(B.type==='cangrejo'){for(let k=-2;k<=2;k++){const a=Math.atan2(dx,dz)+k*.28;spawnHazard('bubble',s.x,1.2,s.z,Math.sin(a)*6,0,Math.cos(a)*6,{geo:'ball',life:2.4})}}
        else{const [vx,vz]=aimAt(s,11);spawnHazard('sting',s.x,1.4,s.z,vx,0,vz,{life:2})}SFX.shoot();s.n--;s.st=.35;if(s.n<=0){s.state='idle';s.st=1}}}
    else if(s.state==='aim'){s.g.rotation.y=Math.atan2(s.cx,s.cz);s.body.position.x=R(-.06,.06);if(s.st<=0){s.state='charge';s.st=1.1;SFX.tone(140,.4,'sawtooth',.06,70)}}
    else if(s.state==='charge'){s.vx=s.cx*s.spd;s.vz=s.cz*s.spd;if(s.st<=0){s.state='idle';s.st=1}}
    else if(s.state==='stun'){s.vx*=.85;s.vz*=.85;if(s.st<=0){s.state='idle';s.st=.8}}}
  else if(B.type==='yeti'){ // bolas de nieve y golpe al suelo
    s.vx+=(dx/d*1.4-s.vx)*dt*2;s.vz+=(dz/d*1.4-s.vz)*dt*2;
    if(s.state==='idle'&&s.st<=0){if(d<5){s.state='pound';s.st=.8;s.pose=1}else{s.state='throw';s.st=.6;s.pose=1}}
    if(s.state==='throw'){s.arms[1].rotation.x=-2.5+(.6-s.st)*4;if(s.st<=0){const t=1.1;spawnHazard('snow',s.x,3,s.z,(H.x-s.x)/t,4,(H.z-s.z)/t,{geo:'big',g:14,life:3,splash:1.8,dmg:2});SFX.shoot();s.state='idle';s.st=s.hp<s.max/2?1.2:1.8;s.pose=0}}
    if(s.state==='pound'){s.arms.forEach(a=>a.rotation.x=-2.8+(.8-s.st)*3.5);s.vx*=.5;s.vz*=.5;if(s.st<=0){shake=.6;SFX.boom();puff(s.x,.3,s.z,0xffffff,14,.7);for(let k=0;k<10;k++){const a=k/10*Math.PI*2;spawnHazard('snow',s.x,.5,s.z,Math.sin(a)*7,0,Math.cos(a)*7,{geo:'ball',life:1.2})}
        if(d<3.2)hurt(2,dx,dz,s);s.state='idle';s.st=1.6;s.pose=0}}}
  else if(B.type==='lava'){ // anillos de fuego
    s.vx+=(dx/d*1.0-s.vx)*dt*2;s.vz+=(dz/d*1.0-s.vz)*dt*2;
    if(s.state==='idle'&&s.st<=0){s.state='ring';s.st=.9;s.pose=1}
    if(s.state==='ring'){s.arms.forEach(a=>a.rotation.x=-2.6);s.body.position.y=Math.sin(s.st*20)*.05;if(s.st<=0){const n=s.hp<s.max/2?14:10,off=Math.random();for(let k=0;k<n;k++){const a=(k+off)/n*Math.PI*2;spawnHazard('fire',s.x,1.2,s.z,Math.sin(a)*6.5,0,Math.cos(a)*6.5,{geo:'ball',life:2.2})}
        const [vx,vz]=aimAt(s,8);spawnHazard('fire',s.x,1.5,s.z,vx,2,vz,{geo:'big',g:6,life:3,splash:1.6,dmg:2});SFX.boom();shake=.3;s.state='idle';s.st=2;s.pose=0}}}
  else if(B.type==='final'){ // Rey de la Chatarra: de todo
    if(s.state==='idle'){s.vx+=(dx/d*1.8-s.vx)*dt*2;s.vz+=(dz/d*1.8-s.vz)*dt*2;if(s.st<=0){const r=Math.random();
      if(r<.35){s.state='shoot';s.st=.3;s.n=5}else if(r<.7){s.state='aim';s.st=.7;s.cx=dx/d;s.cz=dz/d}else{s.state='summon';s.st=.8}}}
    else if(s.state==='shoot'){s.vx*=.8;s.vz*=.8;if(s.st<=0){const a=Math.atan2(dx,dz)+R(-.25,.25);spawnHazard('ink',s.x,1.8,s.z,Math.sin(a)*10,0,Math.cos(a)*10,{life:2.5});SFX.shoot();s.n--;s.st=.22;if(s.n<=0){s.state='idle';s.st=1.2}}}
    else if(s.state==='aim'){s.g.rotation.y=Math.atan2(s.cx,s.cz);if(s.st<=0){s.state='charge';s.st=1;SFX.tone(140,.4,'sawtooth',.06,70)}}
    else if(s.state==='charge'){s.vx=s.cx*11;s.vz=s.cz*11;if(s.st<=0){s.state='idle';s.st=1}}
    else if(s.state==='stun'){s.vx*=.85;s.vz*=.85;if(s.st<=0){s.state='idle';s.st=.8}}
    else if(s.state==='summon'){s.vx*=.8;s.vz*=.8;if(s.st<=0){if(mobs.filter(m=>!m.dead&&m.kind==='armadura'&&m.region===s.region).length<4)[-1,1].forEach(sd=>{const a=makeMob('armadura',s.x+sd*3,s.z+2,{region:s.region});puff(a.x,.5,a.z,0xaa88ff,10,.5)});SFX.door();s.state='idle';s.st=1.5}}}}
