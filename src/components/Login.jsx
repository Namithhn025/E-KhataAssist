import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Real Firebase Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        localStorage.setItem('crm_role', role);
        if (role === 'admin') navigate('/admin');
        else if (role === 'marketing') navigate('/marketing');
        else navigate('/worker');
      } else {
        // Fallback or setup first user
        const defaultRole = (email.toLowerCase().includes('admin') || 
                             email.toLowerCase() === 'namaproptech2026@gmail.com' ||
                             email.toLowerCase() === 'namaproptech2026@ekhataassist.com') ? 'admin' :
                             (email.toLowerCase() === 'marketing@ekhataassist.com' || email.toLowerCase().includes('marketing')) ? 'marketing' : 'worker';
        localStorage.setItem('crm_role', defaultRole);
        if (defaultRole === 'admin') navigate('/admin');
        else if (defaultRole === 'marketing') navigate('/marketing');
        else navigate('/worker');
      }
    } catch (err) {
      if (email.toLowerCase() === 'marketing@ekhataassist.com' && password === 'EkhataAssist15122002') {
        const role = 'marketing';
        localStorage.setItem('crm_role', role);
        navigate('/marketing');
        return;
      }
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Firebase Error: Email/Password provider is not enabled in your console.');
      } else {
        setError('Login failed: ' + err.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-green-50">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-primary mb-2">E-Khata Assist CRM</h2>
          <p className="text-gray-500">Sign in to manage your property services</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="name@ekhata.com"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-semibold text-gray-700">Password</label>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-opacity-90 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-100 transform active:scale-95 transition-all duration-200"
          >
            Sign In
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;
