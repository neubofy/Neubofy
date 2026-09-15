"use client";

import React, { useEffect, useState } from "react";
import { getFirebaseDb } from "@/lib/firebase/firebase";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";
import { AdminRole, canManageAdminRoles } from "@/lib/admin/rbac";
import { useAdmin } from "@/lib/admin/AdminContext";
import { recordAdminActivity, getNeubofianId } from "@/lib/admin/team";
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
  UserCheck
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

  // Real-time listener for admins collection
  useEffect(() => {
    let unsubscribe: () => void;
    try {
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
  const handleRevokeRole = async (adminId: string, email: string) => {
    if (!isSuperAdmin) return;
    if (email === currentUser?.email) {
      alert("You cannot revoke your own Super Administrator role.");
      return;
    }

    if (!confirm(`Are you sure you want to revoke admin portal access for ${email}?`)) {
      return;
    }

    try {
      const docRef = doc(getFirebaseDb(), "admins", adminId);
      await deleteDoc(docRef);

      await recordAdminActivity({
        actorEmail: currentUser?.email || "Super Administrator",
        actorUid: currentUser?.uid || "",
        action: "REVOKE_ROLE",
        targetId: adminId,
        targetName: email,
        details: `Revoked admin portal permissions from ${email}`,
      });

      setAdminTeamSuccess(`Revoked administrative access for ${email}.`);
    } catch (err) {
      console.error("Error revoking admin:", err);
      setAdminTeamError("Failed to revoke administrator role.");
    }
  };

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
            <span className="text-xs text-primary font-semibold">Neubofian Team</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users size={24} className="text-amber-400" /> Neubofian Team & Access Control
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Internal recruitment staff directory with assigned Neubofian IDs and role-based permissions.
          </p>
        </div>

        <span className="text-xs font-mono bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 text-muted-foreground">
          {adminTeam.length} authorized personnel
        </span>
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
          <div className="p-8 text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
            <RefreshCw className="animate-spin w-4 h-4 text-primary" /> Loading team directory...
          </div>
        ) : adminTeam.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-6">
            No team administrators listed in Firestore yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {adminTeam.map((member) => {
              const neubofianId = getNeubofianId(member.id, member.email);
              const isOwner = member.role === "super_admin";
              return (
                <div
                  key={member.id}
                  className="p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/15 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-[11px] px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold">
                        {neubofianId}
                      </span>
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isOwner ? "bg-amber-400/10 text-amber-400 border-amber-400/30" : "bg-primary/10 text-primary border-primary/30"
                      }`}>
                        {isOwner ? "Super Administrator" : "Administrator"}
                      </span>
                    </div>

                    <Link href={`/admin/team/${member.id}`} className="hover:text-primary transition-colors block">
                      <span className="font-semibold text-sm text-foreground">{member.email}</span>
                    </Link>

                    <div className="text-[11px] text-muted-foreground space-y-0.5 pt-1">
                      <p>Authorized by: <strong className="text-foreground">{member.addedBy || "Owner"}</strong></p>
                      <p>Created: <span className="font-mono">{new Date(member.createdAt).toLocaleDateString()}</span></p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5">
                    <Link href={`/admin/team/${member.id}`}>
                      <Button size="sm" variant="outline" className="h-7 px-2.5 text-xs rounded-lg border-white/10 hover:bg-white/10 gap-1">
                        View Profile & Activity <ArrowRight size={11} />
                      </Button>
                    </Link>

                    {isSuperAdmin && member.email !== currentUser?.email && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRevokeRole(member.id, member.email)}
                        className="h-7 px-2 text-xs rounded-lg border-rose-500/30 text-rose-400 hover:bg-rose-500/15 gap-1"
                        title="Revoke admin access"
                      >
                        <Trash2 size={12} /> Revoke
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
