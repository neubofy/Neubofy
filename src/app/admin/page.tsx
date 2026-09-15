"use client";

import React, { useEffect, useState } from "react";
import { getFirebaseDb } from "@/lib/firebase/firebase";
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc } from "firebase/firestore";
import { 
  PartnerProfile, 
  PartnerStatus, 
  PARTNER_CATEGORIES, 
  STANDARD_CAPABILITIES, 
  PARTNER_STATUS_LABELS,
  InternalNote 
} from "@/lib/partner/types";
import { AdminRole, canManagePartners, canSendPartnerEmails, canManageAdminRoles } from "@/lib/admin/rbac";
import { useAdmin } from "@/lib/admin/AdminContext";
import { recordAdminActivity } from "@/lib/admin/team";
import { processPartnerStatusChange } from "@/app/actions/adminPartnerActions";
import { sendPartnerNotification } from "@/app/actions/sendPartnerEmail";
import { EmailSenderType, ReplyToType } from "@/lib/email/resend";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
  Filter, 
  User, 
  Mail, 
  Phone, 
  ExternalLink, 
  Star, 
  CheckCircle2, 
  X, 
  MessageSquare, 
  Send, 
  Eye, 
  FileText, 
  Github, 
  Linkedin, 
  Sparkles, 
  Clock, 
  Layers, 
  RefreshCw,
  ChevronDown,
  Shield,
  ShieldAlert,
  Users,
  UserPlus,
  Trash2,
  Key
} from "lucide-react";

interface AdminTeamMember {
  id: string;
  email: string;
  role: AdminRole;
  addedBy?: string;
  createdAt: string;
}

