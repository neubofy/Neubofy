"use client";

import React, { useEffect, useState } from "react";
import { getFirebaseDb } from "@/lib/firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { PartnerProfile, PartnerStatus } from "@/lib/partner/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Clock, 
  ShieldCheck, 
  Layers, 
  Sparkles, 
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Award
} from "lucide-react";

export default function AnalyticsDashboardPage() {
  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;
    try {
      const usersRef = collection(getFirebaseDb(), "users");
      unsubscribe = onSnapshot(usersRef, (snapshot) => {
        const list: PartnerProfile[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.email || data.name) {
            list.push({
              uid: docSnap.id,
              name: data.name || "Unnamed Specialist",
              email: data.contacts?.email || data.email || "",
              phone: data.contacts?.whatsapp || data.phone || "",
              photoURL: data.photoURL || "",
              category: data.category || "Unassigned",
              capabilities: Array.isArray(data.capabilities) ? data.capabilities : [],
              bio: data.bio || "",
              portfolioUrl: data.portfolioUrl || "",
              cvUrl: data.cvUrl || "",
              githubUrl: data.githubUrl || "",
              linkedinUrl: data.contacts?.socialUrl || data.linkedinUrl || "",
              status: (data.status as PartnerStatus) || "draft",
              rating: data.rating || 0,
              internalNotes: Array.isArray(data.internalNotes) ? data.internalNotes : [],
              verified: data.verified || data.status === "onboarded",
              createdAt: data.createdAt || new Date().toISOString(),
              updatedAt: data.updatedAt || new Date().toISOString(),
            });
          }
        });
        setPartners(list);
        setLoading(false);
      }, (err) => {
        console.error("Analytics listener error:", err);
        setLoading(false);
      });
    } catch (e) {
      console.error("Error setting up analytics:", e);
      setLoading(false);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const total = partners.length;
  const applied = partners.filter((p) => p.status === "applied" || p.status === "draft").length;
  const screening = partners.filter((p) => p.status === "screening").length;
  const shortlisted = partners.filter((p) => p.status === "shortlisted" || p.status === "interview").length;
  const onboarded = partners.filter((p) => p.status === "onboarded").length;
  const archived = partners.filter((p) => p.status === "archived").length;
  const acceptanceRate = total > 0 ? Math.round((onboarded / total) * 100) : 0;
  const topRated = partners.filter((p) => (p.rating || 0) >= 4).length;

  // Domain breakdown
  const categoryCounts: Record<string, number> = {};
  partners.forEach((p) => {
    const cat = p.category || "Unassigned";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  // Top capabilities breakdown
  const capabilityCounts: Record<string, number> = {};
  partners.forEach((p) => {
    if (Array.isArray(p.capabilities)) {
      p.capabilities.forEach((cap) => {
        capabilityCounts[cap] = (capabilityCounts[cap] || 0) + 1;
      });
    }
  });
  const sortedCapabilities = Object.entries(capabilityCounts).sort((a, b) => b[1] - a[1]).slice(0, 12);

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Admin
            </Link>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs text-primary font-semibold">Analytics</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 size={24} className="text-primary" /> ATS Talent Intelligence & Analytics
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time conversion velocity, talent concentration, and quality standards for Neubofy recruitment.
          </p>
        </div>

        <Link href="/admin/applicants">
          <Button size="sm" className="btn-electric rounded-xl text-xs gap-1.5 h-9">
            <Users size={14} /> Review Pipeline ({total})
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="glass-card p-12 rounded-2xl border border-white/10 text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
          <RefreshCw className="animate-spin w-4 h-4 text-primary" /> Aggregating recruitment metrics...
        </div>
      ) : (
        <>
          {/* Top Macro Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-6 rounded-2xl border border-primary/20 bg-[#0c0e15]/90 space-y-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <TrendingUp size={14} className="text-primary" /> Funnel Acceptance Rate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">{acceptanceRate}%</span>
                <span className="text-xs text-muted-foreground">conversion</span>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1">
                {onboarded} accepted specialists from {total} registered candidates.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-indigo-500/20 bg-[#0c0e15]/90 space-y-2">
              <span className="text-xs uppercase tracking-wider text-indigo-400 font-semibold flex items-center gap-1.5">
                <Clock size={14} /> Active Triage Queue
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-indigo-400">{screening + shortlisted}</span>
                <span className="text-xs text-muted-foreground">in review</span>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1">
                {screening} in screening, {shortlisted} in technical interviews.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-emerald-500/20 bg-[#0c0e15]/90 space-y-2">
              <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                <Award size={14} /> High-Rating Specialists
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-emerald-400">{topRated}</span>
                <span className="text-xs text-muted-foreground">4-5 star rating</span>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1">
                Evaluated against Neubofy technical orchestration benchmarks.
              </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-zinc-700/40 bg-[#0c0e15]/90 space-y-2">
              <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-1.5">
                <Users size={14} /> Total Talent Pool
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">{total}</span>
                <span className="text-xs text-muted-foreground">applicants</span>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1">
                {archived} declined or archived applications.
              </p>
            </div>
          </div>

          {/* Recruitment Funnel Visualizer */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0c0e15]/90 space-y-5">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <TrendingUp size={16} className="text-primary" /> Recruitment Conversion Funnel
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Candidate progression through evaluation stages.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
              {[
                { stage: "Applied / New", count: applied, color: "bg-blue-500", text: "text-blue-400" },
                { stage: "Screening", count: screening, color: "bg-indigo-500", text: "text-indigo-400" },
                { stage: "Interview", count: shortlisted, color: "bg-purple-500", text: "text-purple-400" },
                { stage: "Accepted Specialists", count: onboarded, color: "bg-emerald-500", text: "text-emerald-400" },
              ].map((step, idx) => {
                const pct = total > 0 ? Math.round((step.count / total) * 100) : 0;
                return (
                  <div key={idx} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                    <span className={`text-[11px] font-semibold uppercase tracking-wider block ${step.text}`}>
                      {step.stage}
                    </span>
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl font-bold text-foreground">{step.count}</span>
                      <span className="text-xs text-muted-foreground">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/60 rounded-full overflow-hidden">
                      <div className={`h-full ${step.color} rounded-full`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Two Columns: Category Breakdown & Top Capabilities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Domain Distribution */}
            <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c0e15]/90 space-y-4">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Layers size={16} className="text-primary" /> Specialist Category Distribution
                </h2>
                <p className="text-xs text-muted-foreground">Concentration across primary disciplines</p>
              </div>

              <div className="space-y-3 pt-1">
                {sortedCategories.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No candidate domains recorded yet.</p>
                ) : (
                  sortedCategories.map(([category, count]) => {
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    return (
                      <div key={category} className="space-y-1 text-xs">
                        <div className="flex justify-between font-medium">
                          <span className="text-foreground">{category}</span>
                          <span className="text-muted-foreground">{count} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                          <div
                            className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* In-Demand Capabilities */}
            <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c0e15]/90 space-y-4">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-400" /> In-Demand Technical Capabilities
                </h2>
                <p className="text-xs text-muted-foreground">Frequently verified technologies in the talent pool</p>
              </div>

              {sortedCapabilities.length === 0 ? (
                <p className="text-xs text-muted-foreground">No capabilities recorded yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2 pt-2">
                  {sortedCapabilities.map(([cap, count]) => (
                    <div
                      key={cap}
                      className="px-3 py-1.5 rounded-xl text-xs bg-black/40 border border-white/10 flex items-center gap-2"
                    >
                      <span className="text-foreground font-medium">{cap}</span>
                      <span className="px-1.5 py-0.2 rounded bg-primary/10 text-primary font-mono text-[10px]">
                        {count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </>
      )}

    </div>
  );
}
