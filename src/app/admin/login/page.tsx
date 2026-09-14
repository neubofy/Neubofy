'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { bootstrapSuperAdmin } from '@/app/actions/adminActions';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const auth = getFirebaseAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify admin status before letting them in
      const ownerEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
      let authorized = false;

      if (user.email && ownerEmail && user.email.toLowerCase() === ownerEmail.toLowerCase()) {
        authorized = true;
        // Bootstrap super admin to ensure their UID is in the admins collection for Firestore rules
        await bootstrapSuperAdmin(user.email, user.uid);
      } else {
        const adminDocRef = doc(getFirebaseDb(), 'admins', user.uid);
        const adminDoc = await getDoc(adminDocRef);
        if (adminDoc.exists()) {
          authorized = true;
        }
      }

      if (!authorized) {
        // Sign out if not authorized
        await auth.signOut();
        throw new Error('Unauthorized. Only administrators can access this portal.');
      }

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Failed to login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="glass-card card-3d p-8 rounded-2xl max-w-md w-full relative z-10 border border-primary/20">
        <h1 className="text-3xl font-bold text-center mb-6">Admin Portal</h1>
        <p className="text-sm text-center text-muted-foreground mb-6">Restricted access.</p>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full btn-electric mt-4">
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
             Return to main site
          </Link>
        </div>
      </div>
    </div>
  );
}
