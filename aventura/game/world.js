"use strict";
/* ============ el mundo abierto: 6 regiones una detrás de otra ============ */
const RW=32,RD=72;
const WORLD={minX:-RW+1,maxX:RW-1,minZ:-6*RD+1,maxZ:-1};
const regZ=i=>[-i*RD,-(i+1)*RD]; // [sur, norte]
const regionAt=z=>clamp(Math.floor(-z/RD),0,5);
const COLS=[[],[],[],[],[],[]];
function addCol(reg,x,z,r){const c={x,z,r};COLS[reg].push(c);return c}
function addBox(reg,x0,x1,z0,z1){const c={box:[x0,x1,z0,z1]};COLS[reg].push(c);return c}
function eachCol(z,f){const r=regionAt(z);for(let k=Math.max(0,r-1);k<=Math.min(5,r+1);k++)for(const c of COLS[k])if(!c.dead)f(c)}
function collide(o,r){eachCol(o.z,c=>{if(c.box){const [x0,x1,z0,z1]=c.box;const cx=clamp(o.x,x0,x1),cz=clamp(o.z,z0,z1),dx=o.x-cx,dz=o.z-cz,d=Math.hypot(dx,dz);
      if(d<r){if(d<1e-4){const pen=[o.x-x0,x1-o.x,o.z-z0,z1-o.z];const m=Math.min(...pen);if(m===pen[0])o.x=x0-r;else if(m===pen[1])o.x=x1+r;else if(m===pen[2])o.z=z0-r;else o.z=z1+r}else{o.x=cx+dx/d*r;o.z=cz+dz/d*r}}return}
    const dx=o.x-c.x,dz=o.z-c.z,d=Math.hypot(dx,dz),m=r+c.r;if(d<m&&d>1e-4){o.x=c.x+dx/d*m;o.z=c.z+dz/d*m}});
  o.x=clamp(o.x,WORLD.minX,WORLD.maxX);o.z=clamp(o.z,WORLD.minZ,WORLD.maxZ)}
function blocked(x,z,r){let b=false;eachCol(z,c=>{if(b)return;if(c.box){const [x0,x1,z0,z1]=c.box;if(x>x0-r&&x<x1+r&&z>z0-r&&z<z1+r)b=true}else if(Math.hypot(x-c.x,z-c.z)<r+c.r)b=true});return b||x<WORLD.minX||x>WORLD.maxX||z<WORLD.minZ||z>WORLD.maxZ}

/* ---------- elementos reutilizables ---------- */
const leafPal={bosque:[[0x4ac03a,0x12541c],[0x5ad04a,0x1a6a22],[0x3aae34,0x0e4a18],[0x7ac83a,0x2a6a14]],otono:[[0xffa82a,0x8a3a0a],[0xff7a2a,0x7a2a0a],[0xffd04a,0x8a5a0a]]};
const TREES=[];const PALM_M=new THREE.MeshStandardMaterial({color:0x3aa83a,roughness:.7,side:THREE.DoubleSide});const LEAF_M=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.8,envMapIntensity:.5});const BUSH_M=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.75,envMapIntensity:.5});
function tree(g,reg,x,z,s,pal){const t=new THREE.Group();const trunk=SM(0x8a5a2e,{roughness:.9});mk(bumpy(new THREE.CylinderGeometry(.22*s,.38*s,2*s,10,4),.06),trunk,0,s,0,t);
  const [top,bot]=pickS(pal||leafPal.bosque);const lm=LEAF_M;
  [[0,2.5,0,1.35],[.85,2.1,.35,1],[-.75,2.15,-.2,1.05],[.1,3.3,.1,.95],[-.35,2.7,.75,.85],[.5,2.8,-.6,.8]].forEach(([a,b,c,r])=>mk(shade(bumpy(new THREE.SphereGeometry(r*s,12,9),.08),top,bot),lm,a*s,b*s,c*s,t));
  t.position.set(x,0,z);t.rotation.y=RS(0,6);g.add(t);addCol(reg,x,z,.55*s);return t}
function pine(g,reg,x,z,s,snow){const t=new THREE.Group();mk(new THREE.CylinderGeometry(.18*s,.28*s,1.2*s,8),SM(0x6a4424),0,.6*s,0,t);
  const lm=SM(snow?0x2a6a4a:0x2a7a3a,{roughness:.8}),sm=SM(0xf4f8ff,{roughness:.6});
  for(let i=0;i<4;i++){const r=(1.5-i*.3)*s,y=(1.2+i*.85)*s;mk(new THREE.ConeGeometry(r,1.3*s,9),lm,0,y,0,t);if(snow)mk(new THREE.ConeGeometry(r*.75,.55*s,9),sm,0,y+.42*s,0,t)}
  t.position.set(x,0,z);t.rotation.y=RS(0,6);g.add(t);addCol(reg,x,z,.5*s);return t}
function rock(g,reg,x,z,s,col,moss,collide=true){const r=mk(bumpy(new THREE.DodecahedronGeometry(s,1),.12),SM(col,{roughness:.85,flatShading:true}),x,s*.45,z,g);r.scale.y=RS(.65,.95);r.rotation.y=RS(0,6);
  if(moss){const m=mk(bumpy(new THREE.SphereGeometry(s*.82,12,6,0,Math.PI*2,0,Math.PI*.35),.1),SM(moss,{roughness:.9,flatShading:true}),x,s*.52,z,g);m.scale.y=.75}if(collide)addCol(reg,x,z,s*.85);return r}
function bush(g,reg,x,z,s,c1=0x5ad04a,c2=0x1f6a24){const b=mk(shade(bumpy(new THREE.SphereGeometry(s,12,8),.1),c1,c2),BUSH_M,x,s*.6,z,g);b.scale.y=.8;b.geometry.dispose&&0;addCol(reg,x,z,s*.75);
  if(RS(0,1)<.4)for(let i=0;i<4;i++){const a=RS(0,6.3);mk(new THREE.SphereGeometry(.07,6,4),SM(pickS([0xff3a4a,0xffe03a,0xffffff])),x+Math.cos(a)*s*.8,s*.9,z+Math.sin(a)*s*.8,g,false)}return b}
function palm(g,reg,x,z,s){const t=new THREE.Group();const tm=SM(0xa8784a,{roughness:.9});let px=0,py=0;for(let i=0;i<7;i++){const seg=mk(new THREE.CylinderGeometry(.16*s,.2*s,.62*s,8),tm,px,py+.31*s,0,t);seg.rotation.z=-.12;px+=.08*s;py+=.6*s}
  const lm=PALM_M;for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const lf=new THREE.Mesh(new THREE.PlaneGeometry(.55*s,2.2*s,1,4),lm);
    const pos=lf.geometry.attributes.position;for(let k=0;k<pos.count;k++){const yy=pos.getY(k);pos.setZ(k,-Math.pow((yy+1.1*s)/(2.2*s),2)*1.1*s)}lf.geometry.computeVertexNormals();
    lf.position.set(px,py,0);lf.rotation.set(-1.2,a,0,'YXZ');lf.translateY(1.1*s);lf.castShadow=true;t.add(lf)}
  [0,1,2].forEach(k=>mk(new THREE.SphereGeometry(.14*s,8,6),SM(0x6a4a1a),px+Math.cos(k*2)*.2*s,py-.15*s,Math.sin(k*2)*.2*s,t));t.position.set(x,0,z);t.rotation.y=RS(0,6);g.add(t);addCol(reg,x,z,.35*s);return t}
