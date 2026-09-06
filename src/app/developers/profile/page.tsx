"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { LogOut, Plus, Trash2, Save } from "lucide-react";
import { signOut, User } from "firebase/auth";

interface Project {
  title: string;
  description: string;
  link: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    bio: "",
    portfolioUrl: "",
    projects: [] as Project[],
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
    if (!loading && !user) {
      router.push("/developers/login");
    } else if (user) {
      const fetchProfile = async () => {
        const docRef = doc(getFirebaseDb(), "developers", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            name: data.name || "",
            bio: data.bio || "",
            portfolioUrl: data.portfolioUrl || "",
            projects: data.projects || [],
          });
        }
      };
      fetchProfile();
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleProjectChange = (index: number, field: keyof Project, value: string) => {
    const newProjects = [...profileData.projects];
    newProjects[index][field] = value;
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const docRef = doc(getFirebaseDb(), "developers", user.uid);
      await updateDoc(docRef, {
        name: profileData.name,
        bio: profileData.bio,
        portfolioUrl: profileData.portfolioUrl,
        projects: profileData.projects,
      });
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
    <div className="min-h-screen bg-background relative overflow-hidden pt-24 pb-16 px-4">
       <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] mix-blend-screen animate-blob" />
      </div>

      <div className="container relative z-10 mx-auto max-w-3xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Manage Profile</h1>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut size={16} /> Logout
          </Button>
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

            {/* Projects */}
            <div className="space-y-4 pt-6">
              <div className="flex justify-between items-center border-b border-border pb-2">
                <h2 className="text-xl font-semibold">Featured Projects</h2>
                <Button type="button" variant="secondary" size="sm" onClick={addProject} className="gap-1">
                  <Plus size={14} /> Add Project
                </Button>
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
      </div>
    </div>
  );
}
