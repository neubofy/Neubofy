"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, User, ExternalLink, Code2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { collection, onSnapshot, query, where, limit, orderBy } from "firebase/firestore";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/firebase";
import { User as FirebaseUser } from "firebase/auth";

interface DeveloperProfile {
  id: string;
  name: string;
  photoURL?: string;
  bio: string;
  portfolioUrl?: string;
  projects?: { title: string; link?: string; description?: string; stars?: number }[];
}

export default function DevelopersPage() {
  const [developers, setDevelopers] = useState<DeveloperProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);

  useEffect(() => {
    // Only subscribe on client side
    if (typeof window !== "undefined") {
      try {
        const authObj = getFirebaseAuth();
        const unsubscribe = authObj.onAuthStateChanged((user) => {
          if (currentUser !== user) {
            setCurrentUser(user);
          }
        });
        return () => unsubscribe();
      } catch (e) {
        // App might not be initialized immediately
      }
    }
  }, [currentUser]);

  useEffect(() => {
    let unsubscribe: () => void;

    // Defer setup slightly to ensure Firebase is initialized if we reached here fast
    const timer = setTimeout(() => {
      try {
        const q = query(
          collection(getFirebaseDb(), "users"),
          where("verified", "==", true),
          limit(50)
        );

        unsubscribe = onSnapshot(q, (snapshot) => {
          const devsData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              name: data.name,
            photoURL: data.photoURL,
              bio: data.bio,
              portfolioUrl: data.portfolioUrl,
              projects: data.projects,
            };
          }) as DeveloperProfile[];
          setDevelopers(devsData);
          setLoading(false);
        }, (err) => {
          console.error("Failed to load developers:", err);
          setLoading(false);
        });
      } catch (err) {
        console.error("Failed to setup listener for developers:", err);
        setLoading(false);
      }
    }, 0);

    return () => {
      clearTimeout(timer);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center pt-24 pb-16">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] mix-blend-screen animate-blob" />
        <div className="absolute top-[40%] -right-[20%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[150px] mix-blend-screen animate-blob animation-delay-2000" />
      </div>

      <div className="container relative z-10 mx-auto px-4 w-full max-w-6xl">

        {/* Top Banner Auth Actions */}
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
                  Developer Login
                </Button>
              </Link>
              <Link href="/developers/onboard">
                <Button className="btn-electric">
                  Join as Developer
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 backdrop-blur-sm text-primary mb-4 animate-fade-in-up">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-semibold tracking-wide uppercase">Top Talent Network</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight animate-fade-in-up" style={{ animationDelay: "100ms" }}>
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
              Verified Developers
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "200ms" }}>
            Connect with our curated network of exceptional software engineers. Review their projects and see what they can build for you.
          </p>
        </div>

        {/* Developers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : developers.length === 0 ? (
            <div className="col-span-full text-center py-20 glass-card rounded-xl">
              <p className="text-muted-foreground text-lg">No verified developers found yet. Be the first to join!</p>
            </div>
          ) : (
            developers.map((dev, idx) => (
              <div
                key={dev.id}
                className="glass-card p-6 rounded-2xl hover:border-primary/40 transition-all duration-300 animate-fade-in-up group flex flex-col h-full"
                style={{ animationDelay: `${300 + (idx * 100)}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                      {dev.photoURL ? (
                        <img src={dev.photoURL} alt={dev.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-primary font-bold text-xl">{dev.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">{dev.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Code2 size={14}/> Developer
                      </p>
                    </div>
                  </div>
                  {dev.portfolioUrl && (
                    <a href={dev.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors p-2 bg-background/50 rounded-full">
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>

                <p className="text-muted-foreground text-sm line-clamp-3 mb-6 flex-grow">
                  {dev.bio}
                </p>

                {dev.projects && dev.projects.length > 0 && (
                  <div className="space-y-3 mt-auto">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Featured Projects</h4>
                    {dev.projects.slice(0, 2).map((proj, pIdx) => (
                      <div key={pIdx} className="bg-background/40 p-3 rounded-lg text-sm">
                        <div className="flex justify-between items-center mb-1 gap-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <span className="font-semibold text-foreground truncate">{proj.title}</span>
                            {proj.stars !== undefined && (
                               <span className="text-[10px] bg-background/50 text-yellow-500 border border-yellow-500/20 px-1.5 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                                 <Star size={10} className="fill-yellow-500" /> {proj.stars}
                               </span>
                            )}
                          </div>
                          {proj.link && (
                            <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1 shrink-0">
                              View <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                        {proj.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1">{proj.description}</p>
                        )}
                      </div>
                    ))}
                    {dev.projects.length > 2 && (
                      <p className="text-xs text-center text-muted-foreground pt-1">+{dev.projects.length - 2} more projects</p>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
