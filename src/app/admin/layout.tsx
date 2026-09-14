'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getFirebaseAuth, getFirebaseDb } from '@/lib/firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: () => void;

    if (typeof window !== 'undefined') {
      try {
        const auth = getFirebaseAuth();
        unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (!isMounted) return;

          if (user) {
            // Check if user is in admins collection or matches ADMIN_EMAIL
            const ownerEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
            let authorized = false;

            if (user.email === ownerEmail) {
              authorized = true;
            } else {
              try {
                const adminDocRef = doc(getFirebaseDb(), 'admins', user.uid);
                const adminDoc = await getDoc(adminDocRef);
                if (adminDoc.exists()) {
                  authorized = true;
                }
              } catch (e) {
                console.error('Error checking admin status', e);
              }
            }

            if (authorized) {
              setIsAdmin(true);
              if (pathname === '/admin/login') {
                router.push('/admin');
              }
            } else {
              // Valid user, but not admin
              if (pathname !== '/admin/login') {
                 router.push('/admin/login');
              }
            }
          } else {
            setIsAdmin(false);
            if (pathname !== '/admin/login') {
               router.push('/admin/login');
            }
          }
          setLoading(false);
        });
      } catch (e) {
        console.error('Auth init error', e);
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground pt-24">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If on login page, just render it without admin checks blocking the view
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      {isAdmin ? children : (
        <div className="flex items-center justify-center h-full">
           <p className="text-xl">Unauthorized Access</p>
        </div>
      )}
    </div>
  );
}
