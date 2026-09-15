"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFirebaseDb } from "@/lib/firebase/firebase";
import { doc, onSnapshot, collection, query, where, updateDoc, deleteDoc } from "firebase/firestore";
import { AdminRole, canManageAdminRoles } from "@/lib/admin/rbac";
import { useAdmin } from "@/lib/admin/AdminContext";
import { recordAdminActivity, getNeubofianId, AuditLogEntry } from "@/lib/admin/team";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  ArrowLeft, 
  Users, 
  Shield, 
  Activity, 
  Clock, 
  Check, 
  X, 
  Trash2, 
  RefreshCw, 
  CheckCircle2,
  Award
} from "lucide-react";

interface TeamMemberDetail {
  id: string;
  email: string;
  role: AdminRole;
  addedBy?: string;
  createdAt: string;
  lastActive?: string;
  displayName?: string;
}

export default function TeamMemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { user: currentUser, isSuperAdmin } = useAdmin();

  const [member, setMember] = useState<TeamMemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [memberLogs, setMemberLogs] = useState<AuditLogEntry[]>([]);
  const [feedback, setFeedback] = useState("");

  // Load team member document
  useEffect(() => {
    if (!id) return;
    const docRef = doc(getFirebaseDb(), "admins", id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setMember({
          id: docSnap.id,
          email: data.email || docSnap.id,
          role: (data.role as AdminRole) || "admin",
          addedBy: data.addedBy || "Super Administrator",
          createdAt: data.createdAt || new Date().toISOString(),
          lastActive: data.lastActive || data.createdAt || new Date().toISOString(),
          displayName: data.displayName || "Administrator",
        });
      } else {
        setMember(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error loading team member:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  // Load audit logs for actions performed by this team member
  useEffect(() => {
    if (!member?.email) return;
    try {
      const logsRef = collection(getFirebaseDb(), "audit_logs");
      const q = query(logsRef, where("actorEmail", "==", member.email));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: AuditLogEntry[] = [];
        snapshot.forEach((d) => {
          const item = d.data();
          list.push({
            id: d.id,
            actorEmail: item.actorEmail || "Administrator",
            actorUid: item.actorUid || "",
            action: item.action || "STATUS_CHANGE",
            targetId: item.targetId,
            targetName: item.targetName,
            details: item.details,
            timestamp: item.timestamp,
          });
        });
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setMemberLogs(list);
      }, (err) => {
        console.warn("Audit query warning:", err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Error subscribing to member logs:", e);
    }
  }, [member?.email]);

  // Change Role
  const handleToggleRole = async () => {
    if (!isSuperAdmin || !member) return;
    const nextRole: AdminRole = member.role === "super_admin" ? "admin" : "super_admin";
    if (member.email === currentUser?.email && nextRole !== "super_admin") {
      alert("You cannot demote yourself from Super Administrator.");
      return;
    }

    try {
      const docRef = doc(getFirebaseDb(), "admins", member.id);
      await updateDoc(docRef, { role: nextRole });

      await recordAdminActivity({
        actorEmail: currentUser?.email || "Super Administrator",
        actorUid: currentUser?.uid || "",
        action: "ASSIGN_ROLE",
        targetId: member.id,
        targetName: member.email,
        details: `Updated role to ${nextRole.toUpperCase()} for ${member.email}`,
      });

      setFeedback(`Updated ${member.email}'s role to ${nextRole.toUpperCase()}.`);
    } catch (err) {
      console.error("Error updating role:", err);
    }
  };

  // Revoke Admin
  const handleRevoke = async () => {
    if (!isSuperAdmin || !member) return;
    if (member.email === currentUser?.email) {
      alert("You cannot revoke your own account.");
      return;
    }

    if (!confirm(`Revoke administrative access for ${member.email}?`)) return;

    try {
      const docRef = doc(getFirebaseDb(), "admins", member.id);
      await deleteDoc(docRef);

      await recordAdminActivity({
        actorEmail: currentUser?.email || "Super Administrator",
        actorUid: currentUser?.uid || "",
        action: "REVOKE_ROLE",
        targetId: member.id,
        targetName: member.email,
        details: `Revoked admin role from ${member.email}`,
      });

      router.push("/admin/team");
    } catch (err) {
      console.error("Error revoking role:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground text-xs">
          <RefreshCw className="animate-spin h-8 w-8 text-primary" />
          <span>Loading team member dossier...</span>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold">Team Member Not Found</h2>
        <p className="text-xs text-muted-foreground">The administrative profile does not exist.</p>
        <Link href="/admin/team">
          <Button variant="outline" className="rounded-xl text-xs gap-1.5">
            <ArrowLeft size={14} /> Return to Team Directory
          </Button>
        </Link>
      </div>
    );
  }

  const neubofianId = getNeubofianId(member.id, member.email);
  const isSuper = member.role === "super_admin";
  const acceptsCount = memberLogs.filter(l => l.action === "ACCEPT_APPLICANT").length;
  const notesCount = memberLogs.filter(l => l.action === "ADD_NOTE").length;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <Link href="/admin/team" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} /> Back to Team Directory
        </Link>

        {isSuperAdmin && member.email !== currentUser?.email && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleToggleRole}
              className="rounded-xl border-white/10 text-xs h-8"
            >
              Change to {isSuper ? "Administrator" : "Super Administrator"}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRevoke}
              className="rounded-xl border-rose-500/30 text-rose-400 hover:bg-rose-500/15 text-xs h-8 gap-1"
            >
              <Trash2 size={12} /> Revoke Access
            </Button>
          </div>
        )}
      </div>

      {feedback && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback("")}><X size={14} /></button>
        </div>
      )}

      {/* Member Profile Hero Card */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0c0e15]/90 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5">
          <div className="space-y-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold">
                {neubofianId}
              </span>
              <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                isSuper ? "bg-amber-400/10 text-amber-400 border-amber-400/30" : "bg-primary/10 text-primary border-primary/30"
              }`}>
                {isSuper ? "Super Administrator" : "Administrator"}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{member.email}</h1>
            <p className="text-xs text-muted-foreground">Authorized by: <strong className="text-foreground">{member.addedBy || "Owner"}</strong></p>
          </div>

          <div className="text-right text-xs text-muted-foreground font-mono space-y-1">
            <p>Authorized: {new Date(member.createdAt).toLocaleDateString()}</p>
            <p>Last Active: {new Date(member.lastActive || member.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Member Activity Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider block">
              Total Logged Decisions
            </span>
            <span className="text-2xl font-bold text-foreground">{memberLogs.length}</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-emerald-500/10 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider block">
              Specialists Accepted
            </span>
            <span className="text-2xl font-bold text-emerald-400">{acceptsCount}</span>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-indigo-500/10 space-y-1">
            <span className="text-[10px] uppercase font-semibold text-indigo-400 tracking-wider block">
              Assessment Notes Logged
            </span>
            <span className="text-2xl font-bold text-indigo-400">{notesCount}</span>
          </div>
        </div>
      </div>

      {/* Audit History Attributed to this Member */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0c0e15]/90 space-y-4 shadow-xl">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Activity size={16} className="text-primary" /> Activity Log for {neubofianId}
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            All administrative decisions, candidate stage changes, and evaluations performed by this team member.
          </p>
        </div>

        {memberLogs.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-8">
            No administrative decisions logged under this account yet.
          </p>
        ) : (
          <div className="space-y-2.5 pt-2">
            {memberLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                      {log.action.replace("_", " ")}
                    </span>
                    {log.targetName && (
                      <span className="text-muted-foreground text-[11px]">
                        Target: <strong className="text-foreground">{log.targetName}</strong>
                      </span>
                    )}
                  </div>
                  <p className="text-foreground">{log.details}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  {log.targetId && (
                    <Link href={`/admin/applicants/${log.targetId}`}>
                      <Button size="sm" variant="outline" className="h-6 px-2 text-[10px] rounded-lg border-white/10 hover:bg-white/10">
                        View Applicant
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
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