function house(g,reg,x,z,rot,wall,roof,label){const h=new THREE.Group();mk(new THREE.BoxGeometry(6,3.4,4.6),SM(0xffffff,{map:wall,roughness:.85}),0,1.7,0,h);
  [-1,1].forEach(sd=>{const r=mk(new THREE.BoxGeometry(6.8,.2,3.2),SM(0xffffff,{map:roof,roughness:.6}),0,4.2,sd*1.15,h);r.rotation.x=sd*.62});
  mk(new THREE.BoxGeometry(6.8,1.4,.1),SM(0xf2e6cc),0,4.4,0,h);mk(new THREE.BoxGeometry(.8,1.6,.8),SM(0xa86a4a),1.8,4.6,-.6,h);mk(new THREE.BoxGeometry(1.3,2,.12),SM(0xffffff,{map:T_wood}),0,1,2.31,h);
  [-1.9,1.9].forEach(xx=>{mk(new THREE.BoxGeometry(1,1,.1),SM(0x9ad8ff,{emissive:0x4a9aff,emissiveIntensity:.35,roughness:.1}),xx,2,2.31,h);mk(new THREE.BoxGeometry(1.2,.12,.2),SM(0x7a4a24),xx,1.45,2.35,h);
    for(let i=0;i<3;i++)mk(new THREE.SphereGeometry(.1,6,4),SM(pickS([0xff3a5a,0xffd03a,0xffffff])),xx-.35+i*.35,1.6,2.4,h,false)});
  if(label){const sign=cv(256,64,(gg,w,hh)=>{gg.fillStyle='#c4361c';gg.fillRect(0,0,w,hh);gg.strokeStyle='#ffb627';gg.lineWidth=6;gg.strokeRect(4,4,w-8,hh-8);gg.fillStyle='#fff';gg.font='bold 32px Arial Black,Impact';gg.textAlign='center';gg.textBaseline='middle';gg.fillText(label,w/2,hh/2+2)});
    mk(new THREE.BoxGeometry(3.2,.7,.1),SM(0xffffff,{map:sign}),0,3.05,2.36,h)}
  h.position.set(x,0,z);h.rotation.y=rot;g.add(h);const c=Math.cos(rot),s2=Math.abs(Math.sin(rot));const hw=c*c>.5?3.2:2.5,hd=c*c>.5?2.5:3.2;addBox(reg,x-hw,x+hw,z-hd,z+hd);return h}
const T_roof=cv(256,256,(g,w,h)=>{g.fillStyle='#b8341e';g.fillRect(0,0,w,h);for(let r=0;r<10;r++)for(let c=0;c<9;c++){const x=c*30+(r%2?15:0),y=r*26;g.fillStyle=`hsl(${R(6,14)},${R(60,72)}%,${R(36,48)}%)`;g.beginPath();g.ellipse(x+14,y+16,14,13,0,0,Math.PI);g.fill();g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x,y+14,28,2)}});
const T_roofB=cv(256,256,(g,w,h)=>{g.fillStyle='#2a5aa8';g.fillRect(0,0,w,h);for(let r=0;r<10;r++)for(let c=0;c<9;c++){const x=c*30+(r%2?15:0),y=r*26;g.fillStyle=`hsl(${R(205,220)},${R(50,65)}%,${R(36,50)}%)`;g.beginPath();g.ellipse(x+14,y+16,14,13,0,0,Math.PI);g.fill()}});
const T_wall=cv(256,256,(g,w,h)=>{g.fillStyle='#efe2c4';g.fillRect(0,0,w,h);for(let i=0;i<3000;i++){g.fillStyle=`rgba(${R(150,200)},${R(130,170)},${R(100,140)},.15)`;g.fillRect(R(0,w),R(0,h),3,3)}g.strokeStyle='#7a4a24';g.lineWidth=14;g.strokeRect(0,0,w,h);g.beginPath();g.moveTo(0,h/2);g.lineTo(w,h/2);g.stroke()});
const T_stone=cv(256,256,(g,w,h)=>{g.fillStyle='#4a4450';g.fillRect(0,0,w,h);for(let r=0;r<8;r++)for(let c=0;c<5;c++){const x=c*52+(r%2?26:0),y=r*32;g.fillStyle=`hsl(${R(250,280)},${R(5,12)}%,${R(42,56)}%)`;g.fillRect(x+2,y+2,48,28);g.fillStyle='rgba(255,255,255,.08)';g.fillRect(x+2,y+2,48,4)}});
/* señales con texto */
const SIGNS=[];function signPost(g,reg,x,z,lines){const s=new THREE.Group();mk(new THREE.CylinderGeometry(.08,.08,1.4,8),SM(0x7a4a24),0,.7,0,s);mk(new THREE.BoxGeometry(1.3,.8,.1),SM(0xffffff,{map:T_wood}),0,1.35,0,s);
  for(let i=0;i<3;i++)mk(new THREE.BoxGeometry(.9,.05,.02),SM(0x3a2010),0,1.55-i*.18,.06,s,false);s.position.set(x,0,z);g.add(s);addCol(reg,x,z,.35);SIGNS.push({x,z,lines})}
/* personajes que hablan */
const NPCS=[];function npc(g,reg,x,z,cfg,lines,ry=0){const m=makeChar(Object.assign({id:'npc',h:1,shoes:0x3a2412,pants:0x3a3a4a,weapon:'none',noShield:true,reach:1},cfg));m.position.set(x,0,z);m.rotation.y=ry;sc.add(m);
  NPCS.push({m,x,z,ry,reg});addCol(reg,x,z,.5);SIGNS.push({x,z,lines,who:cfg.name,r:3.2})}
/* cofres */
const CHESTS=[];function chest(g,reg,id,x,z,ry,gift){const c=new THREE.Group();const cw=SM(0xffffff,{map:T_wood,roughness:.6}),gold=PM(0xffc84f,{metalness:1,roughness:.22,emissive:0x5a3a00,emissiveIntensity:.35});
  mk(new THREE.BoxGeometry(1.2,.7,.8),cw,0,.35,0,c);const lid=new THREE.Group();lid.position.set(0,.7,-.4);c.add(lid);mk(new THREE.CylinderGeometry(.4,.4,1.2,16,1,false,0,Math.PI),cw,0,0,.4,lid).rotation.z=Math.PI/2;
  [-.55,.55].forEach(xx=>mk(new THREE.BoxGeometry(.1,.72,.84),gold,xx,.36,0,c));mk(new THREE.BoxGeometry(.22,.26,.06),gold,0,.62,.42,c);
  const glow=new THREE.Mesh(new THREE.SphereGeometry(.32,16,12),new THREE.MeshBasicMaterial({color:0xfff4b0,transparent:true,opacity:0}));glow.position.y=.8;c.add(glow);
  const spark=new THREE.Sprite(new THREE.SpriteMaterial({map:T_dot,color:0xffe08a,transparent:true,depthWrite:false}));spark.scale.setScalar(1.6);spark.position.y=.9;c.add(spark);
  c.position.set(x,0,z);c.rotation.y=ry;c.traverse(o=>o.userData.keep=true);g.add(c);addCol(reg,x,z,.75);CHESTS.push({id,c,lid,glow,spark,x,z,open:false,gift,reg})}
/* rocas agrietadas: se rompen con bomba */
const CRACKS=[];const T_crack=cv(128,128,(g)=>{g.fillStyle='#8a8a96';g.fillRect(0,0,128,128);g.strokeStyle='#2a2a30';g.lineWidth=4;for(let i=0;i<6;i++){g.beginPath();g.moveTo(64,64);let x=64,y=64;for(let k=0;k<5;k++){x+=R(-22,22);y+=R(-22,22);g.lineTo(x,y)}g.stroke()}});
function cracked(g,reg,id,x,z,col){const m=mk(bumpy(new THREE.DodecahedronGeometry(1.15,1),.1),SM(col||0xffffff,{map:T_crack,roughness:.9}),x,1,z,g);m.userData.keep=true;const c=addCol(reg,x,z,1.15);CRACKS.push({id,m,col:c,x,z,reg});return m}
/* hondonada secreta: anillo de rocas con una roca agrietada en la entrada y un cofre dentro */
function secret(g,reg,id,x,z,face,rcol,moss){const n=11;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;if(Math.abs(angDiff(a,face))<.35)continue;rock(g,reg,x+Math.sin(a)*2.6,z+Math.cos(a)*2.6,RS(1,1.3),rcol,moss)}
  cracked(g,reg,id,x+Math.sin(face)*2.6,z+Math.cos(face)*2.6,0xffffff);chest(g,reg,id,x,z,face,'big')}
