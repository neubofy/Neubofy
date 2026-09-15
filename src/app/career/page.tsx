"use client";

import React, { useEffect, useState } from "react";
import { 
  Shield, 
  Lock, 
  Terminal, 
  Brain, 
  Code2, 
  User, 
  ArrowRight, 
  Code, 
  Cpu, 
  Workflow, 
  Smartphone, 
  CheckCircle2, 
  Sparkles 
} from "lucide-react";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getFirebaseAuth, getFirebaseDb } from "@/lib/firebase/firebase";
import { User as FirebaseUser } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { PARTNER_CATEGORIES, PARTNER_STATUS_LABELS, PartnerStatus } from "@/lib/partner/types";

interface PartnerData {
  name: string;
  category: string;
  capabilities: string[];
  bio: string;
  portfolioUrl?: string;
  status: PartnerStatus;
  verified?: boolean;
}

export default function PartnerLandingPage() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [partnerData, setPartnerData] = useState<PartnerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const authObj = getFirebaseAuth();
        const unsubscribe = authObj.onAuthStateChanged(async (user) => {
          setCurrentUser(user);
          if (user) {
            try {
              const docRef = doc(getFirebaseDb(), "users", user.uid);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                const data = docSnap.data();
                setPartnerData({
                  name: data.name || user.displayName || "Partner",
                  category: data.category || "Specialist",
                  capabilities: Array.isArray(data.capabilities) ? data.capabilities : [],
                  bio: data.bio || "",
                  portfolioUrl: data.portfolioUrl || "",
                  status: (data.status as PartnerStatus) || "draft",
                  verified: data.verified || data.status === "onboarded",
                });
              }
            } catch (err) {
              console.error("Error fetching partner profile", err);
            }
          } else {
            setPartnerData(null);
          }
          setLoading(false);
        });
        return () => unsubscribe();
      } catch (e) {
        console.error("Firebase auth error", e);
        setLoading(false);
      }
    }
  }, []);

  return (
    <PageTransition>
      <div className="container mx-auto py-24 px-4 max-w-5xl">
        
        {/* Top Action Bar */}
        <div className="flex justify-end mb-8 animate-fade-in-up">
          {currentUser ? (
            <Link href="/career/profile">
              <Button className="btn-electric gap-2 rounded-xl">
                <User size={16} /> Specialist Dashboard
              </Button>
            </Link>
          ) : (
            <div className="flex gap-3">
              <Link href="/career/login">
                <Button variant="outline" className="border-white/10 hover:bg-white/10 rounded-xl">
                  Specialist Login
                </Button>
              </Link>
              <Link href="/career/onboard">
                <Button className="btn-electric rounded-xl">
                  Join Network
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Dynamic Logged-in Partner Summary Card */}
        {currentUser && partnerData && !loading ? (
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="glass-card p-8 md:p-10 rounded-3xl border border-primary/20 max-w-3xl mx-auto shadow-2xl relative overflow-hidden backdrop-blur-2xl"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-secondary to-tertiary opacity-70" />
              
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/30">
                  <User className="w-10 h-10 text-primary" />
                </div>
                
                <div className="text-center md:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1.5">
                    <h2 className="text-2xl md:text-3xl font-bold">{partnerData.name}</h2>
                    {partnerData.verified ? (
                      <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1 font-semibold">
                        <Shield className="w-3 h-3" /> Verified Partner
                      </span>
                    ) : (
                      <span className="bg-amber-500/20 text-amber-400 text-xs px-2.5 py-1 rounded-full border border-amber-500/30 flex items-center gap-1 font-semibold">
                        {PARTNER_STATUS_LABELS[partnerData.status]?.label || "Under Review"}
                      </span>
                    )}
                  </div>

                  <p className="text-primary text-sm font-medium mb-3">{partnerData.category || "General Specialist"}</p>
                  
                  {partnerData.bio && (
                    <div className="bg-black/30 p-4 rounded-xl border border-white/10 mb-4 text-sm text-muted-foreground">
                      <p>{partnerData.bio}</p>
                    </div>
                  )}

                  {partnerData.capabilities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-6 justify-center md:justify-start">
                      {partnerData.capabilities.map((c) => (
                        <span key={c} className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground">
                          {c}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <Link href="/career/profile" className="flex items-center gap-2 text-sm text-primary hover:underline font-medium">
                      Manage Profile & Capabilities <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 glass-card px-4 py-1.5 rounded-full mb-6 border border-white/10">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Orchestrated Partner Network
                  </span>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                  Build With Your Expertise.<br />
                  <span className="text-gradient-electric">We Handle the Rest.</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  Neubofy is an external technology department for businesses. We handle sales, translate problems into concrete specifications, and orchestrate top-tier specialists to build verified software.
                </p>
              </motion.div>
            </div>

            {/* Specialist Categories We Recruit */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="glass-card p-6 md:p-8 rounded-2xl border border-white/10 text-center hover:border-primary/30 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 border border-primary/20">
                  <Brain className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold mb-2">AI & LLM Architects</h3>
                <p className="text-muted-foreground text-sm">
                  Engineers building production RAG systems, autonomous agent workflows, model fine-tuning, and intelligent automations.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="glass-card p-6 md:p-8 rounded-2xl border border-white/10 text-center hover:border-secondary/30 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-5 border border-secondary/20">
                  <Shield className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Security & Code Auditors</h3>
                <p className="text-muted-foreground text-sm">
                  Independent security researchers, code auditors, and QA specialists verifying safety, compliance, and architectural integrity.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="glass-card p-6 md:p-8 rounded-2xl border border-white/10 text-center hover:border-tertiary/30 transition-all"
              >
                <div className="w-14 h-14 rounded-2xl bg-tertiary/10 flex items-center justify-center mx-auto mb-5 border border-tertiary/20">
                  <Code2 className="w-7 h-7 text-tertiary" />
                </div>
                <h3 className="text-lg font-bold mb-2">Software & Systems Engineers</h3>
                <p className="text-muted-foreground text-sm">
                  Full-stack, backend, Android, and mobile developers shipping robust, production-grade applications and workflows.
                </p>
              </motion.div>
            </div>

            {/* What You Can Ship Through Neubofy */}
            <div className="mb-16">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Capabilities We Match With Clients</h2>
                <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                  When you onboard, you define exactly what you build best. We route pre-scoped client projects directly to your capability set.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {[
                  { icon: Smartphone, label: "Android & Mobile Apps" },
                  { icon: Code, label: "Full-Stack SaaS" },
                  { icon: Workflow, label: "Workflow & n8n Automation" },
                  { icon: Brain, label: "AI & LLM Systems" },
                  { icon: Shield, label: "Security & Code Auditing" },
                  { icon: Cpu, label: "Cloud & DevOps Pipelines" },
                  { icon: Sparkles, label: "Modern Jamstack Web" },
                  { icon: Terminal, label: "Architecture Consultation" },
                ].map((item, idx) => (
                  <div key={idx} className="glass-card p-4 rounded-xl border border-white/10 flex items-center gap-3 text-sm">
                    <item.icon className="w-5 h-5 text-primary shrink-0" />
                    <span className="font-medium text-foreground/90">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA Join Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="glass-card p-8 md:p-12 rounded-3xl text-center max-w-3xl mx-auto border border-primary/20 backdrop-blur-2xl"
            >
              <Terminal className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-3">Ready to Join the Orchestration Network?</h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto text-sm leading-relaxed">
                No lengthy job interviews or bidding wars. Sign up with one click, register your capabilities, and join a private network of vetted specialists.
              </p>
              <Link href="/career/onboard">
                <Button className="btn-electric rounded-xl px-8 h-12 text-base font-semibold">
                  Join Neubofy Network
                </Button>
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </PageTransition>
  );
}
