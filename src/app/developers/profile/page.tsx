"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/firebase";
import { doc, onSnapshot, updateDoc, deleteDoc, setDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Trash2, Save, AlertTriangle, Github, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { signOut, User, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential, deleteUser, GithubAuthProvider, linkWithPopup } from "firebase/auth";

interface Project {
  title: string;
  description: string;
  link: string;
  stars?: number;
}

interface GithubRepo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
}

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
    bio: "",
    portfolioUrl: "",
    projects: [] as Project[],
    contacts: {
      email: "",
      telegram: "",
      whatsapp: "",
      socialUrl: "",
    },
  });

  const [githubUsername, setGithubUsername] = useState("");
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [githubRepos, setGithubRepos] = useState<GithubRepo[]>([]);
  const [githubError, setGithubError] = useState("");

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
            bio: data.bio || "",
            portfolioUrl: data.portfolioUrl || "",
            projects: data.projects || [],
            contacts: {
              email: data.contacts?.email || "",
              telegram: data.contacts?.telegram || "",
              whatsapp: data.contacts?.whatsapp || "",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleProjectChange = (index: number, field: keyof Project, value: string) => {
    const newProjects = [...profileData.projects];
    newProjects[index] = { ...newProjects[index], [field]: value };
    setProfileData({ ...profileData, projects: newProjects });
  };

  const addProject = () => {
    setProfileData({
      ...profileData,
      projects: [...profileData.projects, { title: "", description: "", link: "" }],
    });
  };

  const removeProject = (index: number) => {
    const newProjects = [...profileData.projects];
    newProjects.splice(index, 1);
    setProfileData({ ...profileData, projects: newProjects });
  };

  const fetchGithubRepos = async () => {
    setIsFetchingGithub(true);
    setGithubError("");

    try {
      let token = "";
      const auth = getFirebaseAuth();

      if (!user) {
        throw new Error("Must be logged in to connect GitHub.");
      }

      const provider = new GithubAuthProvider();
      provider.addScope('repo');

      try {
        const result = await linkWithPopup(user, provider);
        const credential = GithubAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
            token = credential.accessToken;
        }
      } catch (err: any) {
        if (err.code === 'auth/credential-already-in-use') {
           const reauthResult = await linkWithPopup(auth.currentUser!, provider).catch(async () => {
               return null;
           });

           if(reauthResult) {
               const cred = GithubAuthProvider.credentialFromResult(reauthResult);
               token = cred?.accessToken || "";
           } else {
              throw new Error("Could not retrieve GitHub access token. Try logging in with GitHub directly.");
           }
        } else {
            throw err;
        }
      }

      if (!token) {
        throw new Error("Could not retrieve GitHub access token.");
      }

      const res = await fetch(`https://api.github.com/user/repos?sort=updated&per_page=10`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to fetch repos from GitHub");
      const data = await res.json();
      setGithubRepos(data);
    } catch (err: any) {
      setGithubError(err.message || "Error fetching repos. Please try again.");
    } finally {
      setIsFetchingGithub(false);
    }
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
        bio: profileData.bio,
        portfolioUrl: profileData.portfolioUrl,
        projects: profileData.projects,
        contacts: profileData.contacts,
        verified: true,
      }, { merge: true });
      alert("Profile updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(getFirebaseAuth());
    router.push("/developers");
  };

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center pt-24"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden pt-24 pb-16 px-4">
       <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] mix-blend-screen animate-blob" />
      </div>

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

        <div className="glass-card p-8 rounded-2xl mb-8">
          <h2 className="text-xl font-semibold border-b border-border pb-2 mb-4">Account Credentials</h2>
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
        </div>

        <div className="glass-card p-8 rounded-2xl">
          <form onSubmit={handleSave} className="space-y-6">

            {/* Basic Info */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b border-border pb-2">Basic Information</h2>
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
              <div>
                <label className="block text-sm font-medium mb-1">Portfolio Link (Optional)</label>
                <input
                  type="url"
                  name="portfolioUrl"
                  value={profileData.portfolioUrl}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Contacts & Socials */}
            <div className="space-y-4 pt-6">
              <h2 className="text-xl font-semibold border-b border-border pb-2">Contact & Social Links</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Contact Email</label>
                  <input
                    type="email"
                    name="email"
                    value={profileData.contacts.email}
                    onChange={handleContactChange}
                    className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telegram Handle</label>
                  <input
                    type="text"
                    name="telegram"
                    placeholder="@username"
                    value={profileData.contacts.telegram}
                    onChange={handleContactChange}
                    className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">WhatsApp Number</label>
                  <input
                    type="text"
                    name="whatsapp"
                    placeholder="+1234567890"
                    value={profileData.contacts.whatsapp}
                    onChange={handleContactChange}
                    className="w-full px-4 py-2 bg-background/50 border border-input rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Social Profile URL (Twitter/LinkedIn)</label>
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

            {/* Projects */}
            <div className="space-y-4 pt-6">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h2 className="text-xl font-semibold">Featured Projects</h2>
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={addProject} className="gap-1">
                    <Plus size={14} /> Add Manual
                  </Button>
                </div>
              </div>

              {/* GitHub Import Section */}
              <div className="bg-background/30 p-4 rounded-xl border border-border/50">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium mb-1 flex items-center gap-1">
                      <Github size={14} /> Import from GitHub
                    </label>
                    <p className="text-xs text-muted-foreground">Connect your GitHub account to import your repositories.</p>
                  </div>
                  <Button type="button" onClick={fetchGithubRepos} disabled={isFetchingGithub} className="w-full sm:w-auto gap-2">
                    {isFetchingGithub ? <Loader2 size={16} className="animate-spin" /> : <><Github size={16}/> Connect GitHub</>}
                  </Button>
                </div>

                {githubError && (
                   <p className="text-destructive text-sm mt-2">{githubError}</p>
                )}

                {githubRepos.length > 0 && (
                  <div className="mt-4 max-h-48 overflow-y-auto pr-2 space-y-2">
                    <p className="text-xs text-muted-foreground mb-2">Select repositories to add as projects:</p>
                    {githubRepos.map(repo => (
                      <div key={repo.id} className="flex items-center justify-between p-2 bg-background/50 rounded border border-border/50 hover:border-primary/30 transition-colors">
                         <div className="flex-1 min-w-0 pr-4">
                           <p className="text-sm font-medium truncate">{repo.name}</p>
                           {repo.description && <p className="text-xs text-muted-foreground truncate">{repo.description}</p>}
                         </div>
                         <Button
                           type="button"
                           size="sm"
                           variant="outline"
                           className="shrink-0"
                           onClick={() => {
                             setProfileData(prev => ({
                               ...prev,
                               projects: [...prev.projects, { title: repo.name, description: repo.description || "", link: repo.html_url, stars: repo.stargazers_count }]
                             }));
                             setGithubRepos(prev => prev.filter(r => r.id !== repo.id)); // Remove from list once added
                           }}
                         >
                           Add
                         </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {profileData.projects.map((proj, idx) => (
                <div key={idx} className="bg-background/40 p-4 rounded-xl border border-border relative group">
                  <button
                    type="button"
                    onClick={() => removeProject(idx)}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>

                  <div className="grid gap-4 pr-8">
                    <div>
                      <label className="block text-xs font-medium mb-1">Project Title</label>
                      <input
                        required
                        type="text"
                        value={proj.title}
                        onChange={(e) => handleProjectChange(idx, "title", e.target.value)}
                        className="w-full px-3 py-1.5 bg-background border border-input rounded focus:ring-1 focus:ring-primary focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Description</label>
                      <input
                        type="text"
                        value={proj.description}
                        onChange={(e) => handleProjectChange(idx, "description", e.target.value)}
                        className="w-full px-3 py-1.5 bg-background border border-input rounded focus:ring-1 focus:ring-primary focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Link (URL)</label>
                      <input
                        type="url"
                        value={proj.link}
                        onChange={(e) => handleProjectChange(idx, "link", e.target.value)}
                        className="w-full px-3 py-1.5 bg-background border border-input rounded focus:ring-1 focus:ring-primary focus:outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}

              {profileData.projects.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-4">No projects added yet.</p>
              )}
            </div>

            <div className="pt-6">
              <Button type="submit" disabled={saving} className="w-full btn-electric gap-2">
                <Save size={18} /> {saving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </div>

        <div className="glass-card p-8 rounded-2xl border-destructive/20 mt-8 mb-8">
          <div className="flex items-center gap-2 text-destructive mb-4">
            <AlertTriangle size={20} />
            <h2 className="text-xl font-semibold">Danger Zone</h2>
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
