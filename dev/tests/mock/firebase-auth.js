// Test-only stand-in for Firebase Auth. Password "wrong" fails; anything else signs in.
const K = 'mockAuthUser'; const ls = new Set();
const cur = () => { try{ return JSON.parse(localStorage.getItem(K)); }catch(e){ return null; } };
const fire = () => ls.forEach(fn => fn(cur()));
export function getAuth(){ return {}; }
export function onAuthStateChanged(_a, fn){ ls.add(fn); setTimeout(() => fn(cur()), 5); return () => ls.delete(fn); }
export async function signInWithEmailAndPassword(_a, email, pw){ if(pw === 'wrong') throw Object.assign(new Error('x'), { code: 'auth/invalid-credential' }); localStorage.setItem(K, JSON.stringify({ email, uid: 'u_' + email })); fire(); return { user: cur() }; }
export async function signOut(){ localStorage.removeItem(K); fire(); }
export async function sendPasswordResetEmail(){ }
