"use client";

import React, { useEffect, useState } from "react";
import { getFirebaseDb } from "@/lib/firebase/firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { AuditLogEntry, AuditLogAction } from "@/lib/admin/team";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Activity, 
  Search, 
  RefreshCw, 
  User, 
  Check, 
  X, 
  Mail, 
  FileText, 
  Star, 
  Shield, 
  ArrowRight,
  ExternalLink,
  Layers
} from "lucide-react";

export default function TrackRecordPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let unsubscribe: () => void;
    try {
      const logsRef = collection(getFirebaseDb(), "audit_logs");
      unsubscribe = onSnapshot(logsRef, (snapshot) => {
        const list: AuditLogEntry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            actorEmail: data.actorEmail || "Administrator",
            actorUid: data.actorUid || "",
            action: (data.action as AuditLogAction) || "STATUS_CHANGE",
            targetId: data.targetId || "",
            targetName: data.targetName || "",
            details: data.details || "",
            timestamp: data.timestamp || new Date().toISOString(),
          });
        });
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogs(list);
        setLoading(false);
      }, (err) => {
        console.warn("Audit logs error:", err);
        setLoading(false);
      });
    } catch (e) {
      console.warn("Audit snapshot error:", e);
      setLoading(false);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchFilter = filterAction === "all" || log.action === filterAction;
    const query = searchQuery.toLowerCase().trim();
    const matchSearch =
      !query ||
      log.actorEmail.toLowerCase().includes(query) ||
      (log.targetName && log.targetName.toLowerCase().includes(query)) ||
      log.details.toLowerCase().includes(query);

    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Admin
            </Link>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs text-primary font-semibold">Track Record</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Activity size={22} className="text-emerald-400" /> Internal Track Record & Audit Trail
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Immutable chronological stream of administrative decisions, evaluations, and candidate status transitions.
          </p>
        </div>

        <span className="text-xs font-mono bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 text-muted-foreground">
          {logs.length} logged actions
        </span>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 bg-[#0c0e15]/80 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Action Filter Pills */}
          <div className="flex overflow-x-auto pb-1 gap-1.5 text-xs max-w-full">
            {[
              { key: "all", label: "All Decisions" },
              { key: "ACCEPT_APPLICANT", label: "Accepted" },
              { key: "REJECT_APPLICANT", label: "Declined" },
              { key: "STATUS_CHANGE", label: "Stage Changes" },
              { key: "ADD_NOTE", label: "Review Notes" },
              { key: "RATE_CANDIDATE", label: "Ratings" },
              { key: "SEND_EMAIL", label: "Emails" },
              { key: "ASSIGN_ROLE", label: "Role Grants" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterAction(f.key)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                  filterAction === f.key
                    ? "bg-primary text-primary-foreground shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative pt-1">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by administrator email, candidate name, or action description..."
            className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Audit Log Stream */}
      {loading ? (
        <div className="glass-card p-12 rounded-2xl border border-white/10 text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
          <RefreshCw className="animate-spin w-4 h-4 text-primary" /> Loading track record...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl border border-white/10 text-center bg-[#0c0e15]/80 space-y-2">
          <p className="text-sm text-foreground font-semibold">No Activity Records Found</p>
          <p className="text-xs text-muted-foreground">
            {searchQuery || filterAction !== "all"
              ? "No records matched your search filters."
              : "Administrative actions performed across the recruitment portal will appear here in real time."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const isAccept = log.action === "ACCEPT_APPLICANT";
            const isReject = log.action === "REJECT_APPLICANT";
            const isNote = log.action === "ADD_NOTE";
            const isEmail = log.action === "SEND_EMAIL";
            const isRole = log.action === "ASSIGN_ROLE" || log.action === "REVOKE_ROLE";

            return (
              <div
                key={log.id}
                className="glass-card p-4 rounded-2xl border border-white/5 hover:border-white/15 bg-[#0c0e15]/90 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-md"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                      isAccept 
                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" 
                        : isReject 
                        ? "bg-rose-500/15 text-rose-400 border-rose-500/30" 
                        : isNote
                        ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30"
                        : isEmail
                        ? "bg-blue-500/15 text-blue-400 border-blue-500/30"
                        : isRole
                        ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                        : "bg-primary/15 text-primary border-primary/30"
                    }`}>
                      {log.action.replace("_", " ")}
                    </span>

                    <span className="text-muted-foreground text-[11px]">
                      by <strong className="text-foreground">{log.actorEmail}</strong>
                    </span>

                    {log.targetName && (
                      <span className="text-muted-foreground text-[11px]">
                        • Target: <strong className="text-primary">{log.targetName}</strong>
                      </span>
                    )}
                  </div>

                  <p className="text-foreground text-xs leading-relaxed">{log.details}</p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  {log.targetId && log.action !== "ASSIGN_ROLE" && log.action !== "REVOKE_ROLE" && (
                    <Link href={`/admin/applicants/${log.targetId}`}>
                      <Button size="sm" variant="outline" className="h-7 px-2 text-[11px] rounded-lg border-white/10 hover:bg-white/10 gap-1">
                        Dossier <ArrowRight size={11} />
                      </Button>
                    </Link>
                  )}
                  <span className="text-[11px] text-muted-foreground font-mono">
                    {new Date(log.timestamp).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
