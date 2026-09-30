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

const todayStr = '2026-09-26';

async function fetchTodayLeads() {
  const snap = await getDocs(collection(db, 'customers'));
  const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

  const todayLeads = all.filter(c => (c.createdAt || '').startsWith(todayStr));

  const marketingLeads = todayLeads.filter(c => c.isMarketingData === true);
  const movedToOps = todayLeads.filter(c => c.marketingMovedDate && c.marketingMovedDate.startsWith(todayStr));
  const salesLeads = todayLeads.filter(c => !c.isMarketingData && !c.marketingMovedDate);

  console.log(`\n===== ALL LEADS CREATED TODAY — ${todayLeads.length} total =====`);
  todayLeads.forEach((c, i) => {
    const type = c.isMarketingData ? '📣 MARKETING' : c.marketingMovedDate ? '🔄 MOVED TO OPS' : '📋 SALES/OPS';
    console.log(`${i+1}. [${type}] ${c.customerName || 'Unknown'} | ${c.phone || 'No phone'} | ${c.apartment || c.society || 'No apt'} | Created: ${c.createdAt?.slice(0,16)}`);
  });

  console.log(`\n----- SUMMARY -----`);
  console.log(`Total today:       ${todayLeads.length}`);
  console.log(`Marketing only:    ${marketingLeads.length}`);
  console.log(`Moved to Ops:      ${movedToOps.length}`);
  console.log(`Direct Sales/Ops:  ${salesLeads.length}`);
  process.exit(0);
}

fetchTodayLeads().catch(e => { console.error(e); process.exit(1); });
