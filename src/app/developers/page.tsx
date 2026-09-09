"use client";

import React, { useEffect, useState } from "react";
import { Shield, Lock, Terminal, Brain, Code2, User, ArrowRight, Code } from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

interface ProfileData {
  name: string;
  bio: string;
  portfolioUrl: string;
  contacts: { email: string };
  verified?: boolean;
}

export default function DevelopersPage() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const authObj = getFirebaseAuth();
        const unsubscribe = authObj.onAuthStateChanged(async (user) => {
          setCurrentUser(user);
          if (user) {
            // Check local storage first for instant loading
            const cachedProfile = localStorage.getItem(`developerProfile_${user.uid}`);
            if (cachedProfile) {
              try {
                setProfileData(JSON.parse(cachedProfile));
                setLoadingProfile(false);
              } catch (e) {
                console.error("Error parsing cached profile", e);
              }
            }

            try {
              const docRef = doc(getFirebaseDb(), "users", user.uid);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                const data = docSnap.data();
                const profileObj = {
                  name: data.name || "",
                  bio: data.bio || "",
                  portfolioUrl: data.portfolioUrl || "",
                  contacts: { email: data.contacts?.email || "" },
                  verified: data.verified
                };
                setProfileData(profileObj);
                localStorage.setItem(`developerProfile_${user.uid}`, JSON.stringify(profileObj));
              }
            } catch (err) {
              console.error("Error fetching profile", err);
            }
          } else {
            setProfileData(null);
          }
          setLoadingProfile(false);
        });
        return () => unsubscribe();
      } catch (e) {
        console.error("Firebase auth error", e);
        setLoadingProfile(false);
      }
    }
  }, []);

  return (
    <PageTransition>
      <div className="container mx-auto py-24 px-4 max-w-5xl">
        <div className="flex justify-end mb-8 animate-fade-in-up">
          {currentUser ? (
            <Link href="/developers/profile">
              <Button className="btn-electric gap-2">
                <User size={16} /> Manage Profile
              </Button>
            </Link>
          ) : (
            <div className="flex gap-4">
              <Link href="/developers/login">
                <Button variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                  Partner Login
                </Button>
              </Link>
              <Link href="/developers/onboard">
                <Button className="btn-electric">
                  Become a Partner
                </Button>
              </Link>
            </div>
          )}
        </div>

        {currentUser && profileData && !loadingProfile ? (
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-card p-10 rounded-3xl border border-primary/20 max-w-3xl mx-auto shadow-xl relative overflow-hidden"
            >
               <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-tertiary opacity-50" />
               <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                 <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                   <User className="w-12 h-12 text-primary" />
                 </div>
                 <div className="text-center md:text-left flex-1">
                   <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                     <h2 className="text-3xl font-bold">{profileData.name}</h2>
                     {profileData.verified && (
                       <span className="bg-primary/20 text-primary text-xs px-2 py-1 rounded-full border border-primary/30 flex items-center gap-1">
                         <Shield className="w-3 h-3" /> Verified
                       </span>
                     )}
                   </div>
                   <p className="text-muted-foreground mb-4">{profileData.contacts.email}</p>
                   {profileData.bio && (
                     <div className="bg-background/50 p-4 rounded-xl border border-border/50 mb-6">
                       <p className="text-sm">{profileData.bio}</p>
                     </div>
                   )}
                   <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                     {profileData.portfolioUrl && (
                        <a href={profileData.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-primary hover:underline">
                          <Code className="w-4 h-4" /> View Portfolio
                        </a>
                     )}
                     <Link href="/developers/profile" className="flex items-center gap-2 text-sm text-secondary hover:underline">
                        Edit Profile <ArrowRight className="w-4 h-4" />
                     </Link>
                   </div>
                 </div>
               </div>
            </motion.div>

            <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up">
              <a href="https://neubofy.zohorecruit.in/" target="_blank" rel="noopener noreferrer">
                <Button className="w-full sm:w-auto btn-electric">
                  Go Neubofy career site
                </Button>
              </a>
              <a href="https://zrec.in/ATf5v?source=CareerSite" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="w-full sm:w-auto border-primary/50 text-primary hover:bg-primary/10">
                  Join Neubofy Devloper Network
                </Button>
              </a>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 glass-card px-4 py-2 rounded-full mb-6">
                  <Lock className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold">Strictly Private Network</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Become a Neubofy Partner
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Work independently. Build with your expertise. Let Neubofy handle client acquisition, requirements coordination, project orchestration, and delivery accountability.
                </p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="glass-card p-8 rounded-2xl text-center"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">AI Developers</h3>
                <p className="text-muted-foreground text-sm">
                  Machine learning engineers, LLM orchestrators, and data scientists building next-gen solutions.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="glass-card p-8 rounded-2xl text-center"
              >
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-6">
                  <Shield className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Security Analysts</h3>
                <p className="text-muted-foreground text-sm">
                  Security researchers and code analysts verifying the integrity and safety of delivered software.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="glass-card p-8 rounded-2xl text-center"
              >
                <div className="w-16 h-16 rounded-full bg-tertiary/10 flex items-center justify-center mx-auto mb-6">
                  <Code2 className="w-8 h-8 text-tertiary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Software Engineers</h3>
                <p className="text-muted-foreground text-sm">
                  Frontend, backend, mobile, and full-stack developers architecting robust applications.
                </p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass-card p-10 rounded-3xl text-center max-w-3xl mx-auto border border-primary/20"
            >
              <Terminal className="w-10 h-10 text-primary mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Ready to partner?</h2>
              <p className="text-muted-foreground mb-8">
                You remain independent. You receive qualified opportunities matching your actual skills. Requirements and acceptance criteria are clearly defined, and you don't have to become the salesperson.
              </p>
              <Link
                href="/developers/onboard"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 rounded-full h-12"
              >
                Become a Partner
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </PageTransition>
  );
}
