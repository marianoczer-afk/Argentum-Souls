import { loadState, SAVE_KEY } from './state.js';

export const SAVE_LOCK = 'argentum-souls:save-writer:v1';
export const SAVE_MESSAGES = {
  saved: 'Progreso guardado correctamente.',
  readonly: 'Otra pestaña está usando este guardado. Esta queda en espera y no puede modificarlo. Cerrá la otra para continuar aquí.',
  memory: 'Progreso solo en memoria: este navegador no permite guardar o coordinar las pestañas. No se conservará al cerrar.',
  error: 'No se pudo guardar. El progreso está solo en esta pestaña. Liberá espacio o habilitá el almacenamiento y pulsá Reintentar antes de cerrar.',
  corrupt: 'No se pudo leer el guardado. No se sobrescribirá. Revisá el almacenamiento y recargá la página antes de continuar.',
};

// All application writes pass through the same lifetime Web Lock. A waiter cannot
// mutate or save; it must read the durable snapshot AFTER acquiring ownership.
// Without atomic cross-tab exclusion we deliberately never write localStorage.
export async function openSaveSession({ getStorage = () => globalThis.localStorage,
  locks = globalThis.navigator?.locks } = {}) {
  const state = loadState({ getItem: () => null });
  const listeners = new Set();
  let storage, status = 'readonly', reason = '', owner = false, closed = false;
  let release, pending;
  const notify = () => { for (const fn of listeners) fn(); };
  const setStatus = (value, detail = '') => { status = value; reason = detail; notify(); return result(); };
  const result = () => ({ status, reason, message: SAVE_MESSAGES[reason === 'corrupt' ? 'corrupt' : status] });
  const read = () => {
    // Validate before normalization: unreadable data must not be replaced with an empty save.
    const text = storage.getItem(SAVE_KEY);
    const raw = text === null ? null : JSON.parse(text);
    if (raw !== null && (typeof raw !== 'object' || Array.isArray(raw))) throw new Error('Invalid save');
    Object.assign(state, loadState({ getItem: () => text }));
  };
  const session = {
    state,
    get canMutate() { return !closed && (status === 'memory' || (owner && reason !== 'corrupt')); },
    get status() { return result(); },
    subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    save() {
      if (closed || status === 'readonly' || reason === 'corrupt') return result();
      if (status === 'memory') return result();
      // Ownership is checked on EVERY write, including retry, purchases, and exit.
      if (!owner) return setStatus('readonly');
      try { storage.setItem(SAVE_KEY, JSON.stringify(state)); return setStatus('saved'); }
      catch (error) { return setStatus('error', error.name || 'write'); }
    },
    close() {
      if (closed) return result();
      const saved = session.save();
      closed = true; owner = false; status = 'readonly'; reason = 'closed';
      pending?.abort(); release?.(); listeners.clear();
      return saved;
    },
  };
  try { storage = getStorage(); storage.getItem(SAVE_KEY); }
  catch { setStatus('memory', 'unavailable'); return session; }
  if (!locks?.request) {
    try { read(); setStatus('memory', 'coordination'); }
    catch { setStatus('error', 'corrupt'); }
    return session;
  }
  function enter() {
    owner = true;
    try { read(); setStatus('saved'); }
    catch { setStatus('error', 'corrupt'); }
  }
  function queue() {
    pending = new AbortController();
    void locks.request(SAVE_LOCK, { mode: 'exclusive', signal: pending.signal }, async () => {
      if (closed) return;
      const held = new Promise(resolve => { release = resolve; });
      enter(); await held;
      owner = false;
    }).catch(error => {
      if (!closed && error.name !== 'AbortError') setStatus('readonly', 'coordination');
    });
  }
  await new Promise(resolve => {
    void locks.request(SAVE_LOCK, { mode: 'exclusive', ifAvailable: true }, async lock => {
      if (!lock) {
        try { read(); } catch { /* A waiter never repairs or writes the save. */ }
        setStatus('readonly'); queue(); resolve(); return;
      }
      enter();
      const held = new Promise(done => { release = done; });
      resolve(); await held; owner = false;
    }).catch(() => {
      try { read(); setStatus('memory', 'coordination'); }
      catch { setStatus('error', 'corrupt'); }
      resolve();
    });
  });
  return session;
}
