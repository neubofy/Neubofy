"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/firebase";
import { doc, onSnapshot, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Trash2, Save, AlertTriangle, Github, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { signOut, User, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser, GithubAuthProvider, linkWithPopup, GoogleAuthProvider, OAuthProvider } from "firebase/auth";


export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingAuth, setUpdatingAuth] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authData, setAuthData] = useState({
    newEmail: "",
    currentPassword: "",
    newPassword: "",
  });

  const [profileData, setProfileData] = useState({
    name: "",
    category: "",
    bio: "",
    portfolioUrl: "",
    contacts: {
      email: "",
      secondaryEmail: "",
      socialUrl: "",
    },
  });

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
        // Ignored. Wait for initialization.
      }
    }
    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
    }
  }, []);

  useEffect(() => {
    let unsubscribe: () => void;
    if (!loading && !user) {
      router.push("/developers/login");
    } else if (user) {
      const docRef = doc(getFirebaseDb(), "users", user.uid);
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            name: data.name || "",
            category: data.category || "",
            bio: data.bio || "",
            portfolioUrl: data.portfolioUrl || "",
            contacts: {
              email: data.contacts?.email || "",
              secondaryEmail: data.contacts?.secondaryEmail || "",
              socialUrl: data.contacts?.socialUrl || "",
            }
          });
        }
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      contacts: {
        ...profileData.contacts,
        [e.target.name]: e.target.value,
      },
    });
  };


  const handleAuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthData({ ...authData, [e.target.name]: e.target.value });
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmDelete) return;

    try {
      // Prompt for password if they have an email/password account (requires recent login)
      if (user.providerData.some(p => p.providerId === 'password')) {
        const password = window.prompt("Please enter your current password to confirm deletion:");
        if (password) {
          const credential = EmailAuthProvider.credential(user.email || "", password);
          await reauthenticateWithCredential(user, credential);
        } else {
          setAuthError("Password required to delete account.");
          return;
        }
      }

      // Delete firestore doc first
      const docRef = doc(getFirebaseDb(), "users", user.uid);
      await deleteDoc(docRef);

      // Delete local storage profile cache
      localStorage.removeItem(`developerProfile_${user.uid}`);

      // Delete auth user
      await deleteUser(user);
      router.push("/");
    } catch (err: unknown) {
      console.error("Error deleting account:", err);
      if (err instanceof Error && err.message.includes("requires-recent-login")) {
         setAuthError("Deleting your account requires a recent login. Please log out and log back in, then try again.");
      } else {
         setAuthError("Failed to delete account. Please try again.");
      }
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
        // Re-authenticate user before sensitive operations if they provided a password
        const credential = EmailAuthProvider.credential(user.email || "", authData.currentPassword);
        await reauthenticateWithCredential(user, credential);
      }

      if (authData.newEmail && authData.newEmail !== user.email) {
        await updateEmail(user, authData.newEmail);
      }

      if (authData.newPassword) {
        await updatePassword(user, authData.newPassword);
      }

      setAuthSuccess("Authentication details updated successfully.");
      setAuthData({ newEmail: "", currentPassword: "", newPassword: "" });
    } catch (err: unknown) {
      console.error(err);
      if (err instanceof Error && err.message.includes("requires-recent-login")) {
         setAuthError("This action requires a recent login. Please provide your current password above or log out and log back in.");
      } else {
         setAuthError(err instanceof Error ? err.message : "Error updating authentication details.");
      }
    } finally {
      setUpdatingAuth(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const docRef = doc(getFirebaseDb(), "users", user.uid);
      await setDoc(docRef, {
        name: profileData.name,
        category: profileData.category,
        bio: profileData.bio,
        portfolioUrl: profileData.portfolioUrl,
        contacts: profileData.contacts,
      }, { merge: true });

      const profileObj = {
        name: profileData.name,
        category: profileData.category,
        bio: profileData.bio,
        portfolioUrl: profileData.portfolioUrl,
        contacts: { email: profileData.contacts.email },
      };
      localStorage.setItem(`developerProfile_${user.uid}`, JSON.stringify(profileObj));

      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(getFirebaseAuth());
      setUser(null);
      router.push("/developers");
    } catch (error) {
      console.error("Error signing out: ", error);
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
      // Force refresh user object
      setUser({ ...getFirebaseAuth().currentUser } as User);
    } catch (err: any) {
      if (err.code === 'auth/credential-already-in-use') {
        setAuthError(`This ${providerName} account is already linked to another profile.`);
      } else if (err.code === 'auth/provider-already-linked') {
        setAuthError(`You have already linked a ${providerName} account.`);
      } else {
        setAuthError(err.message || `Failed to link ${providerName} account.`);
      }
    }
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center pt-24"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="min-h-screen relative overflow-x-hidden pt-24 pb-16 px-4">
      <div className="container relative z-10 mx-auto max-w-3xl">
        <div className="mb-4">
          <Link href="/developers" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to Developers
          </Link>
        </div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Profile</h1>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut size={16} /> Logout
          </Button>
        </div>

        <div className="glass-card card-3d p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-lg border border-primary/10 mb-8 backdrop-blur-xl bg-background/40 card-3d">
          <h2 className="text-2xl font-bold tracking-tight border-b border-border/50 pb-3 mb-4 text-foreground/90">Account Credentials</h2>
          {authError && (
            <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg">
              {authError}
            </div>
          )}
          {authSuccess && (
            <div className="mb-4 p-3 bg-primary/10 text-primary text-sm rounded-lg">
              {authSuccess}
            </div>
          )}
          <form onSubmit={handleUpdateAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">New Email</label>
              <input
                type="email"
                name="newEmail"
                placeholder={user.email || "New email..."}
                value={authData.newEmail}
                onChange={handleAuthChange}
                className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input
                type="password"
                name="newPassword"
                placeholder="Leave blank to keep current"
                value={authData.newPassword}
                onChange={handleAuthChange}
                className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div className="pt-2 border-t border-border mt-4">
              <label className="block text-sm font-medium mb-1 text-muted-foreground">Current Password (Required for changes)</label>
              <input
                type="password"
                name="currentPassword"
                placeholder="Enter current password to confirm changes"
                value={authData.currentPassword}
                onChange={handleAuthChange}
                className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <Button type="submit" disabled={updatingAuth} variant="outline" className="w-full">
              {updatingAuth ? "Updating..." : "Update Credentials"}
            </Button>
          </form>

          {/* Social Provider Linking */}
          <div className="mt-8 pt-6 border-t border-border/50">
            <h3 className="text-lg font-medium mb-3">Linked Accounts</h3>
            <p className="text-sm text-muted-foreground mb-4">Link additional providers to sign in with any of them.</p>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => handleLinkProvider('google')}
                disabled={user?.providerData.some(p => p.providerId === 'google.com')}
                className="gap-2"
              >
                {user?.providerData.some(p => p.providerId === 'google.com') ? "Google Linked ✓" : "Link Google"}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleLinkProvider('github')}
                disabled={user?.providerData.some(p => p.providerId === 'github.com')}
                className="gap-2"
              >
                {user?.providerData.some(p => p.providerId === 'github.com') ? "GitHub Linked ✓" : "Link GitHub"}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleLinkProvider('apple')}
                disabled={user?.providerData.some(p => p.providerId === 'apple.com')}
                className="gap-2"
              >
                {user?.providerData.some(p => p.providerId === 'apple.com') ? "Apple Linked ✓" : "Link Apple"}
              </Button>
            </div>
          </div>
        </div>

        <div className="glass-card card-3d p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-lg border border-primary/10 mb-8 backdrop-blur-xl bg-background/40 card-3d">
          <form onSubmit={handleSave} className="space-y-6">

            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight border-b border-border/50 pb-3 mb-4 text-foreground/90">Basic Information</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  required
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  name="category"
                  value={profileData.category}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none text-foreground"
                >
                  <option value="">Select Category</option>
                  <option value="AI Architect">AI Architect</option>
                  <option value="Security Analyst">Security Analyst</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Data Scientist">Data Scientist</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="DevOps & Cloud">DevOps & Cloud</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <textarea
                  required
                  name="bio"
                  value={profileData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Contacts & Socials */}
            <div className="space-y-4 pt-6">
              <h2 className="text-2xl font-bold tracking-tight border-b border-border/50 pb-3 mb-4 text-foreground/90">Contact & Links</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Primary Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.contacts.email}
                    onChange={handleContactChange}
                    className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-1">To change, update in Account Credentials.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Secondary Contact Email (Optional)</label>
                  <input
                    type="email"
                    name="secondaryEmail"
                    placeholder="example@gmail.com"
                    value={profileData.contacts.secondaryEmail}
                    onChange={handleContactChange}
                    className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Portfolio Link</label>
                  <input
                    type="url"
                    name="portfolioUrl"
                    value={profileData.portfolioUrl}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Social Profile URL (GitHub/LinkedIn/Twitter)</label>
                  <input
                    type="url"
                    name="socialUrl"
                    value={profileData.contacts.socialUrl}
                    onChange={handleContactChange}
                    className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6">
              <Button type="submit" disabled={saving} className="w-full btn-electric gap-2">
                <Save size={18} /> {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </div>

        <div className="glass-card card-3d p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-lg border border-destructive/30 mt-8 mb-8 backdrop-blur-xl bg-background/40 card-3d">
          <div className="flex items-center gap-2 text-destructive mb-4 border-b border-destructive/20 pb-3">
            <AlertTriangle size={24} />
            <h2 className="text-2xl font-bold tracking-tight">Danger Zone</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="destructive" onClick={handleDeleteAccount}>
            Delete Account
          </Button>
        </div>

      </div>
    </div>
  );
}
