"use client";

import React, { useEffect, useState } from "react";
import { getFirebaseDb } from "@/lib/firebase/firebase";
import { collection, onSnapshot, doc, setDoc } from "firebase/firestore";
import { AdminRole, canManageAdminRoles, canRemoveAdmin, canExportData } from "@/lib/admin/rbac";
import { useAdmin } from "@/lib/admin/AdminContext";
import { recordAdminActivity, getNeubofianId, removeAdminMember } from "@/lib/admin/team";
import { adminCache, exportToCsv, exportToJson } from "@/lib/admin/dataCache";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { 
  Users, 
  Shield, 
  UserPlus, 
  Trash2, 
  X, 
  CheckCircle2, 
  ExternalLink, 
  RefreshCw,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  Download,
  AlertTriangle
} from "lucide-react";

interface AdminTeamMember {
  id: string;
  email: string;
  role: AdminRole;
  addedBy?: string;
  createdAt: string;
}

export default function NeubofianTeamPage() {
  const { user: currentUser, role: currentRole, isSuperAdmin } = useAdmin();

  const [adminTeam, setAdminTeam] = useState<AdminTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>("admin");
  const [savingAdminRole, setSavingAdminRole] = useState(false);
  const [adminTeamSuccess, setAdminTeamSuccess] = useState("");
  const [adminTeamError, setAdminTeamError] = useState("");

  // Remove Modal State
  const [removeTarget, setRemoveTarget] = useState<AdminTeamMember | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  // Real-time listener for admins collection with cache
  useEffect(() => {
    let unsubscribe: () => void;
    try {
      const cached = adminCache.get<AdminTeamMember[]>("admin_team");
      if (cached) {
        setAdminTeam(cached);
        setLoading(false);
      }

      const adminsRef = collection(getFirebaseDb(), "admins");
      unsubscribe = onSnapshot(adminsRef, (snapshot) => {
        const team: AdminTeamMember[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          team.push({
            id: docSnap.id,
            email: data.email || docSnap.id,
            role: (data.role as AdminRole) || "admin",
            addedBy: data.addedBy || "Super Administrator",
            createdAt: data.createdAt || new Date().toISOString(),
          });
        });
        adminCache.set("admin_team", team);
        setAdminTeam(team);
        setLoading(false);
      }, (err) => {
        console.error("Error loading team members:", err);
        setLoading(false);
      });
    } catch (e) {
      console.error("Team listener setup error:", e);
      setLoading(false);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Grant role / invite team member
  const handleSaveAdminRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      setAdminTeamError("Permission Denied: Only the Super Administrator can authorize new administrators.");
      return;
    }

    setSavingAdminRole(true);
    setAdminTeamSuccess("");
    setAdminTeamError("");

    const cleanEmail = newAdminEmail.toLowerCase().trim();
    if (!cleanEmail) {
      setAdminTeamError("Email address is required.");
      setSavingAdminRole(false);
      return;
    }

    try {
      const docId = cleanEmail.replace(/[^a-zA-Z0-9]/g, "_");
      const adminDocRef = doc(getFirebaseDb(), "admins", docId);

      await setDoc(adminDocRef, {
        email: cleanEmail,
        role: newAdminRole,
        addedBy: currentUser?.email || "Super Administrator",
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      }, { merge: true });

      await recordAdminActivity({
        actorEmail: currentUser?.email || "Super Administrator",
        actorUid: currentUser?.uid || "",
        action: "ASSIGN_ROLE",
        targetId: docId,
        targetName: cleanEmail,
        details: `Granted ${newAdminRole.toUpperCase()} privilege to ${cleanEmail}`,
      });

      adminCache.invalidate("admin_team");
      setAdminTeamSuccess(`Successfully authorized ${cleanEmail} as ${newAdminRole.toUpperCase()}.`);
      setNewAdminEmail("");
    } catch (err) {
      console.error("Error saving admin role:", err);
      setAdminTeamError("Failed to save admin privileges in Firestore.");
    } finally {
      setSavingAdminRole(false);
    }
  };

  // Revoke administrator role
  const handleConfirmRevoke = async () => {
    if (!removeTarget || !isSuperAdmin) return;
    if (removeTarget.email === currentUser?.email) {
      alert("You cannot revoke your own Super Administrator privileges.");
      return;
    }

    setIsRemoving(true);
    const res = await removeAdminMember(
      removeTarget.id,
      currentUser?.email || "Super Administrator",
      currentUser?.uid || "",
      removeTarget.email
    );

    setIsRemoving(false);
    if (res.success) {
      adminCache.invalidate("admin_team");
      setAdminTeamSuccess(`Revoked administrative access and removed ${removeTarget.email}.`);
      setRemoveTarget(null);
    } else {
      setAdminTeamError(res.error || "Failed to revoke administrator role.");
    }
  };

  // Export Team Directory
  const handleExportTeamCsv = () => {
    const data = adminTeam.map((m) => ({
      NeubofianID: getNeubofianId(m.id, m.email),
      Email: m.email,
      Role: m.role.toUpperCase(),
      AddedBy: m.addedBy,
      CreatedAt: m.createdAt,
    }));
    exportToCsv(data, `neubofian_team_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportTeamJson = () => {
    exportToJson(adminTeam, `neubofian_team_${new Date().toISOString().slice(0, 10)}`);
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
            <span className="text-xs text-primary font-semibold">Neubofian Team</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users size={24} className="text-amber-400" /> Neubofian Team & Access Governance
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Internal recruitment staff directory with assigned Neubofian IDs and role-based permissions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canExportData(currentRole) && (
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleExportTeamCsv}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <Download size={12} /> CSV
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleExportTeamJson}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <Download size={12} /> JSON
              </Button>
            </div>
          )}

          <span className="text-xs font-mono bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 text-muted-foreground">
            {adminTeam.length} personnel
          </span>
        </div>
      </div>

      {/* Success / Error Banners */}
      {adminTeamSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{adminTeamSuccess}</span>
          </div>
          <button onClick={() => setAdminTeamSuccess("")}><X size={14} /></button>
        </div>
      )}

      {adminTeamError && (
        <div className="p-4 rounded-2xl bg-destructive/10 text-destructive border border-destructive/20 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert size={16} />
            <span>{adminTeamError}</span>
          </div>
          <button onClick={() => setAdminTeamError("")}><X size={14} /></button>
        </div>
      )}

      {/* Super Administrator: Authorize New Admin Form */}
      {isSuperAdmin && (
        <div className="glass-card p-6 rounded-3xl border border-primary/20 bg-[#0c0e15]/90 space-y-4 shadow-xl">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <UserPlus size={16} className="text-primary" /> Authorize New Team Member
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Grant Administrator privileges to Neubofy personnel.
            </p>
          </div>

          <form onSubmit={handleSaveAdminRole} className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                required
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                placeholder="colleague@neubofy.in"
                className="sm:col-span-2 px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <select
                value={newAdminRole}
                onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
                className="px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="admin">Administrator</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>

            <Button type="submit" disabled={savingAdminRole} className="btn-electric rounded-xl text-xs h-9 gap-1.5">
              <UserPlus size={13} /> {savingAdminRole ? "Authorizing..." : "Authorize Portal Access"}
            </Button>
          </form>
        </div>
      )}

      {/* Neubofian Team Directory */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c0e15]/90 space-y-4">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Shield size={16} className="text-primary" /> Authorized Personnel Directory
          </h2>
          <p className="text-xs text-muted-foreground">Each member possesses a unique Neubofian ID for audit attribution.</p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Loading team records...</div>
        ) : (
          <div className="divide-y divide-white/5">
            {adminTeam.map((member) => {
              const neubofianId = getNeubofianId(member.id, member.email);
              const isSuper = member.role === "super_admin";

              return (
                <div key={member.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                      isSuper ? "bg-amber-400/10 text-amber-400 border border-amber-400/30" : "bg-primary/10 text-primary border border-primary/30"
                    }`}>
                      {neubofianId}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/team/${member.id}`} className="font-semibold text-sm hover:text-primary transition-colors">
                          {member.email}
                        </Link>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          isSuper ? "bg-amber-400/15 text-amber-400 border border-amber-400/30" : "bg-primary/15 text-primary border border-primary/30"
                        }`}>
                          {isSuper ? "Super Administrator" : "Administrator"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Added by: <span className="text-foreground/80">{member.addedBy || "System"}</span> • Authorized: {new Date(member.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link href={`/admin/team/${member.id}`}>
                      <Button variant="outline" size="sm" className="h-8 px-3 rounded-xl border-white/10 text-xs gap-1 hover:bg-white/10">
                        View Track Record <ArrowRight size={12} />
                      </Button>
                    </Link>

                    {isSuperAdmin && canRemoveAdmin(currentRole) && !isSuper && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setRemoveTarget(member)}
                        className="h-8 px-2.5 rounded-xl border-rose-500/30 text-rose-400 hover:bg-rose-500/15 text-xs gap-1"
                        title="Revoke Admin Role"
                      >
                        <Trash2 size={13} /> Revoke
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CONFIRM REVOCATION MODAL */}
      {removeTarget && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#0e1017] border border-rose-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Revoke Administrator Privileges</h3>
                <p className="text-xs text-muted-foreground">High-Stakes Super Admin Action</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              Are you sure you want to revoke administrative access for <strong className="text-foreground">{removeTarget.email}</strong> ({getNeubofianId(removeTarget.id, removeTarget.email)})?
              They will immediately lose access to all candidate records and administrative portals.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setRemoveTarget(null)}
                className="rounded-xl border-white/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isRemoving}
                onClick={handleConfirmRevoke}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
              >
                {isRemoving ? "Revoking..." : "Confirm Revocation"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
