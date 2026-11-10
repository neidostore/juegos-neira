"use strict";
/* ============ AVENTURA NEIRA · motor ============ */
const $=id=>document.getElementById(id);
const R=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const angDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
// azar con semilla: el mundo es siempre igual (cofres y secretos en el mismo sitio)
let SEED=12345;function srand(s){SEED=s>>>0}
function RS(a,b){SEED=(SEED+0x6D2B79F5)>>>0;let t=SEED;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);const r=((t^t>>>14)>>>0)/4294967296;return a+r*(b-a)}
const pickS=a=>a[Math.floor(RS(0,a.length))];
const IN_APP=!!window.NeiraApp;try{if(IN_APP)NeiraApp.setOrientation('landscape')}catch(e){}
const MOBILE=/Android|iPhone|iPad|Mobi/i.test(navigator.userAgent);
const store={get(k){try{return localStorage.getItem(k)}catch(e){return null}},set(k,v){try{localStorage.setItem(k,v)}catch(e){}}};
let QUALITY=store.get('av-q')||'alta';
let ROT=false;const app=$('app');
window.onerror=(m,src,l)=>{const e=$('err');e.style.display='block';e.textContent=m+' ('+(src||'').split('/').pop()+':'+l+')'};

/* ---------- render ---------- */
const ren=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});
ren.shadowMap.enabled=true;ren.shadowMap.type=THREE.PCFSoftShadowMap;ren.outputEncoding=THREE.sRGBEncoding;ren.toneMapping=THREE.NoToneMapping;
app.prepend(ren.domElement);
const sc=new THREE.Scene();
const cam=new THREE.PerspectiveCamera(44,1,.1,260);
const hemi=new THREE.HemisphereLight(0xe6f4ff,0x3a6a1a,.14);sc.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d0,2.0);sun.castShadow=true;
Object.assign(sun.shadow.camera,{left:-22,right:22,top:22,bottom:-22,near:1,far:80});sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;sc.add(sun);sc.add(sun.target);
const rim=new THREE.DirectionalLight(0xffd8a0,.5);sc.add(rim);sc.add(rim.target);
const skyCanvas=document.createElement('canvas');skyCanvas.width=4;skyCanvas.height=256;const skyTex=new THREE.CanvasTexture(skyCanvas);skyTex.encoding=THREE.sRGBEncoding;sc.background=skyTex;
function paintSky(stops){const g=skyCanvas.getContext('2d');const gr=g.createLinearGradient(0,0,0,256);stops.forEach(([p,c])=>gr.addColorStop(p,c));g.fillStyle=gr;g.fillRect(0,0,4,256);skyTex.needsUpdate=true}
paintSky([[0,'#2a7ae8'],[.5,'#7cc4ff'],[.75,'#cdeeff'],[1,'#fff4dc']]);
sc.fog=new THREE.Fog(0xbfe4ff,40,110);
// reflejos suaves para metales, gemas y brillos
(()=>{const es=new THREE.Scene();es.add(new THREE.Mesh(new THREE.SphereGeometry(10,32,16),new THREE.MeshBasicMaterial({map:skyTex,color:0x8a8a8a,side:THREE.BackSide})));
  es.add(new THREE.Mesh(new THREE.SphereGeometry(9.8,32,16,0,Math.PI*2,Math.PI*.55,Math.PI*.45),new THREE.MeshBasicMaterial({color:0x2a4a1a,side:THREE.BackSide})));
  const sb=new THREE.Mesh(new THREE.SphereGeometry(1.2,16,12),new THREE.MeshBasicMaterial({color:0xfff2d0}));sb.position.set(-5,6,4);es.add(sb);
  sc.environment=new THREE.PMREMGenerator(ren).fromScene(es,.04).texture})();

