// Juegos Neira: guarda los juegos en el móvil para jugar sin internet
// y descarga las versiones nuevas en cuanto hay conexión.
const CACHE='juegos-neira-v9';
self.addEventListener('install',e=>self.skipWaiting());
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
  const req=e.request;if(req.method!=='GET')return;
  const html=req.mode==='navigate'||(req.headers.get('accept')||'').includes('text/html');
  if(html){ // páginas: primero internet (para ver los cambios), si no hay, lo guardado
    e.respondWith(fetch(req,{cache:'no-store'}).then(r=>{const c=r.clone();caches.open(CACHE).then(k=>k.put(req,c));return r}).catch(()=>caches.match(req).then(r=>r||caches.match('./'))));
    return}
  // resto (coches, librerías): lo guardado al momento y se actualiza por detrás
  e.respondWith(caches.open(CACHE).then(k=>k.match(req).then(hit=>{
    const net=fetch(req).then(r=>{if(r&&(r.ok||r.type==='opaque'))k.put(req,r.clone());return r}).catch(()=>hit);
    return hit||net})));
});
