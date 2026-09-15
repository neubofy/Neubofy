"use client";

import React, { useEffect, useState } from "react";
import { getFirebaseDb } from "@/lib/firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { PartnerProfile, PartnerStatus, PARTNER_STATUS_LABELS } from "@/lib/partner/types";
import { useAdmin } from "@/lib/admin/AdminContext";
import { getApplicantId, getNeubofianId, AuditLogEntry } from "@/lib/admin/team";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Users, 
  UserCheck, 
  Clock, 
  ShieldCheck, 
  TrendingUp, 
  ArrowRight, 
  User, 
  ExternalLink, 
  Activity, 
  BarChart3, 
  RefreshCw,
  Shield,
  Layers,
  Sparkles
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user: currentUser, role, isSuperAdmin } = useAdmin();

  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load applicants and audit logs
  useEffect(() => {
    let unsubPartners: () => void;
    let unsubLogs: () => void;

    try {
      const usersRef = collection(getFirebaseDb(), "users");
      unsubPartners = onSnapshot(usersRef, (snapshot) => {
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
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPartners(list);
        setLoading(false);
      }, (err) => {
        console.error("Error loading candidates:", err);
        setLoading(false);
      });

      const logsRef = collection(getFirebaseDb(), "audit_logs");
      unsubLogs = onSnapshot(logsRef, (snapshot) => {
        const logs: AuditLogEntry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          logs.push({
            id: docSnap.id,
            actorEmail: data.actorEmail || "Administrator",
            actorUid: data.actorUid || "",
            action: data.action || "STATUS_CHANGE",
            targetId: data.targetId || "",
            targetName: data.targetName || "",
            details: data.details || "",
            timestamp: data.timestamp || new Date().toISOString(),
          });
        });
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAuditLogs(logs);
      }, (err) => {
        console.warn("Error loading audit logs:", err);
      });
    } catch (e) {
      console.error("Dashboard listener error:", e);
      setLoading(false);
    }

    return () => {
      if (unsubPartners) unsubPartners();
      if (unsubLogs) unsubLogs();
    };
  }, []);

  // Macro KPI counts
  const total = partners.length;
  const applied = partners.filter((p) => p.status === "applied" || p.status === "draft").length;
  const screening = partners.filter((p) => p.status === "screening").length;
  const shortlisted = partners.filter((p) => p.status === "shortlisted" || p.status === "interview").length;
  const onboarded = partners.filter((p) => p.status === "onboarded").length;
  const archived = partners.filter((p) => p.status === "archived").length;
  const acceptanceRate = total > 0 ? Math.round((onboarded / total) * 100) : 0;

  const currentNeubofianId = currentUser ? getNeubofianId(currentUser.uid, currentUser.email || "") : "NBF-001";

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Executive Command Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-primary/10 border border-primary/20 text-primary">
              {currentNeubofianId}
            </span>
            <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Neubofy Talent Operations
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Recruitment ATS Command Center</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Logged in as <strong className="text-foreground">{currentUser?.email}</strong> • Access level: <strong className="text-primary uppercase">{role || "Administrator"}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/applicants">
            <Button className="btn-electric rounded-xl text-xs gap-1.5 h-9 font-medium shadow-md">
              <UserCheck size={14} /> Review Applicants Pipeline
            </Button>
          </Link>
          <Link href="/admin/analytics">
            <Button variant="outline" className="rounded-xl border-white/10 text-xs gap-1.5 h-9">
              <BarChart3 size={14} /> View Analytics
            </Button>
          </Link>
        </div>
      </div>

      {/* Top Macro KPI Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-white/10 bg-[#0c0e15]/80 space-y-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Users size={13} className="text-primary" /> Total Pool
          </span>
          <span className="text-3xl font-bold text-foreground block">{total}</span>
          <span className="text-[11px] text-muted-foreground">All applicants registered</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-blue-500/20 bg-[#0c0e15]/80 space-y-1">
          <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Clock size={13} /> In Screening
          </span>
          <span className="text-3xl font-bold text-blue-400 block">{screening}</span>
          <span className="text-[11px] text-muted-foreground">Under active triage</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-purple-500/20 bg-[#0c0e15]/80 space-y-1">
          <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles size={13} /> Shortlisted
          </span>
          <span className="text-3xl font-bold text-purple-400 block">{shortlisted}</span>
          <span className="text-[11px] text-muted-foreground">In interview rounds</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-emerald-500/20 bg-[#0c0e15]/80 space-y-1">
          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={13} /> Accepted
          </span>
          <span className="text-3xl font-bold text-emerald-400 block">{onboarded}</span>
          <span className="text-[11px] text-muted-foreground">Verified specialists</span>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-amber-500/20 bg-[#0c0e15]/80 space-y-1 col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp size={13} /> Acceptance
          </span>
          <span className="text-3xl font-bold text-amber-400 block">{acceptanceRate}%</span>
          <span className="text-[11px] text-muted-foreground">{archived} declined/archived</span>
        </div>
      </div>

      {/* Sub-Portal Navigation Hub Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/admin/applicants" className="group">
          <div className="glass-card p-5 rounded-2xl border border-white/10 hover:border-primary/40 transition-all bg-[#0c0e15]/90 space-y-3 h-full">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                Applicants Pipeline <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Triage, review, and 1-click Accept or Reject candidates with Card & Table views.
              </p>
            </div>
            <span className="text-[11px] text-primary font-medium block pt-1">
              {applied} pending review →
            </span>
          </div>
        </Link>

        <Link href="/admin/analytics" className="group">
          <div className="glass-card p-5 rounded-2xl border border-white/10 hover:border-primary/40 transition-all bg-[#0c0e15]/90 space-y-3 h-full">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BarChart3 size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                ATS Analytics <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Funnel conversion velocity, discipline concentration, and talent quality metrics.
              </p>
            </div>
            <span className="text-[11px] text-indigo-400 font-medium block pt-1">
              {acceptanceRate}% conversion rate →
            </span>
          </div>
        </Link>

        <Link href="/admin/track-record" className="group">
          <div className="glass-card p-5 rounded-2xl border border-white/10 hover:border-primary/40 transition-all bg-[#0c0e15]/90 space-y-3 h-full">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Activity size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground group-hover:text-emerald-400 transition-colors flex items-center justify-between">
                Track Record <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Live audit trail of administrative decisions, notes, and recruitment status changes.
              </p>
            </div>
            <span className="text-[11px] text-emerald-400 font-medium block pt-1">
              {auditLogs.length} events logged →
            </span>
          </div>
        </Link>

        <Link href="/admin/team" className="group">
          <div className="glass-card p-5 rounded-2xl border border-white/10 hover:border-primary/40 transition-all bg-[#0c0e15]/90 space-y-3 h-full">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users size={20} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-foreground group-hover:text-amber-400 transition-colors flex items-center justify-between">
                Neubofian Team <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Manage authorized administrator personnel and their unique Neubofian IDs.
              </p>
            </div>
            <span className="text-[11px] text-amber-400 font-medium block pt-1">
              Manage personnel & roles →
            </span>
          </div>
        </Link>
      </div>

      {/* Two-Column Section: Recent Applicants vs Live Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Applicants Column (2 cols) */}
        <div className="lg:col-span-2 glass-card p-6 rounded-3xl border border-white/10 bg-[#0c0e15]/90 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <UserCheck size={16} className="text-primary" /> Recent Applications
              </h2>
              <p className="text-xs text-muted-foreground">Latest specialists entering the evaluation pipeline</p>
            </div>
            <Link href="/admin/applicants" className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
              View All ({total}) <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="p-8 text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
              <RefreshCw className="animate-spin w-4 h-4 text-primary" /> Loading recent candidates...
            </div>
          ) : partners.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              No applications submitted yet. Onboarded specialists at /career will appear here.
            </div>
          ) : (
            <div className="space-y-2.5">
              {partners.slice(0, 5).map((partner) => {
                const applicantId = getApplicantId(partner.uid);
                const statusInfo = PARTNER_STATUS_LABELS[partner.status] || PARTNER_STATUS_LABELS.draft;
                return (
                  <div
                    key={partner.uid}
                    className="p-3.5 rounded-2xl bg-black/40 border border-white/5 hover:border-primary/30 transition-all flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center shrink-0">
                        {partner.photoURL ? (
                          <img src={partner.photoURL} alt={partner.name} className="w-full h-full object-cover" />
                        ) : (
                          <User size={18} className="text-primary/70" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-sm">{partner.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/10">
                            {applicantId}
                          </span>
                        </div>
                        <span className="text-xs text-primary">{partner.category} • {partner.email}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.bg} ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                      <Link href={`/admin/applicants/${partner.uid}`}>
                        <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs rounded-lg border-white/10 hover:bg-white/10">
                          View Dossier
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Live Track Record Activity Feed (1 col) */}
        <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c0e15]/90 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Activity size={16} className="text-emerald-400" /> Recent Activity
              </h2>
              <p className="text-xs text-muted-foreground">Live decisions & events</p>
            </div>
            <Link href="/admin/track-record" className="text-xs text-primary hover:underline font-medium">
              View All
            </Link>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-xs">
              No audit actions logged yet. Candidate decisions will display here in real time.
            </div>
          ) : (
            <div className="space-y-3">
              {auditLogs.slice(0, 5).map((log) => {
                const isAccept = log.action === "ACCEPT_APPLICANT";
                const isReject = log.action === "REJECT_APPLICANT";
                return (
                  <div key={log.id} className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider border ${
                        isAccept 
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                          : isReject 
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                          : "bg-primary/10 text-primary border-primary/20"
                      }`}>
                        {log.action.replace("_", " ")}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-foreground text-[11px] leading-snug line-clamp-2">{log.details}</p>
                    <span className="text-[10px] text-muted-foreground block truncate">by {log.actorEmail}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