/* puertas entre mundos */
const GATES=[];function gate(g,reg,z,style){const gg=new THREE.Group();const pm=style.pillar,dm=style.door;
  [-1,1].forEach(sd=>{const p=mk(new THREE.BoxGeometry(1.6,5,1.6),pm,sd*4.3,2.5,0,gg);mk(new THREE.BoxGeometry(2,.5,2),pm,sd*4.3,5.2,0,gg);mk(new THREE.SphereGeometry(.45,14,10),PM(0xffc84f,{metalness:1,roughness:.2,emissive:0x6a4400,emissiveIntensity:.5}),sd*4.3,5.8,0,gg)});
  mk(new THREE.BoxGeometry(10.2,.9,1.4),pm,0,5.3,0,gg);const door=new THREE.Group();gg.add(door);mk(new THREE.BoxGeometry(7,4.6,.5),dm,0,2.3,0,door);
  for(let i=-3;i<=3;i++)mk(new THREE.BoxGeometry(.12,4.4,.56),SM(0x2a1a10),i,2.3,0,door,false);
  const lock=mk(new THREE.TorusGeometry(.38,.12,10,20),PM(0xffc84f,{metalness:1,roughness:.2,emissive:0x6a4400,emissiveIntensity:.6}),0,2.4,.36,door);mk(new THREE.BoxGeometry(.7,.6,.15),PM(0xffc84f,{metalness:1,roughness:.2}),0,2,.36,door);
  gg.position.set(0,0,z);gg.traverse(o=>o.userData.keep=true);g.add(gg);const col=addBox(reg,-3.7,3.7,z-.6,z+.6);[[-5.6,-3.4],[3.4,5.6]].forEach(([a,b])=>{const p=addBox(reg,a,b,z-1,z+1);if(reg<5)COLS[reg+1].push(p)});if(reg<5)COLS[reg+1].push(col);GATES.push({door,col,reg,open:false,z})}
/* muro de separación con hueco para la puerta */
function wallRow(g,reg,z,mkPiece){for(let x=-RW;x<=RW;x+=2.6){if(Math.abs(x)<5.4)continue;mkPiece(x+RS(-.3,.3),z+RS(-.4,.4))}const a=addBox(reg,-RW-2,-5,z-1.2,z+1.2),b=addBox(reg,5,RW+2,z-1.2,z+1.2);if(reg<5){COLS[reg+1].push(a,b)}}
function sideWalls(g,reg,mkPiece){const [z0,z1]=regZ(reg);for(let z=z0;z>=z1;z-=2.8){mkPiece(-RW-1.2+RS(-.4,.4),z);mkPiece(RW+1.2+RS(-.4,.4),z)}}
/* hierba que se mueve */
const windU={value:0};
function grassField(g,n,x0,x1,z0,z1,avoid,col){const bladeG=new THREE.BufferGeometry();bladeG.setAttribute('position',new THREE.Float32BufferAttribute([-.045,0,0,.045,0,0,0,.42,0],3));
  const c=new THREE.Color(col||0x5ac83a);bladeG.setAttribute('color',new THREE.Float32BufferAttribute([.13,.36,.1,.13,.36,.1,c.r,c.g,c.b],3));bladeG.computeVertexNormals();
  const gm=new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.8});
  gm.onBeforeCompile=sh=>{sh.uniforms.uWind=windU;sh.vertexShader='uniform float uWind;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvec4 wp=instanceMatrix*vec4(0.,0.,0.,1.);float sw=sin(uWind*1.8+wp.x*.6+wp.z*.4)*.12+sin(uWind*3.1+wp.x*1.7)*.04;transformed.x+=sw*position.y*2.;transformed.z+=sw*position.y;')};
  const im=new THREE.InstancedMesh(bladeG,gm,n);im.receiveShadow=true;const dm=new THREE.Object3D();let k=0;
  for(let i=0;i<n*2&&k<n;i++){const x=RS(x0,x1),z=RS(z0,z1);if(avoid&&avoid(x,z))continue;dm.position.set(x,0,z);dm.rotation.set(RS(-.25,.25),RS(0,6.3),RS(-.25,.25));const s=RS(.6,1.35);dm.scale.set(s,s*RS(.8,1.3),s);dm.updateMatrix();im.setMatrixAt(k,dm.matrix);
    const q=RS(.75,1.15);im.setColorAt(k,new THREE.Color(q,q*RS(.95,1.08),q*RS(.8,1)));k++}im.count=k;im.frustumCulled=false;g.add(im);return im}
function flowers(g,n,x0,x1,z0,z1,avoid,cols){const fm=new THREE.InstancedMesh(new THREE.SphereGeometry(.09,8,6),SM(0xffffff,{roughness:.4}),n);const dm=new THREE.Object3D();let k=0;
  for(let i=0;i<n*2&&k<n;i++){const x=RS(x0,x1),z=RS(z0,z1);if(avoid&&avoid(x,z))continue;dm.position.set(x,.16,z);dm.updateMatrix();fm.setMatrixAt(k,dm.matrix);fm.setColorAt(k,new THREE.Color(pickS(cols)));k++}fm.count=k;g.add(fm)}
function ground(g,reg,tex,rep){const [z0,z1]=regZ(reg);const p=mk(new THREE.PlaneGeometry(RW*2+30,RD+.5),SM(0xffffff,{map:tex,roughness:.95}),0,0,(z0+z1)/2,g,false);p.rotation.x=-Math.PI/2;tex.repeat.set((RW*2+30)/rep,RD/rep);p.userData.keep=true;return p}
function water(g,x,z,w,d,col,em){const T_w=cvLin(256,256,(gg)=>{gg.fillStyle='rgb(128,128,255)';gg.fillRect(0,0,256,256);for(let i=0;i<160;i++){const x2=R(0,256),y=R(0,256),r=R(8,26);const gr=gg.createRadialGradient(x2,y,0,x2,y,r);gr.addColorStop(0,`rgb(${R(100,160)},${R(100,160)},255)`);gr.addColorStop(1,'rgba(128,128,255,0)');gg.fillStyle=gr;gg.fillRect(x2-r,y-r,2*r,2*r)}});
  T_w.repeat.set(w/6,d/6);const m=new THREE.MeshPhysicalMaterial({color:col,roughness:.06,metalness:.1,clearcoat:1,normalMap:T_w,normalScale:new THREE.Vector2(.6,.6),transparent:true,opacity:.9,emissive:em||0x0a3a8a,emissiveIntensity:.25});
  const p=mk(new THREE.PlaneGeometry(w,d),m,x,.06,z,g,false);p.rotation.x=-Math.PI/2;p.userData.keep=true;ANIM.push(dt=>{T_w.offset.y-=dt*.08;T_w.offset.x+=dt*.02});return p}
function lavaPlane(g,x,z,w,d){const T_l=cv(256,256,(gg)=>{gg.fillStyle='#ff5a14';gg.fillRect(0,0,256,256);for(let i=0;i<70;i++){gg.fillStyle=pick(['#ffb020','#ff7a1a','#c8280e','#ffd84a','#8a1a08']);gg.beginPath();gg.ellipse(R(0,256),R(0,256),R(8,30),R(4,12),R(0,3),0,7);gg.fill()}});
  T_l.repeat.set(w/8,d/8);const m=new THREE.MeshStandardMaterial({map:T_l,emissive:0xff4a10,emissiveMap:T_l,emissiveIntensity:1.6,roughness:.7});const p=mk(new THREE.PlaneGeometry(w,d),m,x,.08,z,g,false);p.rotation.x=-Math.PI/2;p.userData.keep=true;
  ANIM.push(dt=>{T_l.offset.y-=dt*.05;T_l.offset.x+=Math.sin(TIME*.3)*dt*.02});return p}
const pick=a=>a[Math.floor(Math.random()*a.length)];
const ANIM=[];

