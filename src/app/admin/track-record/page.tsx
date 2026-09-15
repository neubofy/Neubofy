"use client";

import React, { useEffect, useState } from "react";
import { getFirebaseDb } from "@/lib/firebase/firebase";
import { collection, query, orderBy, limit, onSnapshot, getDocs } from "firebase/firestore";
import { AuditLogEntry, AuditLogAction, purgeOldAuditLogs } from "@/lib/admin/team";
import { useAdmin } from "@/lib/admin/AdminContext";
import { canPurgeLogs, canExportData } from "@/lib/admin/rbac";
import { exportToCsv, exportToJson } from "@/lib/admin/dataCache";
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
  Layers,
  Trash2,
  Download,
  AlertTriangle,
  Calendar,
  CheckCircle2
} from "lucide-react";

export default function TrackRecordPage() {
  const { user: currentUser, role: currentRole, isSuperAdmin } = useAdmin();

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [queryLimit, setQueryLimit] = useState(100);

  // Auto-clean State
  const [purgeModalOpen, setPurgeModalOpen] = useState(false);
  const [purgeDays, setPurgeDays] = useState(30);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeFeedback, setPurgeFeedback] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;
    try {
      const logsRef = collection(getFirebaseDb(), "audit_logs");
      // Bounded query ordered by timestamp desc to ensure fast page loads
      const q = query(logsRef, orderBy("timestamp", "desc"), limit(queryLimit));

      unsubscribe = onSnapshot(q, (snapshot) => {
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
  }, [queryLimit]);

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

  // Handle Purge Logs
  const handleConfirmPurge = async () => {
    if (!isSuperAdmin) return;
    setIsPurging(true);
    setPurgeFeedback(null);

    const res = await purgeOldAuditLogs(
      purgeDays,
      currentUser?.email || "Super Administrator",
      currentUser?.uid || "admin"
    );

    setIsPurging(false);
    if (res.success) {
      setPurgeFeedback(`Successfully pruned ${res.count} old audit logs older than ${purgeDays} days.`);
      setTimeout(() => {
        setPurgeModalOpen(false);
        setPurgeFeedback(null);
      }, 2500);
    } else {
      alert(`Failed to prune logs: ${res.error}`);
    }
  };

  // Export Audit Stream
  const handleExportCsv = () => {
    const data = filteredLogs.map((l) => ({
      Timestamp: l.timestamp,
      Action: l.action,
      ActorEmail: l.actorEmail,
      TargetID: l.targetId,
      TargetName: l.targetName,
      Details: l.details,
    }));
    exportToCsv(data, `neubofy_audit_logs_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportJson = () => {
    exportToJson(filteredLogs, `neubofy_audit_logs_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in pb-16">
      
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
            Immutable chronological stream of administrative decisions, candidate evaluations, and security governance.
          </p>
        </div>

        {/* Global Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {canExportData(currentRole) && (
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleExportCsv}
                className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
                title="Export Stream to CSV"
              >
                <Download size={12} /> CSV
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleExportJson}
                className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
                title="Export Stream to JSON"
              >
                <Download size={12} /> JSON
              </Button>
            </div>
          )}

          {isSuperAdmin && canPurgeLogs(currentRole) && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setPurgeModalOpen(true);
                setPurgeFeedback(null);
              }}
              className="h-9 px-3 rounded-xl border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs gap-1.5"
              title="Auto-Clean and Prune Historical Logs"
            >
              <Trash2 size={13} /> Auto-Clean Logs
            </Button>
          )}

          <span className="text-xs font-mono bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 text-muted-foreground">
            {logs.length} loaded
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 bg-[#0c0e15]/80 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Action Filter Pills */}
          <div className="flex overflow-x-auto pb-1 gap-1.5 text-xs max-w-full">
            {[
              { key: "all", label: "All Events" },
              { key: "ACCEPT_APPLICANT", label: "Accepted" },
              { key: "REJECT_APPLICANT", label: "Declined" },
              { key: "SCHEDULE_INTERVIEW", label: "Interviews" },
              { key: "STATUS_CHANGE", label: "Stage Changes" },
              { key: "ADD_NOTE", label: "Review Notes" },
              { key: "RATE_CANDIDATE", label: "Ratings" },
              { key: "SEND_EMAIL", label: "Emails" },
              { key: "ASSIGN_ROLE", label: "Role Grants" },
              { key: "DELETE_APPLICANT", label: "Deletions" },
              { key: "PURGE_LOGS", label: "Log Cleanups" },
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
            placeholder="Search by administrator email, candidate name, or action details..."
            className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Audit Log Stream */}
      {loading ? (
        <div className="glass-card p-12 rounded-2xl border border-white/10 text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          Loading audit stream...
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="glass-card p-12 rounded-2xl border border-white/10 text-center text-muted-foreground text-xs">
          No audit records found matching your filter criteria.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => {
            const isAccept = log.action === "ACCEPT_APPLICANT";
            const isReject = log.action === "REJECT_APPLICANT" || log.action === "DELETE_APPLICANT";
            const isInterview = log.action === "SCHEDULE_INTERVIEW";
            const isPurge = log.action === "PURGE_LOGS";

            return (
              <div
                key={log.id}
                className="glass-card p-4 rounded-2xl border border-white/10 bg-[#0c0e15]/80 hover:border-white/20 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isAccept
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : isReject
                      ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      : isInterview
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : isPurge
                      ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      : "bg-white/5 text-muted-foreground border border-white/10"
                  }`}>
                    {isAccept ? (
                      <Check size={14} />
                    ) : isReject ? (
                      <X size={14} />
                    ) : isInterview ? (
                      <Calendar size={14} />
                    ) : isPurge ? (
                      <Trash2 size={14} />
                    ) : (
                      <Activity size={14} />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-primary">
                        {log.action}
                      </span>
                      {log.targetName && (
                        <span className="font-semibold text-foreground">
                          Target: {log.targetName}
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground leading-relaxed">
                      {log.details}
                    </p>
                    <div className="text-[11px] text-muted-foreground/80 flex items-center gap-2">
                      <span>Actor: <strong className="text-foreground/90">{log.actorEmail}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="text-right whitespace-nowrap self-end sm:self-center">
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Load More Bounding Trigger */}
          {logs.length >= queryLimit && (
            <div className="text-center pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQueryLimit((prev) => prev + 100)}
                className="rounded-xl border-white/10 text-xs hover:bg-white/5"
              >
                Load Older Records (+100)
              </Button>
            </div>
          )}
        </div>
      )}

      {/* SUPER ADMIN AUTO-CLEAN LOGS MODAL */}
      {purgeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#0e1017] border border-rose-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <Trash2 size={18} />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Auto-Clean Audit Trail</h3>
                <p className="text-xs text-muted-foreground">High-Stakes Super Admin Maintenance</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Prune historical audit trail records to optimize Firestore database performance and reduce read latency as the portal scales.
            </p>

            {purgeFeedback && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 size={15} /> {purgeFeedback}
              </div>
            )}

            <div>
              <label className="block font-medium text-xs text-muted-foreground mb-1">
                Select Retention Window
              </label>
              <select
                value={purgeDays}
                onChange={(e) => setPurgeDays(Number(e.target.value))}
                className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-xs text-foreground focus:outline-none"
              >
                <option value={30}>Prune records older than 30 days (Recommended for lean storage)</option>
                <option value={60}>Prune records older than 60 days</option>
                <option value={90}>Prune records older than 90 days (Quarterly cycle)</option>
              </select>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-[11px] text-muted-foreground">
              💡 <strong>Tip:</strong> We recommend using the <strong>CSV or JSON Export</strong> button at the top of the page before pruning if you need to keep offline compliance records.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPurgeModalOpen(false)}
                className="rounded-xl border-white/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isPurging}
                onClick={handleConfirmPurge}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
              >
                {isPurging ? "Pruning Records..." : `Prune Records Older Than ${purgeDays} Days`}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