/* ---------- postproceso: brillo + color + desenfoque de maqueta ---------- */
const FinalShader={uniforms:{tDiffuse:{value:null},res:{value:new THREE.Vector2(1,1)},tilt:{value:1},expo:{value:.72},hurt:{value:0},warm:{value:new THREE.Vector3(1.04,1,.95)}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:`uniform sampler2D tDiffuse;uniform vec2 res;uniform float tilt,expo,hurt;uniform vec3 warm;varying vec2 vUv;
  vec3 aces(vec3 x){const float a=2.51,b=.03,c=2.43,d=.59,e=.14;return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.,1.);}
  vec3 toS(vec3 c){return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(.0031308,c));}
  void main(){float b=tilt*smoothstep(.32,.5,abs(vUv.y-.5))*.9;vec3 c=texture2D(tDiffuse,vUv).rgb;
    if(b>.05){vec2 px=b/res;c=c*.2;
      c+=.1*(texture2D(tDiffuse,vUv+vec2(px.x,0.)).rgb+texture2D(tDiffuse,vUv-vec2(px.x,0.)).rgb+texture2D(tDiffuse,vUv+vec2(0.,px.y)).rgb+texture2D(tDiffuse,vUv-vec2(0.,px.y)).rgb);
      c+=.1*(texture2D(tDiffuse,vUv+px*.7).rgb+texture2D(tDiffuse,vUv-px*.7).rgb+texture2D(tDiffuse,vUv+vec2(px.x,-px.y)*.7).rgb+texture2D(tDiffuse,vUv+vec2(-px.x,px.y)*.7).rgb);}
    c=aces(c*warm*expo);c=toS(c);float l=dot(c,vec3(.2126,.7152,.0722));c=mix(vec3(l),c,1.2);
    float d=distance(vUv,vec2(.5));c*=1.-.32*smoothstep(.42,.95,d);c=mix(c,vec3(1.,.1,.1),hurt*smoothstep(.3,.8,d));gl_FragColor=vec4(clamp(c,0.,1.),1.);}`};
let composer=null,finalPass=null,bloom=null;
function setupPost(){composer=null;if(QUALITY!=='alta'){ren.toneMapping=THREE.ACESFilmicToneMapping;ren.toneMappingExposure=.72;return}
  ren.toneMapping=THREE.NoToneMapping;const gl=ren.getContext();let rt;const w=ren.domElement.width,h=ren.domElement.height;
  if(ren.capabilities.isWebGL2&&gl.getExtension('EXT_color_buffer_float'))rt=new THREE.WebGLRenderTarget(w,h,{type:THREE.HalfFloatType,format:THREE.RGBAFormat});
  composer=new THREE.EffectComposer(ren,rt);composer.addPass(new THREE.RenderPass(sc,cam));
  bloom=new THREE.UnrealBloomPass(new THREE.Vector2(w,h),.24,.4,1.5);composer.addPass(bloom);
  finalPass=new THREE.ShaderPass(FinalShader);composer.addPass(finalPass)}
function applyQuality(){const hi=QUALITY==='alta';ren.setPixelRatio(Math.min(devicePixelRatio,hi?(MOBILE?1.5:2):1));
  sun.shadow.mapSize.set(hi?(MOBILE?1536:2048):1024,hi?(MOBILE?1536:2048):1024);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}
  resize();setupPost();resize()}
function resize(){ROT=innerHeight>innerWidth&&!IN_APP;app.classList.toggle('rot',ROT);
  const w=ROT?innerHeight:innerWidth,h=ROT?innerWidth:innerHeight;ren.setSize(w,h);cam.aspect=w/h;cam.fov=w/h<1.5?52:44;cam.updateProjectionMatrix();
  if(composer){composer.setSize(w,h);finalPass.uniforms.res.value.set(ren.domElement.width,ren.domElement.height)}}
addEventListener('resize',()=>setTimeout(resize,80));
function renderFrame(){if(composer)composer.render();else ren.render(sc,cam)}

/* ---------- texturas de lienzo ---------- */
function cv(w,h,f,rep){const c=document.createElement('canvas');c.width=w;c.height=h;f(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;t.anisotropy=8;if(rep)t.repeat.set(rep,rep);return t}
function cvLin(w,h,f){const t=cv(w,h,f);t.encoding=THREE.LinearEncoding;return t}
const T_dot=cv(64,64,(g)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.4,'rgba(255,255,255,.6)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64)});
const T_shadow=cv(64,64,(g)=>{const r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(0,0,0,.55)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,64,64)});
const T_slash=cvLin(256,16,(g)=>{const gr=g.createLinearGradient(0,0,256,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.7,'rgba(255,255,255,.6)');gr.addColorStop(1,'rgba(255,255,255,1)');g.fillStyle=gr;g.fillRect(0,0,256,16)});
const T_wood=cv(128,128,(g,w,h)=>{g.fillStyle='#9a6234';g.fillRect(0,0,w,h);for(let i=0;i<40;i++){g.strokeStyle=`rgba(60,30,10,${R(.15,.4)})`;g.lineWidth=R(1,3);g.beginPath();const y=R(0,h);g.moveTo(0,y);g.bezierCurveTo(w*.3,y+R(-6,6),w*.6,y+R(-6,6),w,y+R(-4,4));g.stroke()}});
function groundTex(base,specks,hues,extra){return cv(512,512,(g,w,h)=>{g.fillStyle=base;g.fillRect(0,0,w,h);
  for(let i=0;i<46;i++){const r=g.createRadialGradient(0,0,0,0,0,90);const x=R(0,w),y=R(0,h);r.addColorStop(0,`hsla(${R(hues[0],hues[1])},${hues[2]}%,${R(hues[3],hues[4])}%,.3)`);r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;
    for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++){g.save();g.translate(x+ox*w,y+oy*h);g.fillRect(-90,-90,180,180);g.restore()}}
  for(let i=0;i<specks;i++){g.fillStyle=`hsl(${R(hues[0],hues[1])},${hues[2]}%,${R(hues[3],hues[4])}%)`;g.fillRect(R(0,w),R(0,h),R(1,2.5),R(1.5,5))}if(extra)extra(g,w,h)})}

