"use strict";
/* ============ personajes ============ */
const CHARS=[
  {id:'ekain',name:'EKAIN',desc:'Espada larga y el más rápido.',power:'TAJO GIRATORIO: golpea a todo lo que le rodea',h:1.12,skin:0xf2c8a0,hair:0x3a2414,style:'spiky',top:0x2a6ad8,pants:0x2a2a3a,shoes:0xffffff,weapon:'sword',spd:6.6,dmg:1,reach:1.9,hp:6,spin:true},
  {id:'sendoa',name:'SENDOA',desc:'Escudo enorme y un corazón más.',power:'ESCUDO TOTAL: para golpes de cualquier lado',h:1.08,skin:0xf0c49a,hair:0x1a1410,style:'fringe',top:0xd8302a,pants:0x2a3a5a,shoes:0x222222,weapon:'sword',spd:5.7,dmg:1,reach:1.8,hp:8,bigShield:true},
  {id:'galder',name:'GALDER',desc:'Futbolista con el 10.',power:'CHUT AUTOMÁTICO: el balón busca al bicho',h:.92,skin:0xf4cca6,hair:0x6a4224,style:'short',top:0xff7a1a,pants:0x111111,shoes:0x2ad84a,weapon:'ball',num:'10',spd:6.2,dmg:1,reach:1.6,hp:6,ranged:true},
  {id:'aitor',name:'AITOR',desc:'Llave inglesa gigante.',power:'GOLPE DOBLE: quita el doble de vida',h:1.24,skin:0xe8b88a,hair:0x2a1a12,style:'buzz',beard:true,top:0x1a3a6a,pants:0x1a3a6a,shoes:0x3a2412,weapon:'wrench',helmet:0xffc21a,spd:5.3,dmg:2,reach:2.15,hp:6},
  {id:'virgi',name:'VIRGI',desc:'Arco mágico de cristal.',power:'FLECHA MÁGICA: apunta sola y atraviesa',h:1.14,skin:0xf4cca8,hair:0x5a3218,style:'pony',top:0x8a3ad8,pants:0x2a2a3a,shoes:0xff5a8a,weapon:'bow',spd:5.9,dmg:1,reach:1.7,hp:6,ranged:true,pierce:true}];
function slashMat(){const m=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending,uniforms:{op:{value:0},col:{value:new THREE.Color(0xbfe6ff)}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'uniform float op;uniform vec3 col;varying vec2 vUv;void main(){float a=pow(vUv.x,1.6)*smoothstep(0.,.9,vUv.y)*(1.-smoothstep(.92,1.,vUv.y));gl_FragColor=vec4(mix(col,vec3(1.),vUv.y*vUv.x)*a*op*1.6,a*op);}'});
  Object.defineProperty(m,'opacity',{get(){return this.uniforms.op.value},set(v){if(this.uniforms)this.uniforms.op.value=v}});return m}
function arcGeo(r0,r1,span,seg=40){const pos=[],uv=[],idx=[];for(let i=0;i<=seg;i++){const a=i/seg*span,u=1-i/seg;[r0,r1].forEach((r,k)=>{pos.push(Math.cos(a)*r,Math.sin(a)*r,0);uv.push(u,k)})}
  for(let i=0;i<seg;i++){const a=i*2;idx.push(a,a+1,a+2,a+1,a+3,a+2)}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);return g}
