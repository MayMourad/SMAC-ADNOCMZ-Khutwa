// Firestore rules tests for Khutwa's tightened docs/firestore.rules.
// Run from this folder: see README.md
import { readFileSync } from 'node:fs';
import {
  initializeTestEnvironment, assertSucceeds, assertFails,
} from '@firebase/rules-unit-testing';
import {
  doc, getDoc, getDocs, setDoc, updateDoc, addDoc, collection, query, where, arrayUnion, Timestamp,
} from 'firebase/firestore';

const env = await initializeTestEnvironment({
  projectId: 'khutwa-rules-test',
  firestore: { rules: readFileSync(process.argv[2], 'utf8'), host: '127.0.0.1', port: 8080 },
});
const db = (uid) => env.authenticatedContext(uid).firestore();
const anon = env.unauthenticatedContext().firestore();

let pass = 0, fail = 0;
async function t(name, fn) {
  try { await fn(); pass++; console.log('  ok   ', name); }
  catch (e) { fail++; console.log('  FAIL ', name, '-', e.message.split('\n')[0]); }
}
const member = (uid, role = 'member') => ({ uid, displayName: uid, role, shareLocation: true, joinedAt: 1 });
const CODE = 'GHAF-ABCD';

// Seed a memory with rules disabled (as the curated seeding would).
await env.withSecurityRulesDisabled(async (c) => {
  await setDoc(doc(c.firestore(), 'memories', 'qasr-al-hosn'), { title: 'Qasr Al Hosn', story: 'text', unlockedBy: null, unlockedAt: null });
});

console.log('Family creation');
let F;
await t('alice creates a family with herself as the only member', async () => {
  const ref = await assertSucceeds(addDoc(collection(db('alice'), 'families'), {
    inviteCode: CODE, members: [member('alice', 'guardian')], memberUids: ['alice'], createdAt: Timestamp.now(),
  }));
  F = ref.id;
});
await t('cannot create a family that lists someone else', () => assertFails(addDoc(collection(db('alice'), 'families'), {
  inviteCode: 'GHAF-XXXX', members: [member('alice', 'guardian'), member('bob')], memberUids: ['alice', 'bob'],
})));
await t('alice registers the invite code', () => assertSucceeds(setDoc(doc(db('alice'), 'inviteCodes', CODE), { familyId: F })));
await t('cannot register a code that is not the family\'s', () => assertFails(setDoc(doc(db('alice'), 'inviteCodes', 'GHAF-ZZZZ'), { familyId: F })));
await t('a non-member cannot register a code for the family', () => assertFails(setDoc(doc(db('mallory'), 'inviteCodes', 'GHAF-ABCD'), { familyId: F })));
await t('an invite code cannot be overwritten', () => assertFails(setDoc(doc(db('alice'), 'inviteCodes', CODE), { familyId: 'other' })));

console.log('Outsiders');
await t('signed-out users cannot read families', () => assertFails(getDoc(doc(anon, 'families', F))));
await t('a stranger cannot read the family', () => assertFails(getDoc(doc(db('mallory'), 'families', F))));
await t('a stranger cannot list families', () => assertFails(getDocs(collection(db('mallory'), 'families'))));
await t('a stranger cannot search families by invite code', () => assertFails(getDocs(query(collection(db('mallory'), 'families'), where('inviteCode', '==', CODE)))));
await t('a stranger cannot list invite codes', () => assertFails(getDocs(collection(db('mallory'), 'inviteCodes'))));
await t('a stranger cannot join without the code', () => assertFails(updateDoc(doc(db('mallory'), 'families', F), {
  members: arrayUnion(member('mallory')), memberUids: arrayUnion('mallory'),
})));
await t('a stranger cannot join with a wrong code', () => assertFails(updateDoc(doc(db('mallory'), 'families', F), {
  members: arrayUnion(member('mallory')), memberUids: arrayUnion('mallory'), joinCode: 'GHAF-WRNG',
})));
await t('a stranger cannot read family steps', () => assertFails(getDocs(collection(db('mallory'), 'families', F, 'steps'))));
await t('a stranger cannot read the tree', () => assertFails(getDoc(doc(db('mallory'), 'treeState', F))));

