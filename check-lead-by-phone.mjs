import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

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

async function checkLead() {
  const snap = await getDocs(collection(db, 'customers'));
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const lead = all.find(c => (c.phone || '').includes(PHONE));

  if (!lead) {
    console.log(`No lead found with phone: ${PHONE}`);
    process.exit(0);
  }

  console.log('\n===== LEAD DETAILS =====');
  console.log(`Name:             ${lead.customerName || 'N/A'}`);
  console.log(`Phone:            ${lead.phone}`);
  console.log(`Apartment:        ${lead.apartment || lead.society || 'N/A'}`);
  console.log(`isMarketingData:  ${lead.isMarketingData}`);
  console.log(`marketingMovedDate: ${lead.marketingMovedDate || 'NOT moved to ops'}`);
  console.log(`serviceType:      ${lead.serviceType || lead.serviceRequested || lead.service || 'NOT SET'}`);
  console.log(`docsSubmitted:    ${lead.docsSubmitted}`);
  console.log(`docSource:        ${lead.docSource || 'N/A'}`);
  console.log(`serviceStatus:    ${lead.serviceStatus || 'N/A'}`);
  console.log(`createdAt:        ${lead.createdAt}`);
  console.log(`updatedAt:        ${lead.updatedAt || 'N/A'}`);
  console.log(`sourceVault:      ${lead.sourceVault || 'N/A'}`);

  process.exit(0);
}

checkLead().catch(e => { console.error(e); process.exit(1); });
