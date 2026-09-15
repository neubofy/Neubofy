"use client";

import React, { useEffect, useState } from "react";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { User, signOut, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { resolveAdminRole, AdminRole } from "@/lib/admin/rbac";
import { AdminContext } from "@/lib/admin/AdminContext";
import { ShieldAlert, ShieldCheck, Lock, LogOut, ArrowLeft, KeyRound, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Login state if not authenticated
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void;
    let isMounted = true;

    if (typeof window !== "undefined") {
      try {
        unsubscribe = getFirebaseAuth().onAuthStateChanged(async (currentUser) => {
          if (!isMounted) return;
          setUser(currentUser);

          if (currentUser) {
            let firestoreRole: AdminRole | undefined = undefined;
            try {
              const adminDoc = await getDoc(doc(getFirebaseDb(), "admins", currentUser.uid));
              if (adminDoc.exists()) {
                firestoreRole = adminDoc.data().role as AdminRole;
              }
            } catch (err) {
              console.warn("Could not fetch /admins/ document, using email role resolver:", err);
            }

            const resolved = resolveAdminRole(currentUser.email, firestoreRole);
            setRole(resolved);
          } else {
            setRole(null);
          }
          setLoading(false);
        });
      } catch (e) {
        console.error("Firebase auth error", e);
        setLoading(false);
      }
    }

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError("");

    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), loginEmail, loginPassword);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Failed to sign in to admin console.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleAdminLogin = async () => {
    setIsLoggingIn(true);
    setLoginError("");
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      await signInWithPopup(getFirebaseAuth(), provider);
    } catch (err: unknown) {
      setLoginError(err instanceof Error ? err.message : "Failed Google admin authentication.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(getFirebaseAuth());
      setUser(null);
      setRole(null);
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24 bg-[#07080c]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Verifying Security Credentials...</span>
        </div>
      </div>
    );
  }

  // Case 1: Not authenticated -> Show Admin Sign In
  if (!user) {
    return (
      <div className="min-h-screen relative overflow-x-hidden flex flex-col items-center justify-center pt-24 pb-16 px-4 bg-[#07080c]">
        <div className="relative z-10 w-full max-w-md p-8 rounded-3xl glass-card card-3d border border-primary/20 backdrop-blur-3xl shadow-2xl">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/30 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> High-Stakes Admin Gateway
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-center mb-2">Admin Portal Access</h1>
          <p className="text-center text-muted-foreground mb-6 text-xs">
            Restricted to Neubofy Super Administrators, Administrators, and Technical Reviewers.
          </p>

          {loginError && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/20">
              {loginError}
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground uppercase tracking-wider">Admin Email</label>
              <input
                required
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@neubofy.in"
                className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm text-foreground"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1 text-muted-foreground uppercase tracking-wider">Master Password</label>
              <input
                required
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-4 py-2.5 bg-black/50 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm text-foreground"
              />
            </div>

            <Button type="submit" disabled={isLoggingIn} className="w-full h-11 btn-electric rounded-xl font-medium gap-2">
              <KeyRound size={16} /> {isLoggingIn ? "Authenticating..." : "Access Admin Console"}
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#0e1017] px-3 text-muted-foreground">Or</span></div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleAdminLogin}
              disabled={isLoggingIn}
              className="w-full h-11 bg-white text-black hover:bg-gray-100 rounded-xl text-xs font-medium"
            >
              Authenticate with Google Workspace
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors flex items-center justify-center gap-1">
              <ArrowLeft size={12} /> Return to Neubofy Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Authenticated but unauthorized (Role is null) -> Access Denied Screen
  if (!role) {
    return (
      <div className="min-h-screen relative overflow-x-hidden flex flex-col items-center justify-center pt-24 pb-16 px-4 bg-[#07080c]">
        <div className="relative z-10 w-full max-w-lg p-8 rounded-3xl glass-card card-3d border border-destructive/30 backdrop-blur-3xl shadow-2xl text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4 border border-destructive/20">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/30 uppercase tracking-widest inline-block mb-3">
            403 Restricted Access
          </span>

          <h1 className="text-2xl md:text-3xl font-bold mb-3 text-foreground">Unauthorized Access Attempt</h1>
          <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
            The account <strong className="text-foreground">{user.email}</strong> is not authorized to access the Neubofy Recruitment & Partner Operations Admin Portal.
          </p>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-left text-xs text-muted-foreground mb-6 space-y-1">
            <p><strong>RBAC Requirement:</strong> Super Administrator (Owner), Administrator, or Reviewer role.</p>
            <p>If you are a Neubofy team member, contact your system administrator to assign permissions.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={handleLogout} className="rounded-xl border-white/10 gap-2">
              <LogOut size={14} /> Switch Account
            </Button>
            <Link href="/partner">
              <Button className="rounded-xl btn-electric w-full sm:w-auto">
                Go to Partner Portal
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Authorized Admin -> Render Top Nav & Children
  const ROLE_DISPLAY: Record<AdminRole, { title: string; color: string; bg: string }> = {
    super_admin: { title: "Super Administrator (Owner)", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30" },
    admin: { title: "Recruitment Administrator", color: "text-primary", bg: "bg-primary/10 border-primary/30" },
    member: { title: "Technical Reviewer", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/30" },
  };

  const currentRoleInfo = ROLE_DISPLAY[role];

  return (
    <div className="min-h-screen bg-[#07080c] text-foreground pt-20">
      
      {/* Admin Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#0b0c13]/90 backdrop-blur-xl border-b border-white/10 h-20 px-4 md:px-8">
        <div className="h-full flex items-center justify-between max-w-7xl mx-auto">
          
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-3">
              <img src="/neubofylogo.png" alt="Neubofy Logo" className="w-8 h-8 rounded-full border border-primary/40" />
              <div>
                <span className="font-bold text-lg tracking-tight flex items-center gap-2">
                  Neubofy <span className="text-primary text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 border border-primary/20">ATS PORTAL</span>
                </span>
                <span className="text-[10px] text-muted-foreground block -mt-1">Recruitment & Partner Management</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-medium text-foreground truncate max-w-[200px]">{user.email}</span>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-block ml-auto mt-0.5 ${currentRoleInfo.bg} ${currentRoleInfo.color}`}>
                {currentRoleInfo.title}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-white/10 hover:bg-destructive/10 hover:text-destructive rounded-xl text-xs gap-1.5 h-9"
            >
              <LogOut size={14} /> Exit Admin
            </Button>
          </div>

        </div>
      </header>

      {/* Main Admin Content */}
      <AdminContext.Provider
        value={{
          user,
          role,
          isSuperAdmin: role === 'super_admin',
          isAdmin: role === 'admin',
          isMember: role === 'member',
        }}
      >
        <main className="px-4 md:px-8 py-8 max-w-7xl mx-auto">
          {children}
        </main>
      </AdminContext.Provider>
    </div>
  );
}
