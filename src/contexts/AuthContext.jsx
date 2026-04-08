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
      if (firebaseUser) {
        setUser(firebaseUser);
        // Fetch role from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          const fetchedRole = userDoc.data().role;
          setRole(fetchedRole);
          localStorage.setItem('crm_role', fetchedRole);
        } else {
          // Fallback: infer role from email
          const defaultRole = firebaseUser.email?.includes('admin') ? 'admin' : 'worker';
          setRole(defaultRole);
          localStorage.setItem('crm_role', defaultRole);
        }
      } else {
        setUser(null);
        setRole(null);
        localStorage.removeItem('crm_role');
      }
      setLoading(false);
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
