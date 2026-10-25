import test from 'node:test';
import assert from 'node:assert/strict';
import { loadState, SAVE_KEY } from '../src/state.js';
import { openSaveSession } from '../src/save-session.js';
const exclusive = { request: (_name, _options, callback) => Promise.resolve().then(() => callback({})) };
const store = () => { let data = null; return { getItem: () => data, setItem: (_key, value) => { data = value; } }; };

test('property getter SecurityError is caught in default load and session startup', async () => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new DOMException('Blocked', 'SecurityError'); } });
  try {
    assert.equal(loadState().coins, 0);
    const session = await openSaveSession({ locks: exclusive });
    assert.equal(session.status.status, 'memory'); assert.equal(session.canMutate, true);
    session.state.coins = 12; assert.equal(session.save().status, 'memory'); session.close();
  } finally {
    if (descriptor) Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});
test('without Web Locks the existing save can be read but never overwritten', async () => {
  let writes = 0;
  const session = await openSaveSession({ locks: null, getStorage: () => ({ getItem: () => '{"coins":8}', setItem() { writes++; } }) });
  assert.equal(session.state.coins, 8); assert.equal(session.status.status, 'memory');
  session.state.coins++; session.save(); session.close(); assert.equal(writes, 0);
});
test('quota error retains in-memory state, exposes retry, and can recover under the same lock', async () => {
  const storage = store(); let fail = true;
  const session = await openSaveSession({ locks: exclusive, getStorage: () => ({ getItem: storage.getItem, setItem(...args) {
    if (fail) throw new DOMException('Full', 'QuotaExceededError'); storage.setItem(...args);
  } }) });
  session.state.coins = 23;
  assert.equal(session.save().status, 'error'); assert.equal(session.status.reason, 'QuotaExceededError');
  assert.equal(session.canMutate, true); assert.equal(storage.getItem(SAVE_KEY), null);
  fail = false; assert.equal(session.save().status, 'saved');
  assert.equal(JSON.parse(storage.getItem(SAVE_KEY)).coins, 23); session.close();
});
test('close revokes write authority for all future calls', async () => {
  const storage = store(); const session = await openSaveSession({ locks: exclusive, getStorage: () => storage });
  session.state.coins = 9; session.close();
  session.state.coins = 0; assert.equal(session.save().status, 'readonly'); session.close();
  assert.equal(JSON.parse(storage.getItem(SAVE_KEY)).coins, 9); assert.equal(session.canMutate, false);
});
test('unreadable save is never silently replaced by a default snapshot', async () => {
  let writes = 0;
  const session = await openSaveSession({ locks: exclusive, getStorage: () => ({ getItem: () => '{broken', setItem() { writes++; } }) });
  assert.equal(session.status.reason, 'corrupt'); assert.equal(session.canMutate, false);
  session.save(); session.close(); assert.equal(writes, 0);
});