/* ---------- materiales y mallas ---------- */
const S=(c,o)=>new THREE.MeshStandardMaterial(Object.assign({color:c,roughness:.6},o||{}));
const P=(c,o)=>new THREE.MeshPhysicalMaterial(Object.assign({color:c,roughness:.32,clearcoat:1,clearcoatRoughness:.12},o||{}));
const matCache={};function SM(c,o){const k='S'+c+JSON.stringify(o||{});return matCache[k]||(matCache[k]=S(c,o))}
function PM(c,o){const k='P'+c+JSON.stringify(o||{});return matCache[k]||(matCache[k]=P(c,o))}
function mk(geo,mat,x=0,y=0,z=0,parent=sc,cast=true){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;parent.add(m);return m}
function bumpy(geo,amt,f=5){const p=geo.attributes.position,v=new THREE.Vector3();for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const n=1+(Math.sin(v.x*f+v.y*3.3)*.5+Math.sin(v.z*(f-.4)-v.y*2.1)*.5)*amt;p.setXYZ(i,v.x*n,v.y*n,v.z*n)}geo.computeVertexNormals();return geo}
function shade(geo,top,bottom){const p=geo.attributes.position,c=new Float32Array(p.count*3),a=new THREE.Color(top),b=new THREE.Color(bottom),t=new THREE.Color();geo.computeBoundingBox();const bb=geo.boundingBox;
  for(let i=0;i<p.count;i++){const k=(p.getY(i)-bb.min.y)/(bb.max.y-bb.min.y||1);t.copy(b).lerp(a,k);c[i*3]=t.r;c[i*3+1]=t.g;c[i*3+2]=t.b}geo.setAttribute('color',new THREE.BufferAttribute(c,3));return geo}