console.log('Joining with the code (the app\'s flow)');
await t('anyone signed in can look up a code they were given', () => assertSucceeds(getDoc(doc(db('bob'), 'inviteCodes', CODE))));
await t('joiner cannot claim the guardian role', () => assertFails(updateDoc(doc(db('bob'), 'families', F), {
  members: arrayUnion(member('bob', 'guardian')), memberUids: arrayUnion('bob'), joinCode: CODE,
})));
await t('joiner cannot add someone else alongside themselves', () => assertFails(updateDoc(doc(db('bob'), 'families', F), {
  members: arrayUnion(member('bob'), member('eve')), memberUids: arrayUnion('bob', 'eve'), joinCode: CODE,
})));
await t('bob joins with the correct code', () => assertSucceeds(updateDoc(doc(db('bob'), 'families', F), {
  members: arrayUnion(member('bob')), memberUids: arrayUnion('bob'), joinCode: CODE,
})));
await t('bob can now read the family', () => assertSucceeds(getDoc(doc(db('bob'), 'families', F))));
await t('bob finds his family by memberUids (findFamilyForUser)', () => assertSucceeds(getDocs(query(collection(db('bob'), 'families'), where('memberUids', 'array-contains', 'bob')))));
await t('carol joins as the third member', () => assertSucceeds(updateDoc(doc(db('carol'), 'families', F), {
  members: arrayUnion(member('carol')), memberUids: arrayUnion('carol'), joinCode: CODE,
})));
await t('dave cannot join a full family', () => assertFails(updateDoc(doc(db('dave'), 'families', F), {
  members: arrayUnion(member('dave')), memberUids: arrayUnion('dave'), joinCode: CODE,
})));

console.log('Members');
await t('a member can toggle location sharing (rewrite members, same size)', async () => {
  const snap = await getDoc(doc(db('bob'), 'families', F));
  const members = snap.data().members.map((m) => (m.uid === 'bob' ? { ...m, shareLocation: false } : m));
  await assertSucceeds(updateDoc(doc(db('bob'), 'families', F), { members }));
});
await t('a member cannot remove another member', () => assertFails(updateDoc(doc(db('bob'), 'families', F), {
  memberUids: ['alice', 'bob'],
})));
await t('a member cannot change the invite code', () => assertFails(updateDoc(doc(db('bob'), 'families', F), { inviteCode: 'GHAF-NEW1' })));
await t('a member writes their own step row', () => assertSucceeds(setDoc(doc(db('bob'), 'families', F, 'steps', 'bob_2026-10-14'), { uid: 'bob', date: '2026-10-14', steps: 1200 })));
await t('a member cannot write another member\'s step row', () => assertFails(setDoc(doc(db('bob'), 'families', F, 'steps', 'alice_2026-10-14'), { uid: 'alice', steps: 1 })));
await t('a member reads family steps', () => assertSucceeds(getDocs(collection(db('alice'), 'families', F, 'steps'))));
await t('a member writes the tree', () => assertSucceeds(setDoc(doc(db('alice'), 'treeState', F), { familyId: F, stage: 'seed' })));
await t('a member writes week stats', () => assertSucceeds(setDoc(doc(db('alice'), 'families', F, 'stats', 'week'), { memoryUnlocks: 0 })));

console.log('Memories (curated content)');
await t('signed-in users can read memories', () => assertSucceeds(getDocs(collection(db('mallory'), 'memories'))));
await t('a user cannot rewrite a story', () => assertFails(updateDoc(doc(db('mallory'), 'memories', 'qasr-al-hosn'), { story: 'defaced' })));
await t('a user cannot create a memory', () => assertFails(setDoc(doc(db('mallory'), 'memories', 'fake'), { title: 'x' })));
await t('a user cannot record an unlock as someone else', () => assertFails(updateDoc(doc(db('mallory'), 'memories', 'qasr-al-hosn'), { unlockedBy: 'alice', unlockedAt: Timestamp.now() })));
await t('a user records their own unlock (unlockMemory)', () => assertSucceeds(updateDoc(doc(db('bob'), 'memories', 'qasr-al-hosn'), { unlockedBy: 'bob', unlockedAt: Timestamp.now() })));

await env.cleanup();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