/* ---------- regiones ---------- */
const REGIONS=[
 {id:'bosque',name:'BOSQUE DE NEIRA',sub:'MUNDO 1',song:'bosque',sky:[[0,'#2a7ae8'],[.5,'#7cc4ff'],[.75,'#cdeeff'],[1,'#fff4dc']],fog:[0xbfe4ff,40,110],sun:[0xfff0d0,2.0],hemi:[0xe6f4ff,0x3a6a1a],expo:.72,warm:[1.04,1,.95],
  parts:{col:0xffd04a,size:.12,mode:'firefly'},mini:'#4fb836',
  boss:{type:'rey',kind:'slime',name:'REY GELATINA',hp:14,x:0,z:-60,o:{scale:3.2,col:0x3ad8ff,crown:1.45,dmg:2,spd:0}}},
 {id:'playa',name:'PLAYA DEL TORNILLO',sub:'MUNDO 2',song:'playa',sky:[[0,'#1a8ae8'],[.5,'#6ac8ff'],[.8,'#d8f4ff'],[1,'#fff8e0']],fog:[0xcff0ff,45,120],sun:[0xfff6e0,2.0],hemi:[0xffffff,0xc8a860],expo:.56,warm:[1.05,1,.94],
  parts:{col:0xffffff,size:.1,mode:'drift'},mini:'#e8d090',
  boss:{type:'cangrejo',kind:'cangrejo',name:'CANGREJO GIGANTE',hp:16,x:-4,z:-60,o:{scale:2.8,col:0xff3a1a,crown:1.2,dmg:2,spd:11}}},
 {id:'desierto',name:'DESIERTO DE CHATARRA',sub:'MUNDO 3',song:'desierto',sky:[[0,'#3a8ae8'],[.5,'#8ac8f0'],[.8,'#ffe0b0'],[1,'#ffc880']],fog:[0xf8dca8,40,115],sun:[0xffe8c0,2.1],hemi:[0xfff0d0,0xc88a4a],expo:.55,warm:[1.08,1,.9],
  parts:{col:0xe8c890,size:.1,mode:'dust'},mini:'#e8b860',
  boss:{type:'escorpion',kind:'escorpion',name:'ESCORPIÓN DE CHATARRA',hp:18,x:0,z:-60,o:{scale:2.6,col:0xd8a030,crown:1.2,dmg:2,spd:12}}},
 {id:'nieve',name:'MONTAÑA NEVADA',sub:'MUNDO 4',song:'nieve',sky:[[0,'#3a6ac8'],[.5,'#8ab8e8'],[.8,'#e0f0ff'],[1,'#ffffff']],fog:[0xe0eeff,34,100],sun:[0xf4f8ff,1.6],hemi:[0xffffff,0x8aa8c8],expo:.47,warm:[.97,1,1.06],
  parts:{col:0xffffff,size:.13,mode:'snow'},mini:'#e8f2ff',
  boss:{type:'yeti',kind:'yeti',name:'YETI DE LAS CUMBRES',hp:20,x:0,z:-60,o:{scale:1.4,dmg:2}}},
 {id:'volcan',name:'VOLCÁN RUGIENTE',sub:'MUNDO 5',song:'volcan',sky:[[0,'#1a0606'],[.45,'#5a1a0a'],[.8,'#d8502a'],[1,'#ffa050']],fog:[0x6a2a1a,30,95],sun:[0xffb080,1.8],hemi:[0xffa080,0x3a1008],expo:.7,warm:[1.08,.98,.9],
  parts:{col:0xff8a2a,size:.12,mode:'ember'},mini:'#5a2a22',
  boss:{type:'lava',kind:'golem',name:'GÓLEM DE LAVA',hp:22,x:0,z:-60,o:{scale:2.3,col:0x3a2a2a,glow:0xff5a10,eye:0xffd04a,top:0x1a1010,dmg:2,spd:0}}},
 {id:'castillo',name:'CASTILLO DE LA CHATARRA',sub:'MUNDO FINAL',song:'castillo',sky:[[0,'#0a0618'],[.5,'#2a1448'],[.85,'#6a3a7a'],[1,'#ff9a5a']],fog:[0x2a1640,34,105],sun:[0xd8c8ff,1.5],hemi:[0xb8a0ff,0x2a1030],expo:.68,warm:[1.02,.98,1.06],
  parts:{col:0xb08aff,size:.13,mode:'firefly'},mini:'#5a4a6a',
  boss:{type:'final',kind:'armadura',name:'REY DE LA CHATARRA',hp:30,x:0,z:-60,o:{scale:2.6,col:0x6a6a7a,crown:2.2,dmg:2,spd:0}}},
];
const REG_GROUPS=[];
function buildWorld(){REGIONS.forEach((r,i)=>{srand(1000+i*77);const g=new THREE.Group();g.name=r.id;sc.add(g);REG_GROUPS.push(g);BUILD[r.id](g,i,r);mergeStatic(g)})}
/* posiciones libres para bichos */
function freeSpot(reg,zMin,zMax,avoid){const [z0]=regZ(reg);for(let k=0;k<60;k++){const x=RS(-RW+4,RW-4),z=z0-RS(zMin,zMax);if(avoid&&avoid(x,z))continue;if(!blocked(x,z,1.3))return [x,z]}return [0,z0-RD/2]}
function placeMobs(reg,list,avoid){list.forEach(([kind,n,o])=>{for(let i=0;i<n;i++){const [x,z]=freeSpot(reg,10,RD-22,avoid);makeMob(kind,x,z,Object.assign({region:reg},o||{}))}})}
function placeBoss(reg){const B=REGIONS[reg].boss;const [z0]=regZ(reg);const m=makeMob(B.kind,B.x,z0+B.z,Object.assign({region:reg,hp:B.hp,boss:B},B.o));m.state='sleep';m.ai='boss';m.homeZ=z0+B.z;REGIONS[reg].bossMob=m;return m}
const CHECKPOINTS=[];function checkpoint(g,reg,x,z){const c=new THREE.Group();mk(new THREE.CylinderGeometry(1.1,1.3,.3,20),SM(0x9a9aa6),0,.15,0,c);mk(new THREE.CylinderGeometry(.9,.9,.12,20),PM(0x3ad8ff,{emissive:0x1a8aff,emissiveIntensity:.8}),0,.33,0,c);
  const cr=mk(new THREE.OctahedronGeometry(.4,0),PM(0x6ae8ff,{emissive:0x2ab8ff,emissiveIntensity:1.6,transparent:true,opacity:.9}),0,1.5,0,c);cr.scale.y=1.6;cr.userData.keep=true;
  c.position.set(x,0,z);c.traverse(o=>o.userData.keep=true);g.add(c);CHECKPOINTS.push({reg,x,z,cr});ANIM.push(dt=>{cr.rotation.y+=dt*1.5;cr.position.y=1.5+Math.sin(TIME*2)*.15})}