function makeChar(c){const root=new THREE.Group(),body=new THREE.Group();root.add(body);
  const skin=S(c.skin,{roughness:.55}),hair=P(c.hair,{roughness:.45,clearcoat:.4}),top=P(c.top,{roughness:.5,clearcoat:.3}),pants=S(c.pants,{roughness:.7}),shoe=P(c.shoes,{roughness:.4});
  const legs=[-1,1].map(sd=>{const g=new THREE.Group();g.position.set(.15*sd,.62,0);body.add(g);mk(new THREE.CylinderGeometry(.11,.1,.5,10),pants,0,-.27,0,g);
    const sh=mk(new THREE.SphereGeometry(.14,12,8),shoe,0,-.55,.05,g);sh.scale.set(1,.65,1.35);return g});
  mk(new THREE.CylinderGeometry(.27,.33,.62,16),top,0,.95,0,body);
  if(c.id==='aitor'){mk(new THREE.BoxGeometry(.5,.07,.02),S(0xff8a1a,{emissive:0x8a3a00,emissiveIntensity:.4}),0,1.05,.3,body);[-.12,.12].forEach(x=>mk(new THREE.BoxGeometry(.06,.5,.02),S(0x0f2a4a),x,1.02,.31,body))}
  if(c.num){const t=cv(64,64,(g)=>{g.clearRect(0,0,64,64);g.fillStyle='#fff';g.font='bold 40px Arial Black';g.textAlign='center';g.textBaseline='middle';g.fillText(c.num,32,34)});t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
    const n=new THREE.Mesh(new THREE.PlaneGeometry(.3,.3),new THREE.MeshBasicMaterial({map:t,transparent:true}));n.position.set(0,.98,.32);body.add(n);const n2=n.clone();n2.position.z=-.32;n2.rotation.y=Math.PI;body.add(n2)}
  if(c.id==='virgi'){const cape=mk(new THREE.CylinderGeometry(.3,.45,.7,16,1,true,Math.PI*.6,Math.PI*.8),S(0x5a2a9a,{side:THREE.DoubleSide,roughness:.7}),0,.9,0,body);cape.rotation.y=Math.PI*.5}
  if(c.id==='ekain'){const sc2=mk(new THREE.TorusGeometry(.28,.06,8,20),S(0xffd84a),0,1.2,0,body);sc2.rotation.x=Math.PI/2}
  mk(new THREE.CylinderGeometry(.335,.335,.08,16),S(0x3a2414),0,.68,0,body);
  const arms=[-1,1].map(sd=>{const g=new THREE.Group();g.position.set(.36*sd,1.18,0);body.add(g);mk(new THREE.CylinderGeometry(.085,.08,.46,8),top,0,-.2,0,g);mk(new THREE.SphereGeometry(.1,10,8),skin,0,-.47,0,g);return g});
  const head=new THREE.Group();head.position.y=1.62;body.add(head);mk(new THREE.SphereGeometry(.42,28,20),skin,0,0,0,head);
  [-1,1].forEach(sd=>mk(new THREE.SphereGeometry(.09,10,8),skin,.41*sd,-.02,0,head));
  const eyes=[];[-.15,.15].forEach(x=>{const e=mk(new THREE.SphereGeometry(.085,14,12),S(0x1a1a22,{roughness:.15}),x,-.02,.36,head,false);e.scale.set(.8,1.15,.55);eyes.push(e);
    mk(new THREE.SphereGeometry(.028,8,6),S(0xffffff,{emissive:0xffffff,emissiveIntensity:.6}),x+.03,.02,.405,head,false);
    const br=mk(new THREE.BoxGeometry(.14,.035,.04),hair,x,.13,.385,head,false);br.rotation.z=x>0?-.12:.12});
  const mouth=mk(new THREE.TorusGeometry(.06,.016,6,12,Math.PI),S(0x8a2a2a),0,-.17,.385,head,false);mouth.rotation.z=Math.PI;
  [-1,1].forEach(sd=>{const ck=mk(new THREE.SphereGeometry(.06,8,6),S(0xff8a7a,{transparent:true,opacity:.35}),.25*sd,-.11,.33,head,false);ck.scale.z=.3});
  const cap=mk(new THREE.SphereGeometry(.45,26,16,0,Math.PI*2,0,Math.PI*.5),hair,0,.02,-.03,head);cap.rotation.x=-.42;
  if(c.style==='spiky')for(let i=0;i<9;i++){const a=i/9*Math.PI*2;const s=mk(new THREE.ConeGeometry(.1,.3,6),hair,Math.cos(a)*.25,.38,Math.sin(a)*.25-.05,head);s.rotation.set(Math.sin(a)*.6,0,-Math.cos(a)*.6)}
  if(c.style==='fringe')for(let i=0;i<5;i++){const f=mk(new THREE.SphereGeometry(.1,10,8),hair,-.22+i*.11,.24,.33,head);f.scale.set(1,1.3,.5)}
  if(c.style!=='buzz'){const back=mk(new THREE.SphereGeometry(.445,22,12,Math.PI*.15,Math.PI*.7,Math.PI*.3,Math.PI*.45),hair,0,0,-.03,head);back.rotation.y=Math.PI}
  if(c.style==='pony'){const pt=mk(new THREE.SphereGeometry(.16,12,10),hair,0,.05,-.5,head);pt.scale.set(.8,1.5,.8);const tie=mk(new THREE.TorusGeometry(.08,.03,6,12),P(0xff5a8a),0,.22,-.44,head);tie.rotation.x=1.2;
    [-1,1].forEach(sd=>{const lk=mk(new THREE.SphereGeometry(.12,10,8),hair,.36*sd,-.2,.05,head);lk.scale.set(.6,1.6,.8)})}
  if(c.beard){const bd=mk(new THREE.SphereGeometry(.425,22,12,Math.PI*1.1,Math.PI*.8,Math.PI*.62,Math.PI*.3),P(c.hair,{roughness:.8,clearcoat:0}),0,0,0,head);bd.rotation.y=Math.PI;mk(new THREE.BoxGeometry(.16,.04,.03),P(c.hair,{roughness:.8,clearcoat:0}),0,-.11,.4,head,false)}
  if(c.hat){mk(new THREE.CylinderGeometry(.55,.55,.04,20),S(c.hat),0,.32,0,head);mk(new THREE.CylinderGeometry(.3,.33,.28,16),S(c.hat),0,.46,0,head)}
  if(c.hood){const hd=mk(new THREE.SphereGeometry(.5,22,14,0,Math.PI*2,0,Math.PI*.62),S(c.hood,{roughness:.9}),0,.02,-.05,head);hd.rotation.x=-.5;const fr=mk(new THREE.TorusGeometry(.4,.09,8,22),S(0xf4f0e8,{roughness:1}),0,.0,.18,head);fr.scale.y=1.15}
  if(c.helmet){const hm=mk(new THREE.SphereGeometry(.47,26,16,0,Math.PI*2,0,Math.PI*.5),P(c.helmet,{roughness:.25}),0,.08,-.02,head);hm.rotation.x=-.3;const vz=mk(new THREE.BoxGeometry(.66,.05,.26),P(c.helmet),0,.2,.38,head);vz.rotation.x=-.3}
  // arma
  const hand=new THREE.Group();hand.position.set(0,-.47,0);arms[1].add(hand);const weapon=new THREE.Group();hand.add(weapon);
  if(c.weapon==='sword'){const bl=c.id==='ekain'?1.25:1.05;mk(new THREE.BoxGeometry(.1,bl,.035),P(0xe8f0ff,{metalness:.9,roughness:.08,emissive:0x3a7aff,emissiveIntensity:.35}),0,.1+bl/2,0,weapon);mk(new THREE.ConeGeometry(.07,.16,4),P(0xe8f0ff,{metalness:.9,roughness:.08}),0,.18+bl,0,weapon).rotation.y=Math.PI/4;
    mk(new THREE.BoxGeometry(.42,.08,.1),P(0xffc84f,{metalness:1,roughness:.2}),0,.1,0,weapon);mk(new THREE.CylinderGeometry(.04,.04,.22,8),S(0x5a3a1a),0,-.03,0,weapon);mk(new THREE.SphereGeometry(.06,8,6),P(0xff3a4a,{emissive:0xaa0010,emissiveIntensity:.6}),0,-.16,0,weapon)}
  if(c.weapon==='wrench'){const wm=P(0xc8d0dc,{metalness:.95,roughness:.18});mk(new THREE.BoxGeometry(.13,1.05,.07),wm,0,.5,0,weapon);const hd=mk(new THREE.TorusGeometry(.17,.07,8,16,Math.PI*1.4),wm,0,1.12,0,weapon);hd.rotation.z=-Math.PI*.2;mk(new THREE.CylinderGeometry(.07,.07,.3,8),S(0xd8302a),0,0,0,weapon)}
  if(c.weapon==='ball'){mk(new THREE.SphereGeometry(.2,18,14),S(0xffffff,{map:BALL_T,roughness:.4}),0,.05,.15,weapon)}
  if(c.weapon==='bow'){const bm=P(0x8a4a2a,{roughness:.4});const b=mk(new THREE.TorusGeometry(.5,.035,6,20,Math.PI),bm,0,.4,0,weapon);b.rotation.z=-Math.PI/2;mk(new THREE.CylinderGeometry(.008,.008,1,4),S(0xffffff),-.02,.4,0,weapon);
    mk(new THREE.OctahedronGeometry(.08,0),P(0xff4ad8,{emissive:0xc02aa8,emissiveIntensity:1}),.5,.4,0,weapon)}
  if(c.cane){const cn=mk(new THREE.CylinderGeometry(.03,.03,1.1,6),S(0x6a4424),0,.05,.05,hand);cn.position.y=-.1}
  if(c.rod){const rd=mk(new THREE.CylinderGeometry(.02,.03,2.2,6),S(0x8a5a2a),0,.9,.2,hand);rd.rotation.x=.5}
  // escudo
  const shield=new THREE.Group();shield.visible=!c.noShield;shield.position.set(-.1,-.38,.16);arms[0].add(shield);const shs=c.bigShield?1.35:1;
  mk(new THREE.CylinderGeometry(.3*shs,.3*shs,.07,20),P(c.bigShield?0xd8302a:0x3a6ad8,{metalness:.3}),0,0,0,shield).rotation.set(Math.PI/2,0,0);
  mk(new THREE.CylinderGeometry(.12*shs,.12*shs,.09,6),P(0xffc84f,{metalness:1,roughness:.2}),0,0,.02,shield).rotation.set(Math.PI/2,0,0);shield.rotation.y=-.35;
  blobShadow(root,.65);
  arms[1].rotation.order='YXZ';
  const slash=new THREE.Mesh(arcGeo(.5,c.reach*1.05,c.spin?3.6:1.6),slashMat());
  slash.rotation.x=-Math.PI/2;slash.position.y=1.0;root.add(slash);
  root.scale.setScalar(c.h);root.traverse(o=>{if(o.isMesh&&!o.material.transparent)o.castShadow=true});
  Object.assign(root.userData,{c,body,legs,arms,head,weapon,shield,slash,eyes});return root}
