// Test-only stand-in for the Firestore web SDK: an in-memory store shared across tabs through localStorage.
const KEY = 'mockDB';
const load = () => { try{ return JSON.parse(localStorage.getItem(KEY)) || {}; }catch(e){ return {}; } };
const save = db => { localStorage.setItem(KEY, JSON.stringify(db)); notify(); };
const subs = new Set();
function notify(){ subs.forEach(fn => fn()); }
window.addEventListener('storage', e => { if(e.key === KEY) notify(); });
const TS = '__ts';
const reviveVal = v => (v && typeof v === 'object' && TS in v) ? { toDate: () => new Date(v[TS]), toMillis: () => v[TS] } : v;
const revive = o => { const r = {}; for(const k in o) r[k] = reviveVal(o[k]); return r; };
const prep = o => { const r = {}; for(const k in o){ const v = o[k]; r[k] = (v && v.__serverTs) ? { [TS]: Date.now() } : v; } return r; };
function authEmail(){ try{ const u = JSON.parse(localStorage.getItem('mockAuthUser')); return u ? u.email.toLowerCase() : null; }catch(e){ return null; } }

export function getFirestore(){ return { _db: true }; }
export function collection(_db, name){ return { kind: 'col', col: name }; }
let autoN = 0;
export function doc(a, col, id){
  if(a && a.kind === 'col') return { kind: 'doc', col: a.col, id: col || ('auto' + Date.now().toString(36) + (autoN++) + Math.random().toString(36).slice(2, 6)) };
  return { kind: 'doc', col, id };
}
export function documentId(){ return '__id__'; }
export function where(f, op, v){ return { t: 'where', f, op, v }; }
export function orderBy(f, dir = 'asc'){ return { t: 'order', f, dir }; }
export function limit(n){ return { t: 'limit', n }; }
export function query(col, ...cons){ return { kind: 'query', col: col.col, cons }; }
export function serverTimestamp(){ return { __serverTs: true }; }

function snapDoc(col, id, data){
  return { id, ref: doc(null, col, id), exists: () => data !== undefined, data: () => data === undefined ? undefined : revive(data) };
}
function runQuery(q){
  const db = load(); const c = db[q.col] || {};
  let rows = Object.entries(c).map(([id, d]) => ({ id, d }));
  for(const k of q.cons){
    if(k.t === 'where'){
      const get = r => k.f === '__id__' ? r.id : r.d[k.f];
      rows = rows.filter(r => { const v = get(r);
        if(k.op === '==') return v === k.v; if(k.op === 'in') return k.v.includes(v); if(k.op === '<') return v < k.v; if(k.op === '>=') return v >= k.v; return true; });
    }
  }
  for(const k of q.cons) if(k.t === 'order'){ rows.sort((a, b) => { const av = a.d[k.f], bv = b.d[k.f]; const x = (av && av[TS]) || av, y = (bv && bv[TS]) || bv; return (x > y ? 1 : x < y ? -1 : 0) * (k.dir === 'desc' ? -1 : 1); }); }
  for(const k of q.cons) if(k.t === 'limit') rows = rows.slice(0, k.n);
  return rows;
}
function denyStaffRead(ref){
  if(ref.col !== 'staff') return false;
  const me = authEmail(); if(me === 'aisuparfaiteria@gmail.com') return false;
  const db = load(); return !(me && db.staff && db.staff[me]);
}
export async function getDoc(ref){
  if(denyStaffRead(ref)) throw Object.assign(new Error('denied'), { code: 'permission-denied' });
  const db = load(); return snapDoc(ref.col, ref.id, (db[ref.col] || {})[ref.id]);
}
export async function getDocs(q){ const rows = runQuery(q); const docs = rows.map(r => snapDoc(q.col, r.id, r.d)); return { docs, size: docs.length, empty: !docs.length }; }
export function onSnapshot(target, next, err){
  let prev = null;
  const fire = () => {
    try{
      if(target.kind === 'doc'){ const db = load(); next(snapDoc(target.col, target.id, (db[target.col] || {})[target.id])); return; }
      const q = target.kind === 'col' ? { col: target.col, cons: [] } : target;
      const rows = runQuery(q); const ids = rows.map(r => r.id);
      const changes = rows.filter(r => !prev || !prev.includes(r.id)).map(r => ({ type: 'added', doc: snapDoc(q.col, r.id, r.d) }));
      prev = ids;
      next({ docs: rows.map(r => snapDoc(q.col, r.id, r.d)), size: rows.length, docChanges: () => changes });
    }catch(e){ err && err(e); }
  };
  setTimeout(fire, 10); subs.add(fire);
  return () => subs.delete(fire);
}
export async function setDoc(ref, data){ const db = load(); (db[ref.col] = db[ref.col] || {})[ref.id] = prep(data); save(db); }
export async function addDoc(col, data){ const ref = doc(col); await setDoc(ref, data); return ref; }
export async function updateDoc(ref, patch){ const db = load(); const c = db[ref.col] || {}; if(!c[ref.id]) throw Object.assign(new Error('nf'), { code: 'not-found' }); c[ref.id] = { ...c[ref.id], ...prep(patch) }; db[ref.col] = c; save(db); }
export async function deleteDoc(ref){ const db = load(); if(db[ref.col]) delete db[ref.col][ref.id]; save(db); }
export async function runTransaction(_db, fn){
  const ops = [];
  const tx = { get: async ref => { const db = load(); return snapDoc(ref.col, ref.id, (db[ref.col] || {})[ref.id]); },
    set(ref, d){ ops.push(['set', ref, d]); return tx; }, update(ref, d){ ops.push(['update', ref, d]); return tx; } };
  const out = await fn(tx);
  const db = load();
  for(const [op, ref, d] of ops){ const c = db[ref.col] = db[ref.col] || {}; c[ref.id] = op === 'set' ? prep(d) : { ...(c[ref.id] || {}), ...prep(d) }; }
  save(db); return out;
}
export function writeBatch(){ const ops = []; return { delete(ref){ ops.push(ref); }, async commit(){ const db = load(); ops.forEach(r => { if(db[r.col]) delete db[r.col][r.id]; }); save(db); } }; }