const BUILD={
 bosque(g,reg){const [z0,z1]=regZ(reg);ground(g,reg,groundTex('#4fb836',9000,[85,118,62,30,52]),12);
  const RX=-15;const riverAvoid=(x,z)=>Math.abs(x-RX)<4.2;
  water(g,RX,(z0+z1)/2,6,RD,0x1a8ae8);const bed=mk(new THREE.PlaneGeometry(6.6,RD),SM(0x2a5a7a,{roughness:1}),RX,.02,(z0+z1)/2,g,false);bed.rotation.x=-Math.PI/2;
  const BZ=z0-38;addBox(reg,RX-3,RX+3,z0-RD,BZ-2.4);addBox(reg,RX-3,RX+3,BZ+2.4,z0);
  for(let i=0;i<36;i++){const sd=i%2?1:-1;rock(g,reg,RX+sd*RS(3.3,4.3),z0-1-i*2+RS(-.6,.6),RS(.35,.75),0x9a9aa6,RS(0,1)<.5?0x4f9a34:0,false)}
  const br=new THREE.Group();const wm=SM(0xffffff,{map:T_wood,roughness:.75});for(let i=0;i<9;i++)mk(new THREE.BoxGeometry(9,.18,.62),wm,0,.42,-2.6+i*.66,br);
  [-1,1].forEach(sd=>{mk(new THREE.BoxGeometry(9,.12,.12),wm,0,1.25,sd*3,br);for(let i=0;i<5;i++)mk(new THREE.BoxGeometry(.14,1,.14),wm,-4+i*2,.85,sd*3,br)});br.position.set(RX,0,BZ);g.add(br);
  // pueblo
  house(g,reg,9,z0-15,0,T_wall,T_roof,'TALLER NEIRA');house(g,reg,-6,z0-18,.3,T_wall,T_roofB);house(g,reg,20,z0-10,-.4,T_wall,T_roof);
  const well=new THREE.Group();mk(new THREE.CylinderGeometry(1,1.1,.9,16),SM(0x9a9aa6,{roughness:.9}),0,.45,0,well);mk(new THREE.CylinderGeometry(.85,.85,.1,16),SM(0x1a5aa8,{roughness:.1}),0,.85,0,well);
  [-1,1].forEach(sd=>mk(new THREE.BoxGeometry(.12,1.6,.12),SM(0x7a4a24),sd*.9,1.6,0,well));const rf=mk(new THREE.ConeGeometry(1.4,.8,4),SM(0xb8341e),0,2.7,0,well);rf.rotation.y=Math.PI/4;well.position.set(2,0,z0-24);g.add(well);addCol(reg,2,z0-24,1.2);
  for(let i=0;i<8;i++){mk(new THREE.BoxGeometry(.16,1,.16),SM(0xffffff,{map:T_wood}),-12+i*1.1,.5,z0-26)}mk(new THREE.BoxGeometry(8,.12,.1),SM(0xffffff,{map:T_wood}),-8.2,.75,z0-26);
  signPost(g,reg,-2,z0-6,['¡Hola! Bienvenido al pueblo de Neira.','El Rey de la Chatarra ha robado las 6 llaves del taller.','Cada jefe guarda una. ¡Vence al jefe y la puerta del norte se abrirá!']);
  signPost(g,reg,4,z0-30,['Consejo: ¿ves rocas agrietadas? ¡Ponles una BOMBA!','Dentro suele haber tesoros.']);
  signPost(g,reg,-3,z0-50,['¡Cuidado! Al norte vive el REY GELATINA.','Cuando salta, mira su sombra roja y apártate.']);
  checkpoint(g,reg,0,z0-11);
  npc(g,reg,3,z0-14.5,{name:'ABUELO PELLO',h:1.05,skin:0xe8c0a0,hair:0xf2f2f2,style:'buzz',beard:true,top:0x7a5a3a,pants:0x4a4a5a,cane:true,hat:0x5a3a24},
    ['¡Por fin llegas! Soy el abuelo Pello.','El malvado REY DE LA CHATARRA ha robado las 6 llaves del TALLER NEIRA y se las ha dado a sus jefes.','Cada mundo tiene un jefe. Vence al jefe, coge su llave y la puerta del norte se abrirá.','Toca los cristales azules para guardar la partida y llenar los corazones. ¡Suerte!'],-.6);
  const camino=(x,z)=>Math.abs(x)<2.2;
  const avoid=(x,z)=>riverAvoid(x,z)||(z>z0-30&&x>-12&&x<24)||Math.abs(x)<3||Math.hypot(x,z-(z0-60))<9;
  for(let i=0;i<70;i++){let x=RS(-RW+2,RW-2),z=RS(z1+4,z0-4);if(avoid(x,z))continue;if(RS(0,1)<.6)tree(g,reg,x,z,RS(1,1.45));else bush(g,reg,x,z,RS(.45,.8))}
  for(let i=0;i<25;i++){const x=RS(-RW+2,RW-2),z=RS(z1+4,z0-4);if(avoid(x,z))continue;rock(g,reg,x,z,RS(.4,.9),0x9a9aa6,0x4f9a34)}
  grassField(g,MOBILE?7000:15000,-RW,RW,z1,z0,(x,z)=>riverAvoid(x,z)||Math.abs(x)<2.4);flowers(g,260,-RW,RW,z1,z0,riverAvoid,[0xff4a6a,0xffe03a,0xffffff,0xb05aff,0xff8a2a]);
  const path=mk(new THREE.PlaneGeometry(4.4,RD),SM(0xffffff,{map:groundTex('#c9a46a',5000,[28,40,40,48,70]),roughness:.95,transparent:true,alphaMap:PATH_A,depthWrite:false}),0,.015,(z0+z1)/2,g,false);path.rotation.x=-Math.PI/2;path.material.map.repeat.set(1,RD/5);path.userData.keep=true;
  secret(g,reg,1,-24,z0-44,Math.PI/2,0x9a9aa6,0x4f9a34);chest(g,reg,2,24,z0-36,-.6,'gems');
  wallRow(g,reg,z1,(x,z)=>{if(RS(0,1)<.5)tree(g,reg,x,z,RS(1.2,1.5));else rock(g,reg,x,z,RS(1.2,1.6),0x8a8a96,0x4f9a34,false)});gate(g,reg,z1,{pillar:SM(0x9a9aa6,{roughness:.85}),door:SM(0xffffff,{map:T_wood,roughness:.7})});
  sideWalls(g,reg,(x,z)=>{if(RS(0,1)<.6)tree(g,reg,x,z,RS(1.3,1.7));else rock(g,reg,x,z,RS(1.4,2),0x8a8a96,0x4f9a34,false)});
  for(let x=-RW;x<=RW;x+=2.6)tree(g,reg,x,z0+1.5,RS(1.3,1.7));addBox(reg,-RW-2,RW+2,z0,z0+3);
  placeMobs(reg,[['slime',5,{col:0xff4a4a}],['slime',3,{col:0x4aff6a}],['seta',4],['escarabajo',2],['murcielago',3]],(x,z)=>z>z0-26||Math.hypot(x,z-(z0-60))<12);placeBoss(reg)},
 playa(g,reg){const [z0,z1]=regZ(reg);ground(g,reg,groundTex('#ecd49a',7000,[38,48,45,66,84],(gg,w,h)=>{for(let i=0;i<60;i++){gg.fillStyle=pick(['#ff9ab0','#ffffff','#ffb060']);gg.beginPath();gg.ellipse(R(0,w),R(0,h),3,2,R(0,3),0,7);gg.fill()}}),10);
  const SX=19;water(g,SX+18,(z0+z1)/2,36,RD+2,0x1a9ae8,0x0a5a9a);addBox(reg,SX,RW+4,z1,z0);
  const foam=mk(new THREE.PlaneGeometry(1.2,RD),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.55,depthWrite:false}),SX+.2,.07,(z0+z1)/2,g,false);foam.rotation.x=-Math.PI/2;foam.userData.keep=true;
  ANIM.push(()=>{foam.position.x=SX+.2+Math.sin(TIME*1.2)*.35;foam.material.opacity=.4+Math.sin(TIME*1.2)*.15});
  const pier=new THREE.Group();const wm=SM(0xffffff,{map:T_wood});for(let i=0;i<10;i++)mk(new THREE.BoxGeometry(.9,.16,3),wm,i*1,.5,0,pier);for(let i=0;i<5;i++)[-1,1].forEach(sd=>mk(new THREE.CylinderGeometry(.12,.12,1.4,8),wm,i*2,.1,sd*1.3,pier));pier.position.set(SX-1,0,z0-30);g.add(pier);
  const boat=new THREE.Group();mk(new THREE.BoxGeometry(3,.8,1.4),SM(0xd8402a),0,.4,0,boat);mk(new THREE.BoxGeometry(2.8,.12,1.2),SM(0xffffff,{map:T_wood}),0,.82,0,boat);boat.position.set(SX+7,0,z0-30);boat.traverse(o=>o.userData.keep=true);g.add(boat);ANIM.push(()=>{boat.position.y=Math.sin(TIME*1.4)*.12;boat.rotation.z=Math.sin(TIME*1.1)*.05});
  const avoid=(x,z)=>x>SX-2||Math.abs(x)<3||Math.hypot(x+4,z-(z0-60))<10||z>z0-6;
  for(let i=0;i<34;i++){const x=RS(-RW+2,SX-2),z=RS(z1+4,z0-4);if(avoid(x,z))continue;const k=RS(0,1);
    if(k<.45)palm(g,reg,x,z,RS(.9,1.3));else if(k<.6){const u=new THREE.Group();mk(new THREE.CylinderGeometry(.05,.05,2.4,6),SM(0xffffff),0,1.2,0,u);const c=mk(new THREE.ConeGeometry(1.4,.6,10,1,true),SM(pickS([0xff4a5a,0x3ab0ff,0xffd02a]),{side:THREE.DoubleSide}),0,2.4,0,u);
      const towel=mk(new THREE.BoxGeometry(1,.03,1.8),SM(pickS([0xff6ab0,0x4ad8ff])),1,.03,.4,u,false);u.position.set(x,0,z);g.add(u);addCol(reg,x,z,.3)}
    else if(k<.75){const cs=new THREE.Group();const sm=SM(0xe8c878,{roughness:.9});mk(new THREE.CylinderGeometry(.8,.9,.7,12),sm,0,.35,0,cs);[0,1,2,3].forEach(q=>{const a=q/4*Math.PI*2;mk(new THREE.CylinderGeometry(.25,.28,.9,10),sm,Math.cos(a)*.75,.6,Math.sin(a)*.75,cs);mk(new THREE.ConeGeometry(.3,.4,10),sm,Math.cos(a)*.75,1.25,Math.sin(a)*.75,cs)});
      mk(new THREE.CylinderGeometry(.35,.4,1.2,10),sm,0,1.2,0,cs);mk(new THREE.PlaneGeometry(.4,.3),SM(0xff3a4a,{side:THREE.DoubleSide}),.2,2.15,0,cs);cs.position.set(x,0,z);g.add(cs);addCol(reg,x,z,1.1)}
    else rock(g,reg,x,z,RS(.6,1.2),0xa8a090,0)}
  for(let i=0;i<40;i++){const x=RS(-RW+2,SX-1),z=RS(z1+2,z0-2);const st=new THREE.Group();const sm=SM(pickS([0xff6a3a,0xff4a8a,0xffb02a]));for(let q=0;q<5;q++){const a=q/5*Math.PI*2;const ar=mk(new THREE.ConeGeometry(.08,.3,6),sm,Math.cos(a)*.13,0,Math.sin(a)*.13,st,false);ar.rotation.set(Math.PI/2,0,-a+Math.PI/2)}st.position.set(x,.05,z);st.rotation.y=RS(0,6);g.add(st)}
  signPost(g,reg,-3,z0-5,['¡Bienvenido a la PLAYA DEL TORNILLO!','Los cangrejos persiguen a los que se acercan.','El CANGREJO GIGANTE embiste: si choca contra una roca se queda mareado. ¡Aprovecha!']);
  checkpoint(g,reg,2,z0-6);npc(g,reg,15,z0-28,{name:'MARINA LA PESCADORA',h:1.02,skin:0xd8a880,hair:0x2a1a12,style:'pony',top:0x2a8ad8,pants:0x1a3a6a,rod:true,hat:0xf4e0a0},
    ['¿Has visto mis cangrejos? ¡Se han vuelto locos!','Truco: cuando un bicho embiste y choca contra algo, se queda mareado. ¡Ahí recibe el doble de golpe!','Detrás de unas rocas al oeste hay una roca agrietada… yo no tengo bombas, pero tú sí.'],-1.2);secret(g,reg,11,-24,z0-40,Math.PI/2,0xa8a090,0);chest(g,reg,12,12,z0-18,0,'gems');
  for(let i=0;i<6;i++)rock(g,reg,RS(-12,8),z0-RS(52,66),RS(1.2,1.8),0xa8a090,0);
  wallRow(g,reg,z1,(x,z)=>rock(g,reg,x,z,RS(1.4,1.9),0xb8a880,0,false));gate(g,reg,z1,{pillar:SM(0xe8d8b0,{roughness:.85}),door:SM(0xffffff,{map:T_wood,roughness:.7})});
  sideWalls(g,reg,(x,z)=>{if(x<0){if(RS(0,1)<.5)palm(g,reg,x,z,RS(1.1,1.5));else rock(g,reg,x,z,RS(1.4,2),0xb8a880,0,false)}});
  placeMobs(reg,[['cangrejo',6],['slime',3,{col:0x3ab0ff}],['murcielago',2,{col:0xe8f0ff}],['escarabajo',2,{col:0x2aa8a8}]],avoid);placeBoss(reg)},
 desierto(g,reg){const [z0,z1]=regZ(reg);ground(g,reg,groundTex('#e8b868',8000,[30,42,55,58,76]),10);
  const avoid=(x,z)=>Math.abs(x)<3||Math.hypot(x,z-(z0-60))<10||z>z0-6;
  for(let i=0;i<16;i++){const x=RS(-RW,RW),z=RS(z1,z0);const d=mk(new THREE.SphereGeometry(RS(3,7),20,10,0,Math.PI*2,0,Math.PI/2),SM(0xe8b868,{roughness:1}),x,-.2,z,g,false);d.scale.y=RS(.12,.25)}
  // oasis
  water(g,-18,z0-30,9,7,0x2ab8c8,0x0a6a6a);addCol(reg,-18,z0-30,3.6);[[-23,-27],[-13,-34],[-21,-35]].forEach(([x,z])=>palm(g,reg,x,z0+z+0,1.2));
  for(let i=0;i<4;i++){const x=RS(-RW+6,RW-6),z=RS(z1+12,z0-14);if(avoid(x,z)||Math.hypot(x+18,z-(z0-30))<8)continue;const h=RS(4,8),w=RS(2.5,4.5);const ms=new THREE.Group();
    mk(new THREE.CylinderGeometry(w*.85,w,h,9),SM(0xc8784a,{roughness:.9,flatShading:true}),0,h/2,0,ms);mk(new THREE.CylinderGeometry(w*.9,w*.85,.6,9),SM(0xd89a5a,{flatShading:true}),0,h+.3,0,ms);ms.position.set(x,0,z);g.add(ms);addCol(reg,x,z,w)}
  for(let i=0;i<40;i++){const x=RS(-RW+2,RW-2),z=RS(z1+4,z0-4);if(avoid(x,z)||Math.hypot(x+18,z-(z0-30))<6)continue;const k=RS(0,1);
    if(k<.35){const c=new THREE.Group();const gm=SM(0x3aa84a,{roughness:.6});const h=RS(1.4,2.6);mk(new THREE.CylinderGeometry(.3,.35,h,10),gm,0,h/2,0,c);mk(new THREE.SphereGeometry(.3,10,8),gm,0,h,0,c);
      if(RS(0,1)<.7)[-1,1].forEach(sd=>{if(RS(0,1)<.6){mk(new THREE.CylinderGeometry(.13,.15,.4,8),gm,.36*sd,h*.55,0,c).rotation.z=Math.PI/2;mk(new THREE.CylinderGeometry(.13,.13,.6,8),gm,.55*sd,h*.55+.3,0,c)}});c.position.set(x,0,z);g.add(c);addCol(reg,x,z,.45)}
    else if(k<.5){const car=new THREE.Group();const pm=SM(pickS([0xa83a2a,0x2a6aa8,0x8a8a3a]),{roughness:.8,metalness:.3});mk(new THREE.BoxGeometry(3.2,.8,1.6),pm,0,.6,0,car);mk(new THREE.BoxGeometry(1.7,.6,1.4),pm,-.1,1.25,0,car);
      [[-1,.8],[1,.8],[-1,-.8],[1,-.8]].forEach(([a,b2])=>{const w2=mk(new THREE.CylinderGeometry(.33,.33,.25,12),SM(0x17181c),a,.33,b2,car);w2.rotation.x=Math.PI/2});car.position.set(x,0,z);car.rotation.set(0,RS(0,6),RS(-.15,.15));g.add(car);addCol(reg,x,z,1.5)}
    else if(k<.65){const sk=new THREE.Group();const bm=SM(0xf4ecd8);mk(new THREE.SphereGeometry(.4,12,10),bm,0,.35,0,sk);[-1,1].forEach(sd=>{const h2=mk(new THREE.ConeGeometry(.08,.6,8),bm,.4*sd,.55,0,sk);h2.rotation.z=-1*sd});
      [-1,1].forEach(sd=>mk(new THREE.SphereGeometry(.09,8,6),SM(0x1a1018),.14*sd,.42,.32,sk,false));sk.position.set(x,0,z);sk.rotation.y=RS(0,6);g.add(sk)}
    else if(k<.8){const dr=new THREE.Group();const dm=PM(pickS([0x2f78e6,0xd8302a,0x3aa84a]),{metalness:.4});mk(new THREE.CylinderGeometry(.43,.43,.98,16),dm,0,.49,0,dr);[.2,.78].forEach(y=>mk(new THREE.CylinderGeometry(.445,.445,.06,16),SM(0x222222),0,y,0,dr));dr.position.set(x,0,z);g.add(dr);addCol(reg,x,z,.45)}
    else rock(g,reg,x,z,RS(.6,1.3),0xc8885a,0)}
  signPost(g,reg,3,z0-5,['DESIERTO DE CHATARRA. Bebe agua en el oasis (es broma, no se puede).','Los CACTUS disparan pinchos: atácalos cuando acaben de disparar.','El ESCORPIÓN dispara veneno y luego embiste. ¡Usa el ESCUDO!']);
  checkpoint(g,reg,-2,z0-6);secret(g,reg,21,24,z0-44,-Math.PI/2,0xc8885a,0);chest(g,reg,22,-24,z0-14,.4,'gems');
  for(let i=0;i<5;i++)rock(g,reg,RS(-10,10),z0-RS(50,66),RS(1.2,1.8),0xc8885a,0);
  wallRow(g,reg,z1,(x,z)=>rock(g,reg,x,z,RS(1.5,2),0xb8784a,0,false));gate(g,reg,z1,{pillar:SM(0xc8885a,{roughness:.85}),door:SM(0x8a8a96,{metalness:.6,roughness:.4})});
  sideWalls(g,reg,(x,z)=>rock(g,reg,x,z,RS(1.6,2.2),0xb8784a,0,false));
  placeMobs(reg,[['escorpion',4],['cactus',5],['murcielago',2,{col:0x8a5a2a}],['slime',3,{col:0xffa02a}]],avoid);placeBoss(reg)},
 nieve(g,reg){const [z0,z1]=regZ(reg);ground(g,reg,groundTex('#eaf0f8',1800,[205,215,25,86,95]),12);
  const avoid=(x,z)=>Math.abs(x)<3||Math.hypot(x,z-(z0-60))<10||z>z0-6||Math.hypot(x-16,z-(z0-30))<8;
  const ice=mk(new THREE.CircleGeometry(7.5,40),new THREE.MeshPhysicalMaterial({color:0xbfe8ff,roughness:.05,clearcoat:1,transparent:true,opacity:.85,emissive:0x3a7aaa,emissiveIntensity:.15}),16,.05,z0-30,g,false);ice.rotation.x=-Math.PI/2;ice.userData.keep=true;
  for(let i=0;i<14;i++){const a=i/14*Math.PI*2;rock(g,reg,16+Math.cos(a)*8,z0-30+Math.sin(a)*8,RS(.4,.7),0xd8e4f0,0,false)}
  for(let i=0;i<55;i++){const x=RS(-RW+2,RW-2),z=RS(z1+4,z0-4);if(avoid(x,z))continue;const k=RS(0,1);
    if(k<.55)pine(g,reg,x,z,RS(.9,1.4),true);else if(k<.68){const sm=new THREE.Group();const w=SM(0xffffff,{roughness:.6});mk(new THREE.SphereGeometry(.6,16,12),w,0,.55,0,sm);mk(new THREE.SphereGeometry(.42,16,12),w,0,1.4,0,sm);mk(new THREE.SphereGeometry(.3,14,10),w,0,2.02,0,sm);
      const n=mk(new THREE.ConeGeometry(.07,.3,8),SM(0xff7a1a),0,2.02,.32,sm);n.rotation.x=Math.PI/2;[-1,1].forEach(sd=>mk(new THREE.SphereGeometry(.04,6,4),SM(0x111111),.1*sd,2.1,.27,sm));mk(new THREE.CylinderGeometry(.22,.22,.3,12),SM(0x1a1a22),0,2.35,0,sm);
      const sf=mk(new THREE.TorusGeometry(.33,.07,8,16),SM(0xd8302a),0,1.75,0,sm);sf.rotation.x=Math.PI/2;sm.position.set(x,0,z);sm.rotation.y=RS(-.5,.5);g.add(sm);addCol(reg,x,z,.6)}
    else if(k<.78){const ig=new THREE.Group();const im=SM(0xf4faff,{roughness:.5});mk(new THREE.SphereGeometry(1.8,20,12,0,Math.PI*2,0,Math.PI/2),im,0,0,0,ig);const dr=mk(new THREE.CylinderGeometry(.75,.75,1.4,14,1,false,0,Math.PI),im,0,0,1.7,ig);dr.rotation.set(Math.PI/2,Math.PI/2,0);
      mk(new THREE.CircleGeometry(.55,14),SM(0x1a2a3a),0,.5,2.42,ig,false);ig.position.set(x,0,z);ig.rotation.y=RS(-.6,.6);g.add(ig);addCol(reg,x,z,1.9)}
    else if(k<.9){for(let q=0;q<4;q++){const c=mk(new THREE.OctahedronGeometry(.3,0),PM(0x8ae0ff,{emissive:0x2a8ad8,emissiveIntensity:.6,transparent:true,opacity:.85}),x+RS(-.5,.5),.5,z+RS(-.5,.5),g);c.scale.set(.6,RS(1.5,3),.6);c.rotation.z=RS(-.4,.4)}addCol(reg,x,z,.6)}
    else rock(g,reg,x,z,RS(.6,1.2),0xb8c8d8,0xf4f8ff)}
  signPost(g,reg,-3,z0-5,['MONTAÑA NEVADA. ¡Abrígate!','Los PINGÜINOS se tiran de barriga contra ti: apártate y golpéalos cuando se mareen.','El YETI lanza bolas de nieve enormes: mira dónde caen.']);
  checkpoint(g,reg,2,z0-6);npc(g,reg,-6,z0-9,{name:'NANUK',h:.95,skin:0xd8a880,hair:0x1a1410,style:'short',top:0x3a6ac8,pants:0x2a2a4a,hood:0x8a5a3a},
    ['¡Brrr! Hace un frío que pela.','El YETI tira bolas de nieve gigantes. Mira su sombra en el suelo y apártate.','Cuando golpea el suelo con los puños, ¡aléjate o ponte el ESCUDO!'],.6);secret(g,reg,31,-24,z0-42,Math.PI/2,0xb8c8d8,0xf4f8ff);chest(g,reg,32,24,z0-50,-.5,'gems');
  for(let i=0;i<5;i++)rock(g,reg,RS(-10,10),z0-RS(50,66),RS(1.2,1.8),0xb8c8d8,0xf4f8ff);
  wallRow(g,reg,z1,(x,z)=>{if(RS(0,1)<.5)pine(g,reg,x,z,RS(1.3,1.7),true);else rock(g,reg,x,z,RS(1.4,2),0xb8c8d8,0xf4f8ff,false)});gate(g,reg,z1,{pillar:SM(0xd8e4f0,{roughness:.6}),door:PM(0x8ad8ff,{emissive:0x2a6aa8,emissiveIntensity:.3,roughness:.1})});
  sideWalls(g,reg,(x,z)=>{if(RS(0,1)<.5)pine(g,reg,x,z,RS(1.4,1.8),true);else rock(g,reg,x,z,RS(1.4,2),0xb8c8d8,0xf4f8ff,false)});
  placeMobs(reg,[['pinguino',5],['golem',2,{col:0x8ac8e8,top:0xf4f8ff,eye:0x2a6aff}],['slime',3,{col:0xbfe8ff}],['murcielago',2,{col:0x4a6a9a}]],avoid);placeBoss(reg)},
 volcan(g,reg){const [z0,z1]=regZ(reg);ground(g,reg,groundTex('#3a2a2a',6000,[0,20,12,12,26],(gg,w,h)=>{for(let i=0;i<30;i++){gg.strokeStyle='rgba(255,90,20,.35)';gg.lineWidth=R(1,3);gg.beginPath();let x=R(0,w),y=R(0,h);gg.moveTo(x,y);for(let k=0;k<5;k++){x+=R(-20,20);y+=R(-20,20);gg.lineTo(x,y)}gg.stroke()}}),10);
  const avoid=(x,z)=>Math.abs(x)<3||Math.hypot(x,z-(z0-60))<10||z>z0-6||Math.abs(z-(z0-22))<4||Math.abs(z-(z0-42))<4;
  [[z0-22,-1],[z0-42,1]].forEach(([lz,sd])=>{lavaPlane(g,0,lz,RW*2,4.4);const gap=sd*14;addBox(reg,-RW-2,gap-3.2,lz-2.2,lz+2.2);addBox(reg,gap+3.2,RW+2,lz-2.2,lz+2.2);
    const br=new THREE.Group();for(let i=0;i<7;i++)mk(new THREE.BoxGeometry(6,.25,.62),SM(0x2a2228,{roughness:.6,metalness:.4}),0,.3,-2.1+i*.7,br);[-1,1].forEach(sd2=>mk(new THREE.BoxGeometry(.18,.6,4.8),SM(0x8a8a96,{metalness:.7,roughness:.3}),sd2*3,.6,0,br));br.position.set(gap,0,lz);g.add(br);
    for(let i=0;i<14;i++)rock(g,reg,RS(-RW,RW),lz+sd*RS(2.5,3.2)*(RS(0,1)<.5?1:-1),RS(.4,.7),0x2a2024,0,false)});
  const vol=new THREE.Group();mk(new THREE.ConeGeometry(30,26,24,1,true),SM(0x2a1a1a,{roughness:1,side:THREE.DoubleSide}),0,13,0,vol);const top=mk(new THREE.CircleGeometry(6.5,24),SM(0xff5a14,{emissive:0xff3a00,emissiveIntensity:2.5}),0,24.8,0,vol);top.rotation.x=-Math.PI/2;vol.scale.setScalar(.8);vol.position.set(58,-2,(z0+z1)/2-6);g.add(vol);
  for(let i=0;i<45;i++){const x=RS(-RW+2,RW-2),z=RS(z1+4,z0-4);if(avoid(x,z))continue;const k=RS(0,1);
    if(k<.35){const n=Math.floor(RS(3,6));for(let q=0;q<n;q++){const h=RS(1.2,3.6);const c=mk(new THREE.CylinderGeometry(.35,.38,h,6),SM(0x2a2228,{roughness:.8,flatShading:true}),x+RS(-.7,.7),h/2,z+RS(-.7,.7),g)}addCol(reg,x,z,1)}
    else if(k<.55){for(let q=0;q<4;q++){const c=mk(new THREE.OctahedronGeometry(.3,0),PM(0x6a2aa8,{emissive:0x3a0a6a,emissiveIntensity:.8}),x+RS(-.5,.5),.5,z+RS(-.5,.5),g);c.scale.set(.6,RS(1.5,3),.6);c.rotation.z=RS(-.4,.4)}addCol(reg,x,z,.6)}
    else if(k<.7){const v=mk(new THREE.CylinderGeometry(.4,.8,.6,10),SM(0x1a1214),x,.3,z,g);const gl=mk(new THREE.CircleGeometry(.35,12),SM(0xff7a1a,{emissive:0xff5a00,emissiveIntensity:2}),x,.62,z,g,false);gl.rotation.x=-Math.PI/2;VENTS.push([x,z]);addCol(reg,x,z,.7)}
    else rock(g,reg,x,z,RS(.6,1.4),0x2a2024,0)}
  signPost(g,reg,-3,z0-5,['VOLCÁN RUGIENTE. ¡No toques la lava!','Cruza los ríos de lava por los puentes de hierro.','El GÓLEM DE LAVA lanza anillos de fuego: ¡busca el hueco entre las bolas!']);
  checkpoint(g,reg,2,z0-6);secret(g,reg,41,-24,z0-32,Math.PI/2,0x2a2024,0);chest(g,reg,42,24,z0-52,-.5,'gems');
  wallRow(g,reg,z1,(x,z)=>rock(g,reg,x,z,RS(1.5,2),0x2a2024,0,false));gate(g,reg,z1,{pillar:SM(0x2a2024,{roughness:.85}),door:SM(0x5a1a10,{metalness:.6,roughness:.4,emissive:0x5a1000,emissiveIntensity:.4})});
  sideWalls(g,reg,(x,z)=>rock(g,reg,x,z,RS(1.6,2.2),0x2a2024,0,false));
  placeMobs(reg,[['slime',4,{col:0xff6a1a}],['golem',2,{col:0x3a2a2a,glow:0xff5a10,eye:0xffd04a,top:0x1a1010}],['murcielago',3,{col:0xc82a1a}],['escorpion',2,{col:0x8a2a1a}]],avoid);placeBoss(reg)},
 castillo(g,reg){const [z0,z1]=regZ(reg);const T_tiles=cv(256,256,(gg,w,h)=>{gg.fillStyle='#3a3440';gg.fillRect(0,0,w,h);for(let r=0;r<4;r++)for(let c=0;c<4;c++){gg.fillStyle=`hsl(${R(250,275)},${R(6,14)}%,${R(30,42)}%)`;gg.fillRect(c*64+2,r*64+2,60,60);gg.fillStyle='rgba(255,255,255,.06)';gg.fillRect(c*64+2,r*64+2,60,5)}});
  ground(g,reg,T_tiles,6);const carpet=mk(new THREE.PlaneGeometry(4,RD-10),SM(0x6a0a18,{roughness:.8}),0,.02,(z0+z1)/2-4,g,false);carpet.rotation.x=-Math.PI/2;carpet.userData.keep=true;
  [-1.85,1.85].forEach(x=>{const tr=mk(new THREE.PlaneGeometry(.3,RD-10),SM(0xffc84f,{metalness:.8,roughness:.3}),x,.025,(z0+z1)/2-4,g,false);tr.rotation.x=-Math.PI/2;tr.userData.keep=true});
  const wallM=SM(0xffffff,{map:T_stone,roughness:.9});const flagM=SM(0xd8202a,{side:THREE.DoubleSide});
  for(let z=z0-8;z>z1+16;z-=8)[-1,1].forEach(sd=>{const x=sd*RS(9,12);const col=new THREE.Group();mk(new THREE.CylinderGeometry(.6,.7,4,10),wallM,0,2,0,col);mk(new THREE.BoxGeometry(1.6,.4,1.6),wallM,0,4.2,0,col);
    const bn=mk(new THREE.PlaneGeometry(1,2.2),flagM,0,2.6,.72,col);const em=mk(new THREE.CircleGeometry(.25,12),PM(0xffc84f,{metalness:.8,roughness:.3}),0,2.9,.74,col,false);
    const t=new THREE.Group();mk(new THREE.CylinderGeometry(.18,.12,.3,8),SM(0x5a5a66,{metalness:.6}),0,0,0,t);const f=new THREE.Mesh(new THREE.ConeGeometry(.16,.45,8),new THREE.MeshBasicMaterial({color:0xffb030}));f.position.y=.3;f.userData.keep=true;t.add(f);t.position.set(0,3.4,.75);col.add(t);
    col.position.set(x,0,z);g.add(col);addCol(reg,x,z,.8);FLAMES.push(f)});
  for(let i=0;i<10;i++){const x=RS(-RW+3,RW-3),z=RS(z1+20,z0-12);if(Math.abs(x)<14)continue;const st=new THREE.Group();mk(new THREE.BoxGeometry(1.2,.8,1.2),wallM,0,.4,0,st);const arm=makeMob?null:null;
    const kn=new THREE.Group();mk(new THREE.CylinderGeometry(.35,.3,1,12),SM(0x8a8a96,{roughness:.6}),0,1.3,0,kn);mk(new THREE.SphereGeometry(.32,14,10),SM(0x8a8a96,{roughness:.6}),0,2.05,0,kn);mk(new THREE.CylinderGeometry(.04,.04,2.4,6),SM(0x5a5a66),.5,1.6,0,kn);st.add(kn);st.position.set(x,0,z);g.add(st);addCol(reg,x,z,.9)}
  const throne=new THREE.Group();mk(new THREE.BoxGeometry(3,.6,2.4),SM(0x5a4a5a),0,.3,0,throne);mk(new THREE.BoxGeometry(2.2,4,.5),PM(0xa81a2a),0,2.6,-.9,throne);mk(new THREE.BoxGeometry(2.6,.4,.7),PM(0xffc84f,{metalness:1,roughness:.2}),0,4.7,-.9,throne);throne.position.set(0,0,z1+5);g.add(throne);addBox(reg,-1.6,1.6,z1+3.5,z1+6.5);
  for(let x=-RW;x<=RW;x+=4){const t=new THREE.Group();mk(new THREE.BoxGeometry(4,8,3),wallM,0,4,0,t);[-1.2,0,1.2].forEach(xx=>mk(new THREE.BoxGeometry(.8,1,3),wallM,xx,8.5,0,t));t.position.set(x,0,z1-1);g.add(t)}addBox(reg,-RW-2,RW+2,z1-3,z1+.5);
  [-1,1].forEach(sd=>{const tw=new THREE.Group();mk(new THREE.CylinderGeometry(3,3.3,16,14),wallM,0,8,0,tw);const rf=mk(new THREE.ConeGeometry(3.8,6,14),SM(0x5a1a2a,{roughness:.7}),0,19,0,tw);tw.position.set(sd*22,0,z1-4);g.add(tw)});
  signPost(g,reg,-3,z0-5,['CASTILLO DE LA CHATARRA. El último jefe te espera en el trono.','Las ARMADURAS paran los golpes de frente: ¡atácalas por la espalda o usa la llave de Aitor!','El REY DE LA CHATARRA dispara, embiste y llama a sus armaduras. ¡Tú puedes!']);
  checkpoint(g,reg,2,z0-6);secret(g,reg,51,-24,z0-36,Math.PI/2,0x4a4450,0);chest(g,reg,52,24,z0-22,-.5,'gems');
  sideWalls(g,reg,(x,z)=>{const w=mk(new THREE.BoxGeometry(2.4,6,3),wallM,x,3,z,g)});
  placeMobs(reg,[['armadura',5],['murcielago',3,{col:0x3a2a5a}],['golem',1,{col:0x5a5a66,top:0x3a3a44,eye:0xff3a2a}],['slime',2,{col:0x9a5aff}]],(x,z)=>Math.abs(x)<3||z>z0-8||z<z1+22);placeBoss(reg)},
};
const PATH_A=(()=>{const c=document.createElement('canvas');c.width=64;c.height=4;const g=c.getContext('2d');const gr=g.createLinearGradient(0,0,64,0);gr.addColorStop(0,'#000');gr.addColorStop(.2,'#fff');gr.addColorStop(.8,'#fff');gr.addColorStop(1,'#000');g.fillStyle=gr;g.fillRect(0,0,64,4);return new THREE.CanvasTexture(c)})();
const VENTS=[],FLAMES=[];