const BALL_T=cv(128,64,(g)=>{g.fillStyle='#fff';g.fillRect(0,0,128,64);g.fillStyle='#111';for(let i=0;i<6;i++){g.beginPath();g.arc(i*24+8,(i%2)*30+16,9,0,7);g.fill()}});
/* animación del personaje: andar, escudo, tajo */
function animChar(m,o){const u=m.userData,c=u.c,T=o.time;const walk=o.moving?T*11:0,amp=o.moving?.55:0;
  u.legs[0].rotation.x=Math.sin(walk)*amp;u.legs[1].rotation.x=-Math.sin(walk)*amp;u.body.position.y=o.moving?Math.abs(Math.sin(walk))*.06:Math.sin(T*2)*.015;
  u.arms[0].rotation.x=o.shield?-1.35:-Math.sin(walk)*amp*.6;u.arms[0].rotation.z=o.shield?.5:0;
  u.slash.material.opacity=0;u.arms[1].rotation.set(0,0,0);u.body.rotation.y=0;u.weapon.visible=true;u.weapon.rotation.set(.25,0,0);
  if(o.swing>0){const k=1-o.swing/o.swingT,e=1-Math.pow(1-k,3);
    if(c.weapon==='ball'){u.legs[1].rotation.x=-1.5*Math.sin(k*Math.PI);u.arms[1].rotation.x=.5;u.arms[0].rotation.x=-.5;u.weapon.visible=k>.55}
    else if(c.weapon==='bow'){u.arms[1].rotation.x=-1.5;u.arms[0].rotation.x=-1.45;u.weapon.rotation.set(Math.PI,0,Math.PI/2);u.body.rotation.y=-.2}
    else if(c.spin){u.body.rotation.y=-e*Math.PI*2;u.arms[1].rotation.x=-1.5;u.arms[1].rotation.y=1.2;u.weapon.rotation.x=Math.PI;u.slash.material.opacity=Math.sin(k*Math.PI)*.9;u.slash.rotation.z=(1.2-e*Math.PI*2)-Math.PI/2}
    else{const ang=1.3-e*2.6;u.arms[1].rotation.x=-1.45;u.arms[1].rotation.y=ang;u.weapon.rotation.x=Math.PI;u.body.rotation.y=-(e-.5)*.8;
      u.slash.material.opacity=Math.sin(k*Math.PI)*.9;u.slash.rotation.z=(ang+u.body.rotation.y)-Math.PI/2}}
  else u.arms[1].rotation.x=Math.sin(walk)*amp*.6-.15;
  // parpadeo
  const blink=(T%3.7)<.12;u.eyes.forEach(e=>e.scale.y=blink?.15:1.15)}
