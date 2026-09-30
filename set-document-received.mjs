import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, writeBatch } from 'firebase/firestore';

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

const terminalStatuses = ['Blocked','Closed','Pre-Invoice','Retry','Approved','BDA','Panchayat'];

async function setDocumentReceived() {
  const snap = await getDocs(collection(db, 'customers'));
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const activeLeads = all.filter(c =>
    (c.serviceType || c.serviceRequested || c.service) &&
    !c.isMarketingData &&
    c.docsSubmitted &&
    c.docSource &&
    !terminalStatuses.includes(c.serviceStatus)
  );

  console.log(`\nFound ${activeLeads.length} active leads. Setting all to "Document Received"...`);

  // Firestore batch max 500 per batch
  const chunks = [];
  for (let i = 0; i < activeLeads.length; i += 499) {
    chunks.push(activeLeads.slice(i, i + 499));
  }

  let updated = 0;
  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach(c => {
      batch.update(doc(db, 'customers', c.id), {
        serviceStage: 'Document Received',
        updatedAt: new Date().toISOString()
      });
    });
    await batch.commit();
    updated += chunk.length;
    console.log(`  ✓ ${updated}/${activeLeads.length} updated...`);
  }

  console.log(`\nDone! All ${activeLeads.length} active leads set to "Document Received".`);
  process.exit(0);
}

setDocumentReceived().catch(e => { console.error(e); process.exit(1); });
