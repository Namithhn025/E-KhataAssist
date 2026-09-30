import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAXfea39DO2ID6kRVidZYsiUhkHGCIW7dA",
  authDomain: "e-khataassist.firebaseapp.com",
  projectId: "e-khataassist",
  storageBucket: "e-khataassist.firebasestorage.app",
  messagingSenderId: "834216282230",
  appId: "1:834216282230:web:5cd78be5e886c30cc5f757"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const PHONE = '8866888104';

async function fix() {
  const snap = await getDocs(collection(db, 'customers'));
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const lead = all.find(c => (c.phone || '').includes(PHONE));

  if (!lead) { console.log('Lead not found'); process.exit(1); }

  await updateDoc(doc(db, 'customers', lead.id), {
    isMarketingData: false,
    updatedAt: new Date().toISOString()
  });

  console.log(`✓ Fixed: ${lead.customerName} — isMarketingData set to false. Will now appear in Pre-Active.`);
  process.exit(0);
}

fix().catch(e => { console.error(e); process.exit(1); });