export default function AdminRecruitmentPage() {
  const { user: currentUser, role: currentRole, isSuperAdmin } = useAdmin();
  const router = useRouter();

  // Navigation between ATS Recruitment and Team Access Management
  const [activeMainTab, setActiveMainTab] = useState<"recruitment" | "team">("recruitment");

  // Partners Data
  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusTab, setStatusTab] = useState<string>("all");
  const [capabilityFilter, setCapabilityFilter] = useState<string>("all");

  // Selected Partner for Slide-Over Dossier
  const [selectedPartner, setSelectedPartner] = useState<PartnerProfile | null>(null);

  // Internal Note form state
  const [newNote, setNewNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  // Status Change State inside Dossier
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusNotifyEmail, setStatusNotifyEmail] = useState(true);

  // Email Modal State
  const [emailModalPartner, setEmailModalPartner] = useState<PartnerProfile | null>(null);
  const [emailTemplateType, setEmailTemplateType] = useState<"welcome" | "status_change" | "custom">("custom");
  const [emailNewStatus, setEmailNewStatus] = useState<PartnerStatus>("screening");
  const [emailSender, setEmailSender] = useState<EmailSenderType>("careers");
  const [emailReplyTo, setEmailReplyTo] = useState<ReplyToType>("careers@neubofy.in");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailBookingUrl, setEmailBookingUrl] = useState("https://booking.neubofy.in");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Super Admin Team Management State
  const [adminTeam, setAdminTeam] = useState<AdminTeamMember[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminRole, setNewAdminRole] = useState<AdminRole>("admin");
  const [savingAdminRole, setSavingAdminRole] = useState(false);
  const [adminTeamSuccess, setAdminTeamSuccess] = useState("");
  const [adminTeamError, setAdminTeamError] = useState("");

  // Fetch partners in real time
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
              name: data.name || "Unnamed Partner",
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

        if (selectedPartner) {
          const updated = list.find((p) => p.uid === selectedPartner.uid);
          if (updated) setSelectedPartner(updated);
        }
      }, (err) => {
        console.error("Firestore listener error:", err);
        setLoading(false);
      });
    } catch (e) {
      console.error("Error setting up snapshot:", e);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedPartner?.uid]);

  // Fetch Admin Team Members (Only if Super Admin)
  useEffect(() => {
    let unsubscribe: () => void;
    if (isSuperAdmin) {
      try {
        const adminsRef = collection(getFirebaseDb(), "admins");
        unsubscribe = onSnapshot(adminsRef, (snapshot) => {
          const team: AdminTeamMember[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            team.push({
              id: docSnap.id,
              email: data.email || docSnap.id,
              role: (data.role as AdminRole) || "member",
              addedBy: data.addedBy || "Super Admin",
              createdAt: data.createdAt || new Date().toISOString(),
            });
          });
          setAdminTeam(team);
        });
      } catch (err) {
        console.error("Error loading admin team:", err);
      }
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isSuperAdmin]);

  // Filtered partners
  const filteredPartners = partners.filter((p) => {
    const matchSearch =
      !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery) ||
      p.capabilities.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategory = categoryFilter === "all" || p.category === categoryFilter;
    const matchStatus = statusTab === "all" || p.status === statusTab;
    const matchCapability = capabilityFilter === "all" || p.capabilities.includes(capabilityFilter);

    return matchSearch && matchCategory && matchStatus && matchCapability;
  });

  // KPI counts
  const counts = {
    total: partners.length,
    applied: partners.filter((p) => p.status === "applied").length,
    screening: partners.filter((p) => p.status === "screening").length,
    shortlisted: partners.filter((p) => p.status === "shortlisted" || p.status === "interview").length,
    onboarded: partners.filter((p) => p.status === "onboarded").length,
    archived: partners.filter((p) => p.status === "archived").length,
  };

  // Add Internal Review Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner || !newNote.trim()) return;
    setSubmittingNote(true);

    try {
      const noteItem: InternalNote = {
        id: `note_${Date.now()}`,
        authorEmail: currentUser?.email || "reviewer@neubofy.in",
        note: newNote.trim(),
        createdAt: new Date().toISOString(),
      };

      const updatedNotes = [...(selectedPartner.internalNotes || []), noteItem];
      const docRef = doc(getFirebaseDb(), "users", selectedPartner.uid);
      await updateDoc(docRef, { internalNotes: updatedNotes });

      setSelectedPartner({ ...selectedPartner, internalNotes: updatedNotes });
      setNewNote("");
    } catch (err) {
      console.error("Error saving note", err);
    } finally {
      setSubmittingNote(false);
    }
  };

  // Set Partner Star Rating
  const handleSetRating = async (newRating: number) => {
    if (!selectedPartner) return;
    try {
      const docRef = doc(getFirebaseDb(), "users", selectedPartner.uid);
      await updateDoc(docRef, { rating: newRating });
      setSelectedPartner({ ...selectedPartner, rating: newRating });
    } catch (err) {
      console.error("Error updating rating", err);
    }
  };

  // Update Status from Dossier
  const handleStatusChange = async (newStatus: PartnerStatus) => {
    if (!selectedPartner) return;
    if (!canManagePartners(currentRole)) {
      alert("Permission Denied: Only Administrators and Super Administrators can change recruitment stages.");
      return;
    }

    setChangingStatus(true);
    try {
      const docRef = doc(getFirebaseDb(), "users", selectedPartner.uid);
      await updateDoc(docRef, {
        status: newStatus,
        verified: newStatus === "onboarded",
        updatedAt: new Date().toISOString(),
      });

      if (statusNotifyEmail && selectedPartner.email) {
        await processPartnerStatusChange({
          partnerUid: selectedPartner.uid,
          partnerEmail: selectedPartner.email,
          partnerName: selectedPartner.name,
          category: selectedPartner.category,
          newStatus: newStatus,
          notifyPartner: true,
          bookingUrl: "https://booking.neubofy.in",
        });
      }

      setSelectedPartner({
        ...selectedPartner,
        status: newStatus,
        verified: newStatus === "onboarded",
      });
    } catch (err) {
      console.error("Error changing status", err);
    } finally {
      setChangingStatus(false);
    }
  };

  // Open Email Modal
  const openEmailModal = (partner: PartnerProfile, defaultType: "welcome" | "status_change" | "custom" = "custom") => {
    if (!canSendPartnerEmails(currentRole)) {
      alert("Permission Denied: Reviewer members cannot dispatch outgoing emails.");
      return;
    }

    setEmailModalPartner(partner);
    setEmailTemplateType(defaultType);
    setEmailFeedback(null);
    setEmailSender("careers");
    setEmailReplyTo("careers@neubofy.in");
    setEmailSubject(`Neubofy Specialist Opportunity — Update for ${partner.name}`);
    setEmailBody(`Hi ${partner.name},\n\nWe are reaching out from Neubofy Talent Operations regarding upcoming client requirements matching your ${partner.category} capabilities.`);
  };

  // Send Email via Resend
  const handleSendEmail = async () => {
    if (!emailModalPartner) return;
    setSendingEmail(true);
    setEmailFeedback(null);

    try {
      const res = await sendPartnerNotification({
        partnerEmail: emailModalPartner.email,
        partnerName: emailModalPartner.name,
        category: emailModalPartner.category,
        type: emailTemplateType,
        newStatus: emailTemplateType === "status_change" ? emailNewStatus : undefined,
        bookingUrl: emailBookingUrl,
        customSubject: emailTemplateType === "custom" ? emailSubject : undefined,
        customMessage: emailTemplateType === "custom" ? emailBody : undefined,
        replyTo: emailReplyTo,
      });

      if (res.success) {
        setEmailFeedback({
          success: true,
          message: res.simulated
            ? "Email simulated (RESEND_API_KEY environment variable not configured locally)."
            : "Email dispatched successfully via Resend to " + emailModalPartner.email,
        });
      } else {
        setEmailFeedback({
          success: false,
          message: res.error || "Failed to send email via Resend.",
        });
      }
    } catch (err: unknown) {
      setEmailFeedback({
        success: false,
        message: err instanceof Error ? err.message : "Error sending email.",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // Assign or Update Admin Role (Super Admin Only)
  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    const cleanEmail = newAdminEmail.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setAdminTeamError("Please provide a valid email address.");
      return;
    }

    setSavingAdminRole(true);
    setAdminTeamError("");
    setAdminTeamSuccess("");

    try {
      // Find user UID if already in system or use email doc ID
      const docId = cleanEmail.replace(/[^a-zA-Z0-9]/g, "_");
      const docRef = doc(getFirebaseDb(), "admins", docId);
      
      await setDoc(docRef, {
        email: cleanEmail,
        role: newAdminRole,
        addedBy: currentUser?.email || "Super Administrator",
        createdAt: new Date().toISOString(),
      });

      await recordAdminActivity({
        actorEmail: currentUser?.email || "Super Administrator",
        actorUid: currentUser?.uid || "",
        action: "ASSIGN_ROLE",
        targetId: docId,
        targetName: cleanEmail,
        details: `Assigned role '${newAdminRole}' to ${cleanEmail}`,
      });

      setAdminTeamSuccess(`Role '${newAdminRole}' successfully assigned to ${cleanEmail}.`);
      setNewAdminEmail("");
    } catch (err: unknown) {
      console.error("Assign role error", err);
      setAdminTeamError(err instanceof Error ? err.message : "Failed to assign role.");
    } finally {
      setSavingAdminRole(false);
    }
  };

  // Revoke Admin Role (Super Admin Only)
  const handleRevokeRole = async (adminId: string, email: string) => {
    if (!isSuperAdmin) return;
    if (email === currentUser?.email) {
      alert("You cannot revoke your own Super Administrator role.");
      return;
    }
    const confirmRevoke = window.confirm(`Are you sure you want to revoke admin access for ${email}?`);
    if (!confirmRevoke) return;

    try {
      const docRef = doc(getFirebaseDb(), "admins", adminId);
      await deleteDoc(docRef);

      await recordAdminActivity({
        actorEmail: currentUser?.email || "Super Administrator",
        actorUid: currentUser?.uid || "",
        action: "REVOKE_ROLE",
        targetId: adminId,
        targetName: email,
        details: `Revoked admin permissions from ${email}`,
      });

      setAdminTeamSuccess(`Revoked access for ${email}.`);
    } catch (err) {
      console.error("Error revoking admin", err);
      setAdminTeamError("Failed to revoke role.");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Main Tab Switcher */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Neubofy Access & ATS Console</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Role: <strong className="text-primary uppercase text-xs">{currentRole || "Authorized Staff"}</strong> • High-stake security and recruitment orchestration.
          </p>
        </div>

        {/* Super Admin Top Toggle */}
        <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveMainTab("recruitment")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeMainTab === "recruitment"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers size={14} /> Recruitment ATS
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setActiveMainTab("team")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeMainTab === "team"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users size={14} /> Team & RBAC Roles
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RECRUITMENT ATS PIPELINE */}
      {/* ========================================================================= */}
      {activeMainTab === "recruitment" && (
        <div className="space-y-6">
          {/* Recruitment Metric KPI Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Total Candidates", count: counts.total, color: "text-foreground", border: "border-white/10" },
              { label: "Applied (New)", count: counts.applied, color: "text-blue-400", border: "border-blue-500/20" },
              { label: "In Screening", count: counts.screening, color: "text-indigo-400", border: "border-indigo-500/20" },
              { label: "Shortlisted", count: counts.shortlisted, color: "text-purple-400", border: "border-purple-500/20" },
              { label: "Verified Partners", count: counts.onboarded, color: "text-emerald-400", border: "border-emerald-500/20" },
              { label: "Archived", count: counts.archived, color: "text-zinc-400", border: "border-zinc-500/20" },
            ].map((kpi, idx) => (
              <div key={idx} className={`glass-card p-4 rounded-2xl border ${kpi.border} bg-[#0c0e15]/80`}>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  {kpi.label}
                </span>
                <span className={`text-2xl font-bold ${kpi.color}`}>{kpi.count}</span>
              </div>
            ))}
          </div>

          {/* Search & Filter Toolbar */}
          <div className="glass-card p-4 rounded-2xl border border-white/10 bg-[#0c0e15]/80 space-y-4">
            {/* Pipeline Tabs */}
            <div className="flex overflow-x-auto pb-1 gap-1.5 border-b border-white/10 text-xs">
              {[
                { key: "all", label: `All (${counts.total})` },
                { key: "applied", label: `Applied (${counts.applied})` },
                { key: "screening", label: `Screening (${counts.screening})` },
                { key: "shortlisted", label: `Shortlisted (${counts.shortlisted})` },
                { key: "onboarded", label: `Verified (${counts.onboarded})` },
                { key: "archived", label: `Archived (${counts.archived})` },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setStatusTab(tab.key)}
                  className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-all ${
                    statusTab === tab.key
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Filter Bar Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search name, email, phone, skill..."
                  className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
                >
                  <option value="all">All Categories ({PARTNER_CATEGORIES.length})</option>
                  {PARTNER_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={capabilityFilter}
                  onChange={(e) => setCapabilityFilter(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
                >
                  <option value="all">All Capabilities ({STANDARD_CAPABILITIES.length})</option>
                  {STANDARD_CAPABILITIES.map((cap) => (
                    <option key={cap} value={cap}>
                      {cap}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground px-2">
                <span>Showing: <strong>{filteredPartners.length}</strong> candidates</span>
                {(searchQuery || categoryFilter !== "all" || statusTab !== "all" || capabilityFilter !== "all") && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setCategoryFilter("all");
                      setStatusTab("all");
                      setCapabilityFilter("all");
                    }}
                    className="text-primary hover:underline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Partner Candidates Table */}
          <div className="glass-card rounded-2xl border border-white/10 overflow-hidden bg-[#0c0e15]/80 shadow-xl">
            {loading ? (
              <div className="p-12 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                <RefreshCw className="animate-spin w-4 h-4" /> Loading candidates...
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-sm">
                No partner applicants found matching your filter criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/40 text-muted-foreground border-b border-white/10 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Candidate</th>
                      <th className="py-3.5 px-4">Specialization</th>
                      <th className="py-3.5 px-4">Capabilities</th>
                      <th className="py-3.5 px-4">Stage</th>
                      <th className="py-3.5 px-4">Rating</th>
                      <th className="py-3.5 px-4">Contact</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredPartners.map((partner) => {
                      const statusInfo = PARTNER_STATUS_LABELS[partner.status] || PARTNER_STATUS_LABELS.draft;
                      return (
                        <tr 
                          key={partner.uid} 
                          className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                          onClick={() => router.push(`/admin/specialists/${partner.uid}`)}
                        >
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                                {partner.photoURL ? (
                                  <img src={partner.photoURL} alt={partner.name} className="w-full h-full object-cover" />
                                ) : (
                                  <User size={16} className="text-primary/70" />
                                )}
                              </div>
                              <div>
                                <span className="font-semibold text-foreground text-sm block">{partner.name}</span>
                                <span className="text-[11px] text-muted-foreground/80">{partner.email}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-[180px]">
                            <span className="font-medium text-foreground truncate block">{partner.category}</span>
                          </td>

                          <td className="py-3.5 px-4 max-w-[240px]">
                            <div className="flex flex-wrap gap-1">
                              {partner.capabilities.slice(0, 2).map((cap) => (
                                <span key={cap} className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-muted-foreground truncate">
                                  {cap}
                                </span>
                              ))}
                              {partner.capabilities.length > 2 && (
                                <span className="text-[10px] text-primary self-center font-medium">
                                  +{partner.capabilities.length - 2}
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusInfo.bg} ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={12}
                                  className={star <= (partner.rating || 0) ? "fill-amber-400" : "text-white/20"}
                                />
                              ))}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-muted-foreground">
                            {partner.phone || "—"}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <Link href={`/admin/specialists/${partner.uid}`}>
                                <Button
                                  size="sm"
                                  className="h-7 px-2.5 text-xs rounded-lg btn-electric gap-1 font-medium shadow-sm"
                                >
                                  <Eye size={12} /> Manage Specialist
                                </Button>
                              </Link>
                              {canSendPartnerEmails(currentRole) && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEmailModal(partner)}
                                  className="h-7 px-2.5 text-xs rounded-lg border-primary/30 text-primary hover:bg-primary/10 gap-1"
                                >
                                  <Mail size={12} /> Email
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: TEAM & RBAC MANAGEMENT (SUPER ADMIN ONLY) */}
      {/* ========================================================================= */}
      {activeMainTab === "team" && isSuperAdmin && (
        <div className="space-y-6">
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-primary/20 bg-[#0c0e15]/80 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Shield className="w-5 h-5 text-amber-400" />
                <h2 className="text-xl font-bold">Access Management & Role Control</h2>
              </div>
              <p className="text-xs text-muted-foreground">
                Assign and control admin portal privileges across your team. Super Administrators can grant roles to team members.
              </p>
            </div>

            {adminTeamSuccess && (
              <div className="p-3 rounded-xl text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-2">
                <CheckCircle2 size={16} /> {adminTeamSuccess}
              </div>
            )}

            {adminTeamError && (
              <div className="p-3 rounded-xl text-xs bg-destructive/10 text-destructive border border-destructive/30">
                {adminTeamError}
              </div>
            )}

            {/* Grant / Update Role Form */}
            <form onSubmit={handleAssignRole} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <UserPlus size={14} className="text-primary" /> Grant Role / Invite Team Member
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-muted-foreground mb-1">User Email Address</label>
                  <input
                    required
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="teammember@neubofy.in"
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Select Role</label>
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
                    className="w-full px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
                  >
                    <option value="admin">Administrator (Talent Operations & Candidates)</option>
                    <option value="super_admin">Super Administrator (Owner Level)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button type="submit" disabled={savingAdminRole} className="btn-electric rounded-xl text-xs h-9 gap-1.5">
                  <Key size={14} /> {savingAdminRole ? "Assigning..." : "Assign Permissions"}
                </Button>
              </div>
            </form>

            {/* Existing Admin Team List */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Staff & Role Directory ({adminTeam.length + 1})
              </h3>

              {/* Dynamic Owner Notice using Vercel Secret Variable */}
              <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/20 text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-foreground">
                    {process.env.NEXT_PUBLIC_ADMIN_EMAIL || currentUser?.email || "Configured via Vercel Secret"}
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    Owner / Super Administrator (Configured via Vercel Secret Variable)
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  Super Administrator
                </span>
              </div>

              {/* Dynamic list from Firestore */}
              {adminTeam.map((member) => (
                <div key={member.id} className="p-3 rounded-xl bg-black/30 border border-white/10 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-foreground">{member.email}</span>
                    <span className="text-[11px] text-muted-foreground block">Added by {member.addedBy} • {new Date(member.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      member.role === 'super_admin'
                        ? 'bg-amber-400/10 text-amber-400 border-amber-400/30'
                        : 'bg-primary/10 text-primary border-primary/30'
                    }`}>
                      {member.role === 'super_admin' ? 'Super Administrator' : 'Administrator'}
                    </span>

                    <button
                      onClick={() => handleRevokeRole(member.id, member.email)}
                      className="text-muted-foreground hover:text-destructive p-1 rounded transition-colors"
                      title="Revoke Role"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIDE-OVER CANDIDATE DOSSIER DRAWER */}
      {/* ========================================================================= */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-[#0e1017] border-l border-white/10 h-full overflow-y-auto p-6 md:p-8 space-y-6 shadow-2xl">
            
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-black/40 border-2 border-primary/30 flex items-center justify-center shrink-0">
                  {selectedPartner.photoURL ? (
                    <img src={selectedPartner.photoURL} alt={selectedPartner.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">{selectedPartner.name}</h2>
                  <p className="text-xs text-primary font-medium">{selectedPartner.category}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">UID: {selectedPartner.uid}</p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPartner(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Stage Pipeline Selector */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recruitment Stage</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${PARTNER_STATUS_LABELS[selectedPartner.status]?.bg} ${PARTNER_STATUS_LABELS[selectedPartner.status]?.color}`}>
                  {PARTNER_STATUS_LABELS[selectedPartner.status]?.label}
                </span>
              </div>

              {canManagePartners(currentRole) ? (
                <>
                  <div className="flex flex-wrap gap-1.5">
                    {(['applied', 'screening', 'shortlisted', 'interview', 'onboarded', 'archived'] as PartnerStatus[]).map((st) => (
                      <button
                        key={st}
                        disabled={changingStatus}
                        onClick={() => handleStatusChange(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          selectedPartner.status === st
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-white/5 text-muted-foreground border-white/10 hover:border-white/20 hover:text-foreground"
                        }`}
                      >
                        {PARTNER_STATUS_LABELS[st].label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="checkbox"
                      id="notifyStatus"
                      checked={statusNotifyEmail}
                      onChange={(e) => setStatusNotifyEmail(e.target.checked)}
                      className="rounded border-white/20 text-primary focus:ring-primary h-3.5 w-3.5"
                    />
                    <label htmlFor="notifyStatus" className="text-xs text-muted-foreground cursor-pointer">
                      Send automated Resend notification email (<code className="text-primary">@updates.neubofy.in</code>) on status change
                    </label>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground italic">
                  🔒 Stage updates are restricted to Administrators and Super Administrators. Reviewers have evaluation and rating access.
                </p>
              )}
            </div>

            {/* Candidate Star Rating */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/10">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Specialist Rating</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleSetRating(star)}
                    className="p-1 text-amber-400 hover:scale-125 transition-transform"
                  >
                    <Star
                      size={18}
                      className={star <= (selectedPartner.rating || 0) ? "fill-amber-400" : "text-white/20"}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Contact & Links Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center gap-2.5 text-xs">
                <Mail size={14} className="text-primary shrink-0" />
                <span className="truncate">{selectedPartner.email}</span>
              </div>
              <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center gap-2.5 text-xs">
                <Phone size={14} className="text-primary shrink-0" />
                <span>{selectedPartner.phone || "No phone provided"}</span>
              </div>
            </div>

            {/* CV, Portfolio, GitHub Links */}
            <div className="flex flex-wrap gap-2">
              {selectedPartner.cvUrl && (
                <a
                  href={selectedPartner.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all font-medium"
                >
                  <FileText size={14} /> Open CV / Resume <ExternalLink size={10} />
                </a>
              )}
              {selectedPartner.portfolioUrl && (
                <a
                  href={selectedPartner.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-white/5 text-foreground border border-white/10 hover:bg-white/10 transition-all"
                >
                  <ExternalLink size={14} /> Portfolio Site
                </a>
              )}
              {selectedPartner.githubUrl && (
                <a
                  href={selectedPartner.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-[#24292F]/80 text-white border border-transparent hover:bg-[#24292F] transition-all"
                >
                  <Github size={14} /> GitHub Profile
                </a>
              )}
              {selectedPartner.linkedinUrl && (
                <a
                  href={selectedPartner.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs bg-[#0077b5]/20 text-[#0077b5] border border-[#0077b5]/30 hover:bg-[#0077b5]/30 transition-all"
                >
                  <Linkedin size={14} /> LinkedIn
                </a>
              )}
            </div>

            {/* Professional Bio */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Professional Summary & Bio</h3>
              <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-sm leading-relaxed text-foreground/90">
                {selectedPartner.bio || "No bio provided."}
              </div>
            </div>

            {/* Capabilities List */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Stated Capabilities</h3>
              <div className="flex flex-wrap gap-1.5">
                {selectedPartner.capabilities.map((c) => (
                  <span key={c} className="px-2.5 py-1 rounded-full text-xs bg-white/5 border border-white/10 text-muted-foreground">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Internal Assessment Notes Feed */}
            <div className="border-t border-white/10 pt-4 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <MessageSquare size={14} className="text-primary" /> Internal Review Notes ({selectedPartner.internalNotes?.length || 0})
              </h3>

              {selectedPartner.internalNotes && selectedPartner.internalNotes.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedPartner.internalNotes.map((note) => (
                    <div key={note.id} className="p-3 rounded-xl bg-black/30 border border-white/10 text-xs">
                      <div className="flex items-center justify-between text-muted-foreground mb-1">
                        <strong className="text-foreground">{note.authorEmail}</strong>
                        <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-muted-foreground/90">{note.note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No internal assessment notes logged yet.</p>
              )}

              <form onSubmit={handleAddNote} className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add evaluation note (e.g. Verified code sample, approved for interview...)"
                  className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <Button type="submit" disabled={submittingNote || !newNote.trim()} size="sm" className="rounded-xl btn-electric text-xs">
                  Post Note
                </Button>
              </form>
            </div>

            {/* Bottom Actions */}
            <div className="border-t border-white/10 pt-4 flex justify-between items-center">
              <Button
                variant="outline"
                onClick={() => setSelectedPartner(null)}
                className="rounded-xl border-white/10 text-xs"
              >
                Close Dossier
              </Button>
              {canSendPartnerEmails(currentRole) && (
                <Button
                  onClick={() => openEmailModal(selectedPartner)}
                  className="btn-electric rounded-xl text-xs gap-1.5"
                >
                  <Mail size={14} /> Dispatch Resend Email
                </Button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EMAIL MODAL (POWERED BY RESEND) */}
      {/* ========================================================================= */}
      {emailModalPartner && canSendPartnerEmails(currentRole) && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-[#0e1017] border border-white/10 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl">
            
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold">Email Communication Engine</h3>
                <p className="text-xs text-muted-foreground">
                  Sending branded Neubofy communication to <strong className="text-foreground">{emailModalPartner.name}</strong> ({emailModalPartner.email})
                </p>
              </div>
              <button
                onClick={() => setEmailModalPartner(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {emailFeedback && (
              <div className={`p-3 rounded-xl text-xs border ${emailFeedback.success ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-destructive/10 text-destructive border-destructive/30'}`}>
                {emailFeedback.message}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                Branded Email Template
              </label>
              <select
                value={emailTemplateType}
                onChange={(e) => setEmailTemplateType(e.target.value as any)}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
              >
                <option value="custom">Custom Message (compose subject & body below)</option>
                <option value="welcome">Welcome / Application Received Template</option>
                <option value="status_change">Recruitment Status Pipeline Template</option>
              </select>
            </div>

            {emailTemplateType === "status_change" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Select Stage</label>
                  <select
                    value={emailNewStatus}
                    onChange={(e) => setEmailNewStatus(e.target.value as PartnerStatus)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
                  >
                    <option value="screening">In Screening</option>
                    <option value="shortlisted">Shortlisted / Interview Invitation</option>
                    <option value="onboarded">Verified Partner Welcome</option>
                    <option value="archived">Application Update / Archive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Booking URL (Optional)</label>
                  <input
                    type="url"
                    value={emailBookingUrl}
                    onChange={(e) => setEmailBookingUrl(e.target.value)}
                    placeholder="https://booking.neubofy.in"
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">From Address</label>
                <select
                  value={emailSender}
                  onChange={(e) => setEmailSender(e.target.value as EmailSenderType)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
                >
                  <option value="careers">careers@updates.neubofy.in</option>
                  <option value="specialists">specialists@updates.neubofy.in</option>
                  <option value="onboarding">onboarding@updates.neubofy.in</option>
                  <option value="security">security@updates.neubofy.in</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Reply-To Address</label>
                <select
                  value={emailReplyTo}
                  onChange={(e) => setEmailReplyTo(e.target.value as ReplyToType)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
                >
                  <option value="careers@neubofy.in">careers@neubofy.in</option>
                  <option value="contact@neubofy.in">contact@neubofy.in</option>
                  <option value="support@neubofy.in">support@neubofy.in</option>
                </select>
              </div>
            </div>

            {emailTemplateType === "custom" && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Email Subject</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Subject line..."
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Message Content</label>
                  <textarea
                    rows={4}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Type message to partner..."
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
                  />
                </div>
              </div>
            )}

            <div className="p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] text-muted-foreground">
              🛡️ All outgoing emails are automatically wrapped in Neubofy’s dark-mode brand theme, featuring the official Neubofy logo and signature with links to Twitter, Telegram, LinkedIn, and Instagram.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEmailModalPartner(null)}
                className="rounded-xl border-white/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={sendingEmail}
                onClick={handleSendEmail}
                className="rounded-xl btn-electric text-xs gap-1.5"
              >
                <Send size={14} /> {sendingEmail ? "Dispatching..." : "Send via Resend"}
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
