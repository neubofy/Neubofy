"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/firebase";
import { doc, onSnapshot, setDoc, deleteDoc } from "firebase/firestore";
import { signOut, User, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser, GithubAuthProvider, linkWithPopup, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { 
  PARTNER_CATEGORIES, 
  STANDARD_CAPABILITIES, 
  PARTNER_STATUS_LABELS, 
  PartnerStatus, 
  PartnerProfile 
} from "@/lib/partner/types";
import { resolveAdminRole } from "@/lib/admin/rbac";
import { sendPartnerNotification } from "@/app/actions/sendPartnerEmail";
import { Button } from "@/components/ui/button";
import { 
  User as UserIcon, 
  Shield, 
  Lock, 
  LogOut, 
  Save, 
  Plus, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ExternalLink, 
  ArrowLeft, 
  Sparkles,
  Layers,
  FileText,
  Github,
  Linkedin,
  Phone,
  Mail,
  HelpCircle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

function PartnerProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewWelcome = searchParams.get("welcome") === "true";

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  // Status & Feedback
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [updatingAuth, setUpdatingAuth] = useState(false);

  // Profile Form Data
  const [profile, setProfile] = useState<{
    name: string;
    email: string;
    phone: string;
    photoURL: string;
    category: string;
    capabilities: string[];
    bio: string;
    portfolioUrl: string;
    cvUrl: string;
    githubUrl: string;
    linkedinUrl: string;
    status: PartnerStatus;
  }>({
    name: "",
    email: "",
    phone: "",
    photoURL: "",
    category: "",
    capabilities: [],
    bio: "",
    portfolioUrl: "",
    cvUrl: "",
    githubUrl: "",
    linkedinUrl: "",
    status: "draft",
  });

  // Custom Capability Tag input
  const [customCapability, setCustomCapability] = useState("");

  // Account Security Data
  const [authData, setAuthData] = useState({
    newEmail: "",
    currentPassword: "",
    newPassword: "",
  });

  // Load User Auth
  useEffect(() => {
    let unsubscribe: () => void;
    let isMounted = true;
    if (typeof window !== "undefined") {
      try {
        unsubscribe = getFirebaseAuth().onAuthStateChanged((u) => {
          if (isMounted) {
            setUser(u);
            setLoading(false);
          }
        });
      } catch (e) {
        console.error("Auth init error", e);
      }
    }
    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Sync with Firestore
  useEffect(() => {
    let unsubscribe: () => void;
    if (!loading && !user) {
      router.push("/career/login");
    } else if (user) {
      const docRef = doc(getFirebaseDb(), "users", user.uid);
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile({
            name: data.name || user.displayName || "",
            email: data.contacts?.email || data.email || user.email || "",
            phone: data.contacts?.whatsapp || data.phone || "",
            photoURL: data.photoURL || user.photoURL || "",
            category: data.category || "",
            capabilities: Array.isArray(data.capabilities) ? data.capabilities : [],
            bio: data.bio || "",
            portfolioUrl: data.portfolioUrl || "",
            cvUrl: data.cvUrl || "",
            githubUrl: data.githubUrl || "",
            linkedinUrl: data.contacts?.socialUrl || data.linkedinUrl || "",
            status: (data.status as PartnerStatus) || "draft",
          });
        } else {
          // Pre-fill with auth data
          setProfile((prev) => ({
            ...prev,
            name: user.displayName || "",
            email: user.email || "",
            photoURL: user.photoURL || "",
          }));
        }
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, loading, router]);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const toggleCapability = (cap: string) => {
    if (profile.capabilities.includes(cap)) {
      setProfile({
        ...profile,
        capabilities: profile.capabilities.filter((c) => c !== cap),
      });
    } else {
      setProfile({
        ...profile,
        capabilities: [...profile.capabilities, cap],
      });
    }
  };

  const addCustomCapability = () => {
    const trimmed = customCapability.trim();
    if (!trimmed) return;
    if (!profile.capabilities.includes(trimmed)) {
      setProfile({
        ...profile,
        capabilities: [...profile.capabilities, trimmed],
      });
    }
    setCustomCapability("");
  };

  const removeCapability = (cap: string) => {
    setProfile({
      ...profile,
      capabilities: profile.capabilities.filter((c) => c !== cap),
    });
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSaveError("");
    setSaveSuccess("");

    // Mandatory validation
    if (!profile.name.trim()) {
      setSaveError("Full Name is mandatory.");
      setSaving(false);
      return;
    }
    if (!profile.email.trim()) {
      setSaveError("Contact Email is mandatory.");
      setSaving(false);
      return;
    }
    if (!profile.phone.trim()) {
      setSaveError("Mobile / WhatsApp Number is mandatory.");
      setSaving(false);
      return;
    }
    if (!profile.category) {
      setSaveError("Please select your primary Partner Category.");
      setSaving(false);
      return;
    }
    if (profile.capabilities.length === 0) {
      setSaveError("Please select or add at least one capability you can ship.");
      setSaving(false);
      return;
    }
    if (profile.bio.trim().length < 20) {
      setSaveError("Please write a short bio of at least 20 characters.");
      setSaving(false);
      return;
    }

    try {
      const isFirstSubmission = profile.status === "draft";
      const nextStatus: PartnerStatus = isFirstSubmission ? "applied" : profile.status;

      const docRef = doc(getFirebaseDb(), "users", user.uid);
      await setDoc(
        docRef,
        {
          name: profile.name.trim(),
          email: profile.email.trim(),
          phone: profile.phone.trim(),
          photoURL: profile.photoURL.trim(),
          category: profile.category,
          capabilities: profile.capabilities,
          bio: profile.bio.trim(),
          portfolioUrl: profile.portfolioUrl.trim(),
          cvUrl: profile.cvUrl.trim(),
          githubUrl: profile.githubUrl.trim(),
          linkedinUrl: profile.linkedinUrl.trim(),
          status: nextStatus,
          verified: nextStatus === "onboarded",
          contacts: {
            email: profile.email.trim(),
            whatsapp: profile.phone.trim(),
            socialUrl: profile.linkedinUrl.trim(),
          },
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );

      setProfile((prev) => ({ ...prev, status: nextStatus }));
      setSaveSuccess("Partner profile saved and updated successfully!");

      // Trigger automatic welcome email on first submission
      if (isFirstSubmission) {
        try {
          await sendPartnerNotification({
            partnerEmail: profile.email.trim(),
            partnerName: profile.name.trim(),
            category: profile.category,
            type: "welcome",
          });
        } catch (emailErr) {
          console.warn("Automated welcome email notice:", emailErr);
        }
      }
    } catch (err: unknown) {
      console.error("Save profile error:", err);
      setSaveError(err instanceof Error ? err.message : "Error saving profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setUpdatingAuth(true);
    setAuthError("");
    setAuthSuccess("");

    try {
      if (authData.currentPassword) {
        const credential = EmailAuthProvider.credential(user.email || "", authData.currentPassword);
        await reauthenticateWithCredential(user, credential);
      }

      if (authData.newEmail && authData.newEmail !== user.email) {
        await updateEmail(user, authData.newEmail);
      }

      if (authData.newPassword) {
        await updatePassword(user, authData.newPassword);
      }

      setAuthSuccess("Credentials updated successfully.");
      setAuthData({ newEmail: "", currentPassword: "", newPassword: "" });
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error && err.message.includes("requires-recent-login")) {
        setAuthError("This action requires a recent login. Please re-enter your current password above or re-login.");
      } else {
        setAuthError(err instanceof Error ? err.message : "Error updating authentication details.");
      }
    } finally {
      setUpdatingAuth(false);
    }
  };

  const handleLinkProvider = async (providerName: 'google' | 'github' | 'apple') => {
    if (!user) return;
    setAuthError("");
    setAuthSuccess("");
    try {
      let provider;
      if (providerName === 'google') {
        provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
      } else if (providerName === 'github') {
        provider = new GithubAuthProvider();
      } else {
        provider = new OAuthProvider('apple.com');
      }

      await linkWithPopup(user, provider);
      setAuthSuccess(`Successfully linked ${providerName} account!`);
      setUser({ ...getFirebaseAuth().currentUser } as User);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to link ${providerName}`;
      setAuthError(msg);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your partner account? This removes all profile and recruitment records and cannot be undone."
    );
    if (!confirmDelete) return;

    try {
      if (user.providerData.some((p) => p.providerId === "password")) {
        const password = window.prompt("Please enter your current password to confirm deletion:");
        if (password) {
          const credential = EmailAuthProvider.credential(user.email || "", password);
          await reauthenticateWithCredential(user, credential);
        } else {
          setAuthError("Password required to delete account.");
          return;
        }
      }

      const docRef = doc(getFirebaseDb(), "users", user.uid);
      await deleteDoc(docRef);
      await deleteUser(user);
      router.push("/");
    } catch (err: unknown) {
      console.error("Error deleting account:", err);
      setAuthError("Failed to delete account. You may need to log out and log back in to perform this action.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(getFirebaseAuth());
      router.push("/career");
    } catch (err) {
      console.error("Sign out error", err);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentStatusInfo = PARTNER_STATUS_LABELS[profile.status] || PARTNER_STATUS_LABELS.draft;
  const isAdmin = Boolean(user?.email && resolveAdminRole(user.email));

  return (
    <div className="min-h-screen relative overflow-x-hidden pt-24 pb-16 px-4">
      <div className="container relative z-10 mx-auto max-w-4xl">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <Link href="/career" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} className="mr-1.5" /> Back to Career Hub
          </Link>
          <Button variant="outline" onClick={handleLogout} className="gap-2 border-white/10 hover:bg-destructive/10 hover:text-destructive">
            <LogOut size={16} /> Logout
          </Button>
        </div>

        {/* Administrator Account Advisory */}
        {isAdmin && (
          <div className="mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  You are signed in with an Administrator account ({user?.email})
                </p>
                <p className="text-xs text-muted-foreground">
                  Administrator accounts manage candidate recruitment and review dossiers in the Admin Console.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/admin">
                <Button size="sm" className="btn-electric rounded-xl text-xs gap-1.5 h-9">
                  <Shield size={13} /> Open Admin Console
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-white/10 hover:bg-destructive/10 hover:text-destructive rounded-xl text-xs gap-1.5 h-9"
              >
                <LogOut size={13} /> Sign Out
              </Button>
            </div>
          </div>
        )}

        {/* Welcome Onboarding Alert */}
        {isNewWelcome && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/30 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-primary shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground text-sm">Account Created! Complete Your Partner Profile</h3>
              <p className="text-xs text-muted-foreground">
                Select your category and capabilities below to enter the Neubofy recruitment orchestration pipeline.
              </p>
            </div>
          </div>
        )}

        {/* Profile Card Header with Live Avatar & Status */}
        <div className="glass-card card-3d p-6 md:p-8 rounded-3xl border border-white/10 mb-8 backdrop-blur-2xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30 bg-black/40 flex items-center justify-center shrink-0">
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.name || "Partner"}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // Fallback if broken image URL
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <UserIcon className="w-10 h-10 text-primary/60" />
              )}
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-1.5">
                <h1 className="text-2xl md:text-3xl font-bold">{profile.name || user.email?.split("@")[0] || "Partner"}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${currentStatusInfo.bg} ${currentStatusInfo.color} flex items-center gap-1.5`}>
                  <Shield className="w-3.5 h-3.5" /> {currentStatusInfo.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{profile.category || "Specialist Role Not Assigned Yet"}</p>
              <p className="text-xs text-muted-foreground/70 mt-1">{user.email}</p>
            </div>
          </div>

          {/* Tab navigation */}
          <div className="flex gap-2 mt-8 pt-6 border-t border-white/10">
            <button
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === "profile"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}
            >
              <Layers size={16} /> Partner Capabilities & Profile
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                activeTab === "security"
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
              }`}
            >
              <Lock size={16} /> Account Security & Settings
            </button>
          </div>
        </div>

        {/* TAB 1: PARTNER PROFILE & CAPABILITIES */}
        {activeTab === "profile" && (
          <div className="glass-card card-3d p-6 md:p-8 rounded-3xl border border-white/10 backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold">Partner Recruitment Dossier</h2>
                <p className="text-sm text-muted-foreground">
                  Fields marked with <span className="text-primary font-bold">*</span> are required for client matching and orchestration.
                </p>
              </div>
            </div>

            {saveSuccess && (
              <div className="mb-6 p-4 bg-emerald-500/10 text-emerald-400 text-sm rounded-xl border border-emerald-500/30 flex items-center gap-2">
                <CheckCircle2 size={18} /> {saveSuccess}
              </div>
            )}

            {saveError && (
              <div className="mb-6 p-4 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/30 flex items-center gap-2">
                <AlertTriangle size={18} /> {saveError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-6">
              
              {/* Core Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">
                    Full Name <span className="text-primary">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    placeholder="e.g. Alex Mercer"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">
                    Profile Photo URL <span className="text-xs text-muted-foreground/60">(Optional public image URL)</span>
                  </label>
                  <input
                    type="url"
                    name="photoURL"
                    value={profile.photoURL}
                    onChange={handleProfileChange}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">
                    Contact Email <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                    <input
                      required
                      type="email"
                      name="email"
                      value={profile.email}
                      onChange={handleProfileChange}
                      placeholder="you@domain.com"
                      className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">
                    Mobile / WhatsApp Number <span className="text-primary">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                    <input
                      required
                      type="tel"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      placeholder="+91 9876543210 / +1..."
                      className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Category (Business Model Aligned) */}
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">
                  Partner Category <span className="text-primary">*</span>
                </label>
                <select
                  required
                  name="category"
                  value={profile.category}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-foreground"
                >
                  <option value="">Select your primary specialty</option>
                  {PARTNER_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Neubofy matches requirements based on your specific primary engineering category.
                </p>
              </div>

              {/* Capabilities & What they can build/ship */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-muted-foreground">
                    Capabilities & What You Can Ship <span className="text-primary">*</span>
                  </label>
                  <span className="text-xs text-primary font-medium">{profile.capabilities.length} selected</span>
                </div>

                {/* Predefined standard capabilities */}
                <div className="flex flex-wrap gap-2 mb-3">
                  {STANDARD_CAPABILITIES.map((cap) => {
                    const selected = profile.capabilities.includes(cap);
                    return (
                      <button
                        key={cap}
                        type="button"
                        onClick={() => toggleCapability(cap)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          selected
                            ? "bg-primary/20 text-primary border-primary shadow-sm"
                            : "bg-black/30 text-muted-foreground border-white/10 hover:border-white/25 hover:text-foreground"
                        }`}
                      >
                        {selected ? "✓ " : "+ "}
                        {cap}
                      </button>
                    );
                  })}
                </div>

                {/* Custom Capability Creator */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customCapability}
                    onChange={(e) => setCustomCapability(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomCapability();
                      }
                    }}
                    placeholder="Create custom capability (e.g. Smart Contract Auditing, Supabase Architecture...)"
                    className="flex-1 px-4 py-2.5 text-sm bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCustomCapability}
                    className="border-white/10 hover:bg-white/10 gap-1.5"
                  >
                    <Plus size={16} /> Add
                  </Button>
                </div>

                {/* Show custom tags if any */}
                {profile.capabilities.some((c) => !STANDARD_CAPABILITIES.includes(c as any)) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="text-xs text-muted-foreground w-full">Custom Capabilities:</span>
                    {profile.capabilities
                      .filter((c) => !STANDARD_CAPABILITIES.includes(c as any))
                      .map((custom) => (
                        <span
                          key={custom}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs bg-secondary/15 text-secondary border border-secondary/30"
                        >
                          {custom}
                          <button
                            type="button"
                            onClick={() => removeCapability(custom)}
                            className="hover:text-destructive transition-colors"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium mb-1 text-muted-foreground">
                  Short Professional Bio & Approach <span className="text-primary">*</span>
                </label>
                <textarea
                  required
                  name="bio"
                  rows={4}
                  value={profile.bio}
                  onChange={handleProfileChange}
                  placeholder="Describe your technical background, major systems you've built, and how you approach requirements..."
                  className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-foreground text-sm"
                />
              </div>

              {/* Portfolio, CV & Social Links */}
              <div className="border-t border-white/10 pt-6 space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText size={18} className="text-primary" /> Portfolio, CV & Profiles
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">
                      CV / Resume Public URL <span className="text-xs text-muted-foreground/60">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      name="cvUrl"
                      value={profile.cvUrl}
                      onChange={handleProfileChange}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                    />
                    <p className="text-xs text-muted-foreground/70 mt-1 flex items-center gap-1">
                      <HelpCircle size={12} /> Make sure link is public or shared with <code className="text-primary">partners@neubofy.in</code>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground">
                      Portfolio Link / Personal Site <span className="text-xs text-muted-foreground/60">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      name="portfolioUrl"
                      value={profile.portfolioUrl}
                      onChange={handleProfileChange}
                      placeholder="https://yourportfolio.dev"
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground flex items-center gap-1.5">
                      <Github size={14} /> GitHub Profile URL <span className="text-xs text-muted-foreground/60">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      name="githubUrl"
                      value={profile.githubUrl}
                      onChange={handleProfileChange}
                      placeholder="https://github.com/username"
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1 text-muted-foreground flex items-center gap-1.5">
                      <Linkedin size={14} /> LinkedIn Profile URL <span className="text-xs text-muted-foreground/60">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      name="linkedinUrl"
                      value={profile.linkedinUrl}
                      onChange={handleProfileChange}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Submit / Save Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full h-12 btn-electric rounded-xl font-medium gap-2"
                >
                  <Save size={18} /> {saving ? "Saving Profile..." : "Save & Update Partner Profile"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: ACCOUNT SECURITY & SETTINGS */}
        {activeTab === "security" && (
          <div className="space-y-6">
            
            {/* Credentials Card */}
            <div className="glass-card card-3d p-6 md:p-8 rounded-3xl border border-white/10 backdrop-blur-2xl">
              <h2 className="text-2xl font-bold mb-2">Account Management & Security</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Update your email address, change password, or manage linked authentication providers.
              </p>

              {authError && (
                <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-xl border border-destructive/30">
                  {authError}
                </div>
              )}

              {authSuccess && (
                <div className="mb-4 p-3 bg-emerald-500/10 text-emerald-400 text-sm rounded-xl border border-emerald-500/30">
                  {authSuccess}
                </div>
              )}

              <form onSubmit={handleUpdateAuth} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">New Email Address</label>
                  <input
                    type="email"
                    name="newEmail"
                    placeholder={user.email || "Enter new email..."}
                    value={authData.newEmail}
                    onChange={(e) => setAuthData({ ...authData, newEmail: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    placeholder="Leave blank to keep current password"
                    value={authData.newPassword}
                    onChange={(e) => setAuthData({ ...authData, newPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                  />
                </div>

                <div className="pt-2">
                  <label className="block text-sm font-medium mb-1 text-muted-foreground">
                    Current Password <span className="text-xs text-muted-foreground/60">(Required to apply changes)</span>
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    placeholder="Enter current password to confirm"
                    value={authData.currentPassword}
                    onChange={(e) => setAuthData({ ...authData, currentPassword: e.target.value })}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary focus:outline-none text-sm"
                  />
                </div>

                <Button type="submit" disabled={updatingAuth} variant="outline" className="w-full rounded-xl border-white/10 hover:bg-white/10 mt-2">
                  {updatingAuth ? "Updating..." : "Update Credentials"}
                </Button>
              </form>

              {/* Linked Accounts */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <h3 className="text-base font-semibold mb-2">Linked Social Accounts</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Connect additional providers to sign in with single click.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleLinkProvider('google')}
                    disabled={user?.providerData.some((p) => p.providerId === "google.com")}
                    className="border-white/10 hover:bg-white/10 rounded-xl text-xs gap-2"
                  >
                    {user?.providerData.some((p) => p.providerId === "google.com") ? "Google Linked ✓" : "Link Google"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleLinkProvider('github')}
                    disabled={user?.providerData.some((p) => p.providerId === "github.com")}
                    className="border-white/10 hover:bg-white/10 rounded-xl text-xs gap-2"
                  >
                    {user?.providerData.some((p) => p.providerId === "github.com") ? "GitHub Linked ✓" : "Link GitHub"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleLinkProvider('apple')}
                    disabled={user?.providerData.some((p) => p.providerId === "apple.com")}
                    className="border-white/10 hover:bg-white/10 rounded-xl text-xs gap-2"
                  >
                    {user?.providerData.some((p) => p.providerId === "apple.com") ? "Apple Linked ✓" : "Link Apple"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="glass-card card-3d p-6 md:p-8 rounded-3xl border border-destructive/20 backdrop-blur-2xl">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <AlertTriangle size={20} />
                <h3 className="text-lg font-bold">Danger Zone</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Deleting your account will permanently delete all partner profiles, capability associations, and recruitment records.
              </p>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                className="rounded-xl font-medium"
              >
                Delete Partner Account
              </Button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function PartnerProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <PartnerProfileContent />
    </Suspense>
  );
}
