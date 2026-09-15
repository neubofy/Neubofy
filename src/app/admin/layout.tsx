"use client";

import React, { useEffect, useState } from "react";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { User, signOut, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { resolveAdminRole, AdminRole } from "@/lib/admin/rbac";
import { AdminContext } from "@/lib/admin/AdminContext";
import { ensureOwnerAdminProfile, updateAdminCommunicationEmail } from "@/lib/admin/team";
import { 
  ShieldAlert, 
  Lock, 
  LogOut, 
  ArrowLeft, 
  KeyRound, 
  Sparkles, 
  Menu, 
  X, 
  ExternalLink, 
  Layers, 
  Users,
  LayoutDashboard,
  UserCheck,
  BarChart3,
  Activity,
  Mail,
  Settings
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AdminRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Login state if not authenticated
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [communicationEmail, setCommunicationEmail] = useState<string>("");
  const [commModalOpen, setCommModalOpen] = useState(false);
  const [commInput, setCommInput] = useState("");
  const [isSavingComm, setIsSavingComm] = useState(false);
  const [commFeedback, setCommFeedback] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;
    let isMounted = true;

    if (typeof window !== "undefined") {
      try {
        unsubscribe = getFirebaseAuth().onAuthStateChanged(async (currentUser) => {
          if (!isMounted) return;
          setUser(currentUser);

          if (currentUser && currentUser.email) {
            let firestoreRole: AdminRole | undefined = undefined;
            const cleanEmail = currentUser.email.toLowerCase().trim();

            try {
              // 1. Check direct UID document in /admins/{uid}
              const adminDoc = await getDoc(doc(getFirebaseDb(), "admins", currentUser.uid));
              if (adminDoc.exists()) {
                firestoreRole = adminDoc.data().role as AdminRole;
                if (adminDoc.data().communicationEmail) {
                  setCommunicationEmail(adminDoc.data().communicationEmail);
                  setCommInput(adminDoc.data().communicationEmail);
                }
              } else {
                // 2. Check if invited by email in /admins/{sanitizedEmail}
                const emailDocId = cleanEmail.replace(/[^a-zA-Z0-9]/g, "_");
                const emailDoc = await getDoc(doc(getFirebaseDb(), "admins", emailDocId));
                if (emailDoc.exists()) {
                  firestoreRole = emailDoc.data().role as AdminRole;
                  if (emailDoc.data().communicationEmail) {
                    setCommunicationEmail(emailDoc.data().communicationEmail);
                    setCommInput(emailDoc.data().communicationEmail);
                  }
                  // Auto-claim and link invitation directly to UID for Firestore security rules
                  await setDoc(doc(getFirebaseDb(), "admins", currentUser.uid), {
                    uid: currentUser.uid,
                    email: cleanEmail,
                    displayName: currentUser.displayName || "Administrator",
                    role: firestoreRole,
                    communicationEmail: emailDoc.data().communicationEmail || cleanEmail,
                    invitedBy: emailDoc.data().addedBy || "Super Administrator",
                    createdAt: emailDoc.data().createdAt || new Date().toISOString(),
                    lastActive: new Date().toISOString(),
                  }, { merge: true });
                }
              }
            } catch (err) {
              console.warn("Could not fetch /admins/ record:", err);
            }

            // Resolve role (checks Vercel secret variable NEXT_PUBLIC_ADMIN_EMAIL first, then Firestore)
            const resolved = resolveAdminRole(currentUser.email, firestoreRole);
            setRole(resolved);

            // If user is the Super Administrator (Owner), guarantee their document is updated in /admins
            if (resolved === "super_admin") {
              ensureOwnerAdminProfile(currentUser.uid, cleanEmail, currentUser.displayName || undefined).catch((err) => {
                console.warn("Owner admin profile sync warning:", err);
              });
            }
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
          <p className="text-center text-muted-foreground mb-6 text-xs leading-relaxed">
            Restricted to Neubofy Super Administrators (Owner) and authorized Administrators.
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
                placeholder="name@neubofy.in"
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
            The account <strong className="text-foreground">{user.email}</strong> is not an authorized administrator for the Neubofy Talent Operations Portal.
          </p>

          <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-left text-xs text-muted-foreground mb-6 space-y-1.5">
            <p><strong>RBAC Requirement:</strong> Super Administrator (Owner) or Administrator role.</p>
            <p>Specialist applicants and network members manage their own profile from the Specialist Portal.</p>
            <p>If you are a Neubofy staff member, your administrator must invite your email.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={handleLogout} className="rounded-xl border-white/10 gap-2">
              <LogOut size={14} /> Sign Out of {user.email}
            </Button>
            <Link href="/career">
              <Button className="rounded-xl btn-electric w-full sm:w-auto">
                Go to Specialist Portal
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Authorized Admin -> Strictly 2-post roles
  const ROLE_DISPLAY: Record<AdminRole, { title: string; color: string; bg: string }> = {
    super_admin: { title: "Super Administrator", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30" },
    admin: { title: "Administrator", color: "text-primary", bg: "bg-primary/10 border-primary/30" },
  };

  const currentRoleInfo = (role && ROLE_DISPLAY[role]) || ROLE_DISPLAY.admin;
  const pathname = usePathname();

  const navLinks = [
    { name: "Overview", href: "/admin", icon: LayoutDashboard, exact: true },
    { name: "Applicants", href: "/admin/applicants", icon: UserCheck, exact: false },
    { name: "Analytics", href: "/admin/analytics", icon: BarChart3, exact: false },
    { name: "Track Record", href: "/admin/track-record", icon: Activity, exact: false },
    { name: "Neubofian Team", href: "/admin/team", icon: Users, exact: false },
  ];

  return (
    <div className="min-h-screen bg-[#07080c] text-foreground pt-20">
      
      {/* Admin Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#07080c]/90 backdrop-blur-xl border-b border-white/10 h-20">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 h-full flex items-center justify-between">
          
          {/* Brand Logo & Title */}
          <div className="flex items-center space-x-6">
            <Link href="/admin" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
              <Image
                src="/neubofylogo.png"
                alt="Neubofy Logo"
                width={32}
                height={32}
                className="rounded-full"
              />
              <div className="flex flex-col">
                <span className="text-xl font-bold text-foreground flex items-center gap-2">
                  Neubofy™ <span className="text-primary text-[10px] font-semibold px-2 py-0.5 rounded bg-primary/10 border border-primary/20">TALENT ATS</span>
                </span>
                <span className="text-[10px] text-muted-foreground -mt-0.5">Recruitment Portal</span>
              </div>
            </Link>

            {/* Desktop Navigation Links to Sub-Pages */}
            <nav className="hidden xl:flex items-center space-x-1.5 text-xs font-medium pl-4 border-l border-white/10">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = link.exact ? pathname === link.href : pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 py-1.5 px-3 rounded-xl transition-all ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    <Icon size={13} /> {link.name}
                  </Link>
                );
              })}
              <Link
                href="/career"
                target="_blank"
                className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 py-1.5 px-2.5 rounded-xl hover:bg-white/5 ml-2"
              >
                <ExternalLink size={11} /> Live Career Hub
              </Link>
            </nav>
          </div>

          {/* User Info & Always-Visible Log Out Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex flex-col text-right">
              <span className="text-xs font-medium text-foreground truncate max-w-[130px] sm:max-w-[200px]">{user.email}</span>
              <div className="flex items-center gap-1.5 ml-auto mt-0.5">
                <button
                  onClick={() => {
                    setCommInput(communicationEmail || user.email || "");
                    setCommModalOpen(true);
                  }}
                  className="text-[10px] text-primary/80 hover:text-primary flex items-center gap-1 transition-colors px-1.5 py-0.2 rounded-md bg-primary/10 border border-primary/20"
                  title="Configure Personal Reply-To Email for Applicant Review"
                >
                  <Mail size={10} />
                  <span className="truncate max-w-[90px]">{communicationEmail ? communicationEmail.split("@")[0] : "Reply-To"}</span>
                </button>

                <span className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border inline-block ${currentRoleInfo.bg} ${currentRoleInfo.color}`}>
                  {currentRoleInfo.title}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-rose-500/30 text-rose-400 hover:bg-rose-500/15 hover:text-rose-300 rounded-xl text-xs gap-1.5 h-9 flex items-center shrink-0"
              title="Sign Out of Admin Console"
            >
              <LogOut size={14} /> <span>Sign Out</span>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="xl:hidden p-2 rounded-lg text-foreground hover:bg-white/5 border border-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle admin navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

        </div>

        {/* Mobile Dropdown Menu with Sub-Page Navigation */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-4 px-6 glass-card border-x-0 rounded-none absolute top-full left-0 w-full animate-fade-in-up backdrop-blur-3xl bg-[#07080c]/98 border-b border-white/10 space-y-4 shadow-2xl">
            <div className="p-3 rounded-2xl bg-black/50 border border-white/10">
              <span className="text-xs font-medium text-foreground block truncate">{user.email}</span>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border inline-block mt-1.5 ${currentRoleInfo.bg} ${currentRoleInfo.color}`}>
                {currentRoleInfo.title}
              </span>
            </div>

            <div className="space-y-1 text-xs">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = link.exact ? pathname === link.href : pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "hover:bg-white/5 text-foreground"
                    }`}
                  >
                    <Icon size={14} className={isActive ? "text-primary-foreground" : "text-primary"} /> {link.name}
                  </Link>
                );
              })}
              <Link
                href="/career"
                target="_blank"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-foreground"
              >
                <ExternalLink size={14} /> Public Specialist Hub
              </Link>
            </div>

            <div className="pt-2 border-t border-white/10">
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="w-full border-white/10 hover:bg-destructive/10 hover:text-destructive rounded-xl text-xs gap-1.5 h-9"
              >
                <LogOut size={14} /> Exit Admin
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Member Communication Email Settings Modal */}
      {commModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#0c0e15] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-foreground">Personal Communication Email</h3>
                  <p className="text-[11px] text-muted-foreground">Used as Reply-To when reviewing applicants</p>
                </div>
              </div>
              <button onClick={() => setCommModalOpen(false)} className="p-1 text-muted-foreground hover:text-foreground">
                <X size={16} />
              </button>
            </div>

            {commFeedback && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs">
                {commFeedback}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!user) return;
                setIsSavingComm(true);
                setCommFeedback(null);
                const res = await updateAdminCommunicationEmail(user.uid, commInput);
                setIsSavingComm(false);
                if (res.success) {
                  setCommunicationEmail(commInput.trim().toLowerCase());
                  setCommFeedback("Communication email saved successfully!");
                  setTimeout(() => {
                    setCommModalOpen(false);
                    setCommFeedback(null);
                  }, 1200);
                } else {
                  alert("Failed to update communication email.");
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-medium text-muted-foreground mb-1">
                  Your Preferred Contact / Reply-To Email
                </label>
                <input
                  type="email"
                  required
                  value={commInput}
                  onChange={(e) => setCommInput(e.target.value)}
                  placeholder={user?.email || "name@neubofy.in"}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  When you dispatch emails to candidates, they can reply directly to this address.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" type="button" onClick={() => setCommModalOpen(false)} className="rounded-xl border-white/10 text-xs">
                  Cancel
                </Button>
                <Button size="sm" type="submit" disabled={isSavingComm} className="btn-electric rounded-xl text-xs font-semibold">
                  {isSavingComm ? "Saving..." : "Save Reply-To Email"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Admin Content Container */}
      <AdminContext.Provider
        value={{
          user,
          role,
          isSuperAdmin: role === 'super_admin',
          isAdmin: role === 'admin',
          communicationEmail,
          updateCommunicationEmail: async (newEmail: string) => {
            if (!user) return false;
            const res = await updateAdminCommunicationEmail(user.uid, newEmail);
            if (res.success) {
              setCommunicationEmail(newEmail);
              return true;
            }
            return false;
          }
        }}
      >
        <main className="container mx-auto px-4 md:px-6 lg:px-8 py-8">
          {children}
        </main>
      </AdminContext.Provider>
    </div>
  );
}

