import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      try {
        if (firebaseUser) {
          setUser(firebaseUser);
          // Fetch role from Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              const fetchedRole = userDoc.data().role;
              setRole(fetchedRole);
              localStorage.setItem('crm_role', fetchedRole);
            } else {
              const defaultRole = (firebaseUser.email?.toLowerCase().includes('admin') || 
                                   firebaseUser.email?.toLowerCase() === 'namaproptech2026@gmail.com' ||
                                   firebaseUser.email?.toLowerCase() === 'namaproptech2026@ekhataassist.com') ? 'admin' :
                                   (firebaseUser.email?.toLowerCase() === 'marketing@ekhataassist.com' ||
                                    firebaseUser.email?.toLowerCase().includes('marketing')) ? 'marketing' : 'worker';
              setRole(defaultRole);
              localStorage.setItem('crm_role', defaultRole);
            }
          } catch (e) {
            console.error("Firestore user doc fetch error:", e);
            const cachedRole = localStorage.getItem('crm_role') || 
              ((firebaseUser.email?.toLowerCase().includes('admin') || firebaseUser.email?.toLowerCase() === 'namaproptech2026@gmail.com') ? 'admin' : 'worker');
            setRole(cachedRole);
          }
        } else {
          setUser(null);
          setRole(null);
          localStorage.removeItem('crm_role');
        }
      } catch (err) {
        console.error("Auth state handler error:", err);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    await signOut(auth);
    // onAuthStateChanged will fire and clear state + localStorage automatically
  };

  return (
    <AuthContext.Provider value={{ user, role, setRole, loading, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