const OUT=new THREE.MeshBasicMaterial({color:0x1a1018,side:THREE.BackSide});
function outline(m,k=1.07){const o=new THREE.Mesh(m.geometry,OUT);o.scale.setScalar(k);o.userData.outline=true;m.add(o);return m}
function blobShadow(g,r){const sh=new THREE.Mesh(new THREE.PlaneGeometry(r*2,r*2),new THREE.MeshBasicMaterial({map:T_shadow,transparent:true,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.position.y=.04;g.add(sh);return sh}
/* fusiona todo lo estático de un grupo por material: muchas menos llamadas de dibujo en el móvil */
function mergeStatic(group){group.updateMatrixWorld(true);const buckets=new Map(),drop=[];
  group.traverse(o=>{if(!o.isMesh||o.userData.keep||o.isInstancedMesh)return;const m=o.material;if(Array.isArray(m))return;
    let g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();const names=Object.keys(g.attributes).sort().join(',');
    if(!g.attributes.uv){g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2))}
    for(const k of Object.keys(g.attributes))if(!['position','normal','uv','color'].includes(k))g.deleteAttribute(k);
    g.applyMatrix4(o.matrixWorld);const key=m.uuid+'|'+Object.keys(g.attributes).sort().join(',')+'|'+o.castShadow;
    if(!buckets.has(key))buckets.set(key,{m,cast:o.castShadow,list:[]});buckets.get(key).list.push(g);drop.push(o)});
  drop.forEach(o=>o.parent&&o.parent.remove(o));
  const out=new THREE.Group();group.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(group.matrixWorld).invert();
  for(const {m,cast,list} of buckets.values()){for(let i=0;i<list.length;i+=60){const part=list.slice(i,i+60);const mg=THREE.BufferGeometryUtils.mergeBufferGeometries(part,false);if(!mg)continue;mg.applyMatrix4(inv);
    const mesh=new THREE.Mesh(mg,m);mesh.castShadow=cast;mesh.receiveShadow=true;out.add(mesh)}}
  group.add(out);return out}

/* ---------- partículas ---------- */
const parts=[];const partG=new THREE.SphereGeometry(1,6,4);
function burst(x,y,z,col,n,sp,size=.09){for(let i=0;i<n;i++){const m=new THREE.Mesh(partG,new THREE.MeshBasicMaterial({color:col,transparent:true}));m.scale.setScalar(R(.5,1.3)*size);m.position.set(x,y,z);sc.add(m);
  parts.push({m,vx:R(-1,1)*sp,vy:R(.4,1.6)*sp,vz:R(-1,1)*sp,life:R(.45,.9),g:6})}}
function puff(x,y,z,col,n,sz=.25){for(let i=0;i<n;i++){const m=new THREE.Mesh(partG,new THREE.MeshBasicMaterial({color:col,transparent:true,opacity:.7,depthWrite:false}));m.scale.setScalar(sz*R(.6,1.2));m.position.set(x+R(-.3,.3),y,z+R(-.3,.3));sc.add(m);
  parts.push({m,vx:R(-.4,.4),vy:R(.6,1.4),vz:R(-.4,.4),life:R(.6,1),g:-.5,grow:1.8})}}
function stepParts(dt){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.life-=dt;p.vy-=p.g*dt;p.m.position.x+=p.vx*dt;p.m.position.y=Math.max(.05,p.m.position.y+p.vy*dt);p.m.position.z+=p.vz*dt;
  if(p.grow)p.m.scale.multiplyScalar(1+p.grow*dt);p.m.material.opacity=Math.min(p.grow?.7:1,p.life*2);if(p.life<=0){sc.remove(p.m);p.m.material.dispose();parts.splice(i,1)}}}

/* ---------- sonido ---------- */
const SFX={ac:null,master:null,muted:false,
  init(){if(this.ac){if(this.ac.state==='suspended')this.ac.resume();return}try{this.ac=new (window.AudioContext||window.webkitAudioContext)();this.master=this.ac.createGain();this.master.gain.value=.9;this.master.connect(this.ac.destination)}catch(e){}},
  tone(f,d,type='square',v=.06,f2,delay=0){const a=this.ac;if(!a||this.muted)return;const t0=a.currentTime+delay;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t0);if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t0+d);
    g.gain.setValueAtTime(v,t0);g.gain.exponentialRampToValueAtTime(.001,t0+d);o.connect(g).connect(this.master);o.start(t0);o.stop(t0+d+.02)},
  noise(d,v=.1,f=1200){const a=this.ac;if(!a||this.muted)return;const n=Math.floor(a.sampleRate*d),b=a.createBuffer(1,n,a.sampleRate),c=b.getChannelData(0);for(let i=0;i<n;i++)c[i]=(Math.random()*2-1)*(1-i/n);
    const s=a.createBufferSource();s.buffer=b;const fl=a.createBiquadFilter();fl.type='lowpass';fl.frequency.value=f;const g=a.createGain();g.gain.value=v;s.connect(fl).connect(g).connect(this.master);s.start()},
  swish(){this.noise(.14,.08,3200);this.tone(700,.12,'sawtooth',.02,250)},hit(){this.tone(240,.1,'square',.07,90);this.noise(.08,.08,1800)},
  gem(){this.tone(1320,.07,'square',.035);this.tone(1760,.09,'square',.035,0,.06)},heart(){[880,1175,1568].forEach((f,i)=>this.tone(f,.1,'triangle',.06,0,i*.07))},
  hurt(){this.tone(320,.25,'sawtooth',.07,80);this.noise(.15,.06,900)},boom(){this.noise(.6,.22,500);this.tone(110,.5,'sawtooth',.12,30)},
  chest(){[523,659,784,1047,1319].forEach((f,i)=>this.tone(f,.18,'triangle',.07,0,i*.1))},key(){[784,988,1175,1568,1976].forEach((f,i)=>this.tone(f,.22,'square',.05,0,i*.09))},
  block(){this.tone(1400,.06,'square',.05,900)},shoot(){this.tone(900,.12,'triangle',.06,1600)},kick(){this.noise(.08,.12,700);this.tone(160,.08,'square',.06,80)},
  door(){this.noise(1.2,.12,300);this.tone(90,1.1,'sawtooth',.06,60)},step(){this.noise(.03,.015,600)}};
