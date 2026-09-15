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
import { AdminRole, canManagePartners, canSendPartnerEmails } from "@/lib/admin/rbac";
import { useAdmin } from "@/lib/admin/AdminContext";
import { recordAdminActivity, AuditLogEntry } from "@/lib/admin/team";
import { processPartnerStatusChange } from "@/app/actions/adminPartnerActions";
import { sendPartnerNotification } from "@/app/actions/sendPartnerEmail";
import { EmailSenderType, ReplyToType } from "@/lib/email/resend";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Search, 
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
  Clock, 
  Layers, 
  RefreshCw,
  Shield,
  ShieldAlert,
  Users,
  UserPlus,
  Trash2,
  LayoutGrid,
  Table as TableIcon,
  Check,
  TrendingUp,
  BarChart3,
  Activity,
  AlertCircle
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

  // Navigation between ATS Recruitment, Analytics, Track Record, and Team Access Management
  const [activeMainTab, setActiveMainTab] = useState<"recruitment" | "analytics" | "track_record" | "team">("recruitment");

  // View Mode: Grid Dossier Cards vs Compact Table View
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Candidate Data & State
  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [firestoreError, setFirestoreError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusTab, setStatusTab] = useState<string>("all");
  const [capabilityFilter, setCapabilityFilter] = useState<string>("all");

  // Action feedback / Toast notification
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Selected Partner for Slide-Over Dossier
  const [selectedPartner, setSelectedPartner] = useState<PartnerProfile | null>(null);

  // Internal Note form state
  const [newNote, setNewNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  // Status Change State inside Dossier
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusNotifyEmail, setStatusNotifyEmail] = useState(true);

  // Real-time Internal Audit Logs
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

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

  // Fetch candidate applications in real time
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

        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPartners(list);
        setFirestoreError(null);
        setLoading(false);

        if (selectedPartner) {
          const updated = list.find((p) => p.uid === selectedPartner.uid);
          if (updated) setSelectedPartner(updated);
        }
      }, (err) => {
        console.error("Firestore listener error on /users:", err);
        setFirestoreError(err.message || "Failed to load candidate applications from Firestore.");
        setLoading(false);
      });
    } catch (e) {
      console.error("Error setting up snapshot:", e);
      setFirestoreError(e instanceof Error ? e.message : "Error connecting to Firestore database.");
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [selectedPartner?.uid]);

  // Fetch Internal Audit Logs in real time
  useEffect(() => {
    let unsubscribe: () => void;
    try {
      const logsRef = collection(getFirebaseDb(), "audit_logs");
      unsubscribe = onSnapshot(logsRef, (snapshot) => {
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
        console.warn("Audit logs listener error:", err);
      });
    } catch (e) {
      console.warn("Error setting up audit logs snapshot:", e);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

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
              role: (data.role as AdminRole) || "admin",
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
    const matchStatus = 
      statusTab === "all" || 
      (statusTab === "applied" && (p.status === "applied" || p.status === "draft")) ||
      p.status === statusTab;
    const matchCapability = capabilityFilter === "all" || p.capabilities.includes(capabilityFilter);

    return matchSearch && matchCategory && matchStatus && matchCapability;
  });

  // KPI counts
  const counts = {
    total: partners.length,
    applied: partners.filter((p) => p.status === "applied" || p.status === "draft").length,
    screening: partners.filter((p) => p.status === "screening").length,
    shortlisted: partners.filter((p) => p.status === "shortlisted" || p.status === "interview").length,
    onboarded: partners.filter((p) => p.status === "onboarded").length,
    archived: partners.filter((p) => p.status === "archived").length,
  };

  const acceptanceRate = counts.total > 0 ? Math.round((counts.onboarded / counts.total) * 100) : 0;

  // Domain breakdown for analytics
  const categoryCounts: Record<string, number> = {};
  partners.forEach((p) => {
    const cat = p.category || "Unassigned";
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  });
  const sortedCategories = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);

  // 1-Click Accept Applicant
  const handleAcceptApplicant = async (partner: PartnerProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!canManagePartners(currentRole)) {
      setActionFeedback({ type: "error", message: "Permission Denied: Only Administrators can accept applicants." });
      return;
    }

    try {
      const docRef = doc(getFirebaseDb(), "users", partner.uid);
      await updateDoc(docRef, {
        status: "onboarded",
        verified: true,
        updatedAt: new Date().toISOString(),
      });

      await recordAdminActivity({
        actorEmail: currentUser?.email || "founder@neubofy.in",
        actorUid: currentUser?.uid || "admin",
        action: "ACCEPT_APPLICANT",
        targetId: partner.uid,
        targetName: partner.name,
        details: `Accepted and verified ${partner.name} (${partner.category}) into the Neubofy Specialist Network.`,
      });

      if (partner.email) {
        processPartnerStatusChange({
          partnerUid: partner.uid,
          partnerEmail: partner.email,
          partnerName: partner.name,
          category: partner.category,
          newStatus: "onboarded",
          notifyPartner: true,
        }).catch((emailErr) => console.warn("Accept email dispatch warning:", emailErr));
      }

      setActionFeedback({
        type: "success",
        message: `Accepted ${partner.name}! Status set to Verified Specialist & Onboarding email dispatched.`
      });
      setTimeout(() => setActionFeedback(null), 5000);
    } catch (err) {
      console.error("Error accepting applicant:", err);
      setActionFeedback({
        type: "error",
        message: `Failed to accept applicant: ${err instanceof Error ? err.message : "Unknown error"}`
      });
      setTimeout(() => setActionFeedback(null), 5000);
    }
  };

  // 1-Click Reject Applicant
  const handleRejectApplicant = async (partner: PartnerProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!canManagePartners(currentRole)) {
      setActionFeedback({ type: "error", message: "Permission Denied: Only Administrators can reject applicants." });
      return;
    }

    if (!confirm(`Decline and archive application for ${partner.name}?`)) {
      return;
    }

    try {
      const docRef = doc(getFirebaseDb(), "users", partner.uid);
      await updateDoc(docRef, {
        status: "archived",
        verified: false,
        updatedAt: new Date().toISOString(),
      });

      await recordAdminActivity({
        actorEmail: currentUser?.email || "founder@neubofy.in",
        actorUid: currentUser?.uid || "admin",
        action: "REJECT_APPLICANT",
        targetId: partner.uid,
        targetName: partner.name,
        details: `Archived/declined application for ${partner.name} (${partner.category}).`,
      });

      if (partner.email) {
        processPartnerStatusChange({
          partnerUid: partner.uid,
          partnerEmail: partner.email,
          partnerName: partner.name,
          category: partner.category,
          newStatus: "archived",
          notifyPartner: true,
        }).catch((emailErr) => console.warn("Reject email dispatch warning:", emailErr));
      }

      setActionFeedback({
        type: "success",
        message: `Declined application for ${partner.name}. Status updated to Archived.`
      });
      setTimeout(() => setActionFeedback(null), 5000);
    } catch (err) {
      console.error("Error rejecting applicant:", err);
      setActionFeedback({
        type: "error",
        message: `Failed to reject applicant: ${err instanceof Error ? err.message : "Unknown error"}`
      });
      setTimeout(() => setActionFeedback(null), 5000);
    }
  };

  // Add Internal Review Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner || !newNote.trim()) return;
    setSubmittingNote(true);

    try {
      const noteItem: InternalNote = {
        id: `note_${Date.now()}`,
        authorEmail: currentUser?.email || "founder@neubofy.in",
        note: newNote.trim(),
        createdAt: new Date().toISOString(),
      };

      const updatedNotes = [...(selectedPartner.internalNotes || []), noteItem];
      const docRef = doc(getFirebaseDb(), "users", selectedPartner.uid);
      await updateDoc(docRef, { internalNotes: updatedNotes });

      await recordAdminActivity({
        actorEmail: currentUser?.email || "founder@neubofy.in",
        actorUid: currentUser?.uid || "admin",
        action: "ADD_NOTE",
        targetId: selectedPartner.uid,
        targetName: selectedPartner.name,
        details: `Added review note on ${selectedPartner.name}`,
      });

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

      await recordAdminActivity({
        actorEmail: currentUser?.email || "founder@neubofy.in",
        actorUid: currentUser?.uid || "admin",
        action: "RATE_CANDIDATE",
        targetId: selectedPartner.uid,
        targetName: selectedPartner.name,
        details: `Assigned rating ${newRating}/5 to ${selectedPartner.name}`,
      });

      setSelectedPartner({ ...selectedPartner, rating: newRating });
    } catch (err) {
      console.error("Error updating rating", err);
    }
  };

  // Update Status from Dossier
  const handleStatusChange = async (newStatus: PartnerStatus) => {
    if (!selectedPartner) return;
    if (!canManagePartners(currentRole)) {
      alert("Permission Denied: Only Administrators can change recruitment stages.");
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

      await recordAdminActivity({
        actorEmail: currentUser?.email || "founder@neubofy.in",
        actorUid: currentUser?.uid || "admin",
        action: newStatus === "onboarded" ? "ACCEPT_APPLICANT" : newStatus === "archived" ? "REJECT_APPLICANT" : "STATUS_CHANGE",
        targetId: selectedPartner.uid,
        targetName: selectedPartner.name,
        details: `Updated stage to ${newStatus.toUpperCase()} for ${selectedPartner.name}`,
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

      setActionFeedback({
        type: "success",
        message: `Updated ${selectedPartner.name}'s stage to ${newStatus.toUpperCase()}.`
      });
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err) {
      console.error("Error changing status", err);
    } finally {
      setChangingStatus(false);
    }
  };

  // Open Email Modal
  const openEmailModal = (partner: PartnerProfile, defaultType: "welcome" | "status_change" | "custom" = "custom") => {
    if (!canSendPartnerEmails(currentRole)) {
      alert("Permission Denied: Only authorized administrators can dispatch outgoing emails.");
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
        newStatus: emailNewStatus,
        bookingUrl: emailBookingUrl,
        customSubject: emailSubject,
        customMessage: emailBody,
        replyTo: emailReplyTo,
      });

      if (res.success) {
        setEmailFeedback({
          success: true,
          message: res.simulated
            ? "Simulated dispatch (No RESEND_API_KEY set)."
            : `Email dispatched successfully! Message ID: ${res.messageId}`,
        });

        await recordAdminActivity({
          actorEmail: currentUser?.email || "founder@neubofy.in",
          actorUid: currentUser?.uid || "",
          action: "SEND_EMAIL",
          targetId: emailModalPartner.uid,
          targetName: emailModalPartner.name,
          details: `Sent ${emailTemplateType} email to ${emailModalPartner.email}`,
        });
      } else {
        setEmailFeedback({
          success: false,
          message: res.error || "Failed to dispatch email via Resend.",
        });
      }
    } catch (err) {
      setEmailFeedback({
        success: false,
        message: err instanceof Error ? err.message : "Error sending email.",
      });
    } finally {
      setSendingEmail(false);
    }
  };

  // Save/Invite Team Admin
  const handleSaveAdminRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) return;
    setSavingAdminRole(true);
    setAdminTeamSuccess("");
    setAdminTeamError("");

    const cleanEmail = newAdminEmail.toLowerCase().trim();
    if (!cleanEmail) {
      setAdminTeamError("Email is required.");
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
      }, { merge: true });

      await recordAdminActivity({
        actorEmail: currentUser?.email || "Super Administrator",
        actorUid: currentUser?.uid || "",
        action: "ASSIGN_ROLE",
        targetId: docId,
        targetName: cleanEmail,
        details: `Granted ${newAdminRole.toUpperCase()} role to ${cleanEmail}`,
      });

      setAdminTeamSuccess(`Successfully assigned ${newAdminRole.toUpperCase()} role to ${cleanEmail}.`);
      setNewAdminEmail("");
    } catch (err) {
      console.error("Error saving admin role", err);
      setAdminTeamError("Failed to save admin privilege in Firestore.");
    } finally {
      setSavingAdminRole(false);
    }
  };

  // Revoke Team Admin
  const handleRevokeRole = async (adminId: string, email: string) => {
    if (!isSuperAdmin) return;
    if (email === currentUser?.email) {
      alert("You cannot revoke your own Super Administrator role.");
      return;
    }
    const confirmRevoke = window.confirm(`Revoke admin access for ${email}?`);
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
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2.5">
            Specialist Recruitment Operations
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
              Talent ATS
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Logged in as <strong className="text-foreground">{currentUser?.email}</strong> • Role: <strong className="text-primary uppercase">{currentRole || "Staff"}</strong>
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-black/40 p-1.5 rounded-2xl border border-white/10 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveMainTab("recruitment")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeMainTab === "recruitment"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers size={13} /> Pipeline ({counts.total})
          </button>

          <button
            onClick={() => setActiveMainTab("analytics")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeMainTab === "analytics"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <BarChart3 size={13} /> Analytics
          </button>

          <button
            onClick={() => setActiveMainTab("track_record")}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeMainTab === "track_record"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Activity size={13} /> Track Record ({auditLogs.length})
          </button>

          {isSuperAdmin && (
            <button
              onClick={() => setActiveMainTab("team")}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeMainTab === "team"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users size={13} /> Admin Roles
            </button>
          )}
        </div>
      </div>

      {/* Action Feedback Banner / Toast */}
      {actionFeedback && (
        <div className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 animate-fade-in-up border ${
          actionFeedback.type === "success" 
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
            : "bg-destructive/10 text-destructive border-destructive/20"
        }`}>
          <div className="flex items-center gap-2">
            {actionFeedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{actionFeedback.message}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="hover:opacity-75">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Firestore Permissions Error Diagnostic Banner */}
      {firestoreError && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <ShieldAlert size={18} className="text-amber-400" />
            <span>Firestore Connection Issue: {firestoreError}</span>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            If you see &quot;Missing or insufficient permissions&quot;, verify that your Cloud Firestore Security Rules permit authenticated reads on the <code>/users</code> collection.
          </p>
          <div className="p-3 bg-black/50 rounded-xl font-mono text-[11px] text-foreground/90 border border-white/10">
            match /users/{`{userId}`} &#123; allow read: if request.auth != null; allow write: if request.auth != null; &#125;
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => window.location.reload()} 
            className="rounded-xl border-amber-500/30 text-amber-300 hover:bg-amber-500/10 text-xs gap-1.5 h-8 mt-1"
          >
            <RefreshCw size={12} /> Reload & Retry Connection
          </Button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: RECRUITMENT ATS PIPELINE */}
      {/* ========================================================================= */}
      {activeMainTab === "recruitment" && (
        <div className="space-y-6">
          
          {/* Recruitment Metric KPI Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "Total In Pool", count: counts.total, color: "text-foreground", border: "border-white/10" },
              { label: "New Applications", count: counts.applied, color: "text-blue-400", border: "border-blue-500/20" },
              { label: "In Screening", count: counts.screening, color: "text-indigo-400", border: "border-indigo-500/20" },
              { label: "Shortlisted", count: counts.shortlisted, color: "text-purple-400", border: "border-purple-500/20" },
              { label: "Accepted Specialists", count: counts.onboarded, color: "text-emerald-400", border: "border-emerald-500/20" },
              { label: "Declined / Archived", count: counts.archived, color: "text-zinc-400", border: "border-zinc-500/20" },
            ].map((kpi, idx) => (
              <div key={idx} className={`glass-card p-3.5 rounded-2xl border ${kpi.border} bg-[#0c0e15]/80`}>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  {kpi.label}
                </span>
                <span className={`text-xl sm:text-2xl font-bold ${kpi.color}`}>{kpi.count}</span>
              </div>
            ))}
          </div>

          {/* Search, Filter & View Mode Toolbar */}
          <div className="glass-card p-4 rounded-2xl border border-white/10 bg-[#0c0e15]/80 space-y-4">
            
            {/* Top Toolbar Row: Stage Filters & View Switcher */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
              {/* Pipeline Tabs */}
              <div className="flex overflow-x-auto pb-1 gap-1.5 text-xs max-w-full">
                {[
                  { key: "all", label: `All (${counts.total})` },
                  { key: "applied", label: `Applied (${counts.applied})` },
                  { key: "screening", label: `Screening (${counts.screening})` },
                  { key: "shortlisted", label: `Shortlisted (${counts.shortlisted})` },
                  { key: "onboarded", label: `Accepted (${counts.onboarded})` },
                  { key: "archived", label: `Declined (${counts.archived})` },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusTab(tab.key)}
                    className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                      statusTab === tab.key
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* View Switcher: Grid vs Table */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10 shrink-0 self-end sm:self-auto">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "grid" 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Grid Dossier Cards View"
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setViewMode("table")}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === "table" 
                      ? "bg-primary text-primary-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Compact ATS Table View"
                >
                  <TableIcon size={15} />
                </button>
              </div>
            </div>

            {/* Filter Bar Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
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
                    className="text-primary hover:underline text-xs"
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="glass-card p-12 rounded-2xl border border-white/10 text-center text-muted-foreground text-sm flex items-center justify-center gap-2 bg-[#0c0e15]/80">
              <RefreshCw className="animate-spin w-4 h-4 text-primary" /> Loading specialist applications...
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredPartners.length === 0 && (
            <div className="glass-card p-12 rounded-2xl border border-white/10 text-center bg-[#0c0e15]/80 space-y-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Users size={24} />
              </div>
              <h3 className="text-base font-semibold text-foreground">No Candidate Applications Found</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                {searchQuery || categoryFilter !== "all" || statusTab !== "all"
                  ? "No candidates matched your search or stage filters. Try adjusting your query."
                  : "No specialist applications have been submitted to Firestore yet. Applicants who complete onboarding at /career will appear here in real time."}
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Link href="/career/onboard" target="_blank">
                  <Button size="sm" variant="outline" className="rounded-xl text-xs border-white/10 gap-1.5">
                    <ExternalLink size={13} /> Open Application Form
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW MODE 1: GRID DOSSIER CARDS (EXECUTIVE VIEW) */}
          {/* ========================================================================= */}
          {!loading && filteredPartners.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredPartners.map((partner) => {
                const statusInfo = PARTNER_STATUS_LABELS[partner.status] || PARTNER_STATUS_LABELS.draft;
                return (
                  <div
                    key={partner.uid}
                    className="glass-card rounded-2xl border border-white/10 hover:border-primary/40 transition-all duration-300 p-5 bg-[#0c0e15]/90 flex flex-col justify-between space-y-4 group shadow-xl"
                  >
                    {/* Card Top: Avatar, Name, Category & Stage */}
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-black/50 border border-primary/30 flex items-center justify-center shrink-0">
                            {partner.photoURL ? (
                              <img src={partner.photoURL} alt={partner.name} className="w-full h-full object-cover" />
                            ) : (
                              <User size={22} className="text-primary/70" />
                            )}
                          </div>
                          <div>
                            <Link href={`/admin/specialists/${partner.uid}`} className="hover:text-primary transition-colors">
                              <h3 className="font-bold text-base text-foreground flex items-center gap-1.5">
                                {partner.name}
                                {partner.verified && (
                                  <CheckCircle2 size={14} className="text-emerald-400 fill-emerald-400/20" />
                                )}
                              </h3>
                            </Link>
                            <span className="text-xs text-primary font-medium block">{partner.category}</span>
                          </div>
                        </div>

                        {/* Stage Badge */}
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border shrink-0 ${statusInfo.bg} ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      {/* Contact Info Row */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground pt-1 border-t border-white/5">
                        <span className="flex items-center gap-1 truncate max-w-[180px]">
                          <Mail size={12} className="text-primary shrink-0" /> {partner.email}
                        </span>
                        {partner.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={12} className="text-primary shrink-0" /> {partner.phone}
                          </span>
                        )}
                      </div>

                      {/* Bio snippet if available */}
                      {partner.bio && (
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                          {partner.bio}
                        </p>
                      )}

                      {/* Capabilities Tag Pills */}
                      {partner.capabilities.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {partner.capabilities.slice(0, 3).map((cap) => (
                            <span
                              key={cap}
                              className="px-2 py-0.5 rounded-md text-[10px] bg-white/5 border border-white/10 text-muted-foreground"
                            >
                              {cap}
                            </span>
                          ))}
                          {partner.capabilities.length > 3 && (
                            <span className="text-[10px] text-primary self-center font-medium px-1">
                              +{partner.capabilities.length - 3} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* External Links & Portfolio */}
                      <div className="flex items-center gap-3 pt-2 text-xs">
                        {partner.cvUrl && (
                          <a
                            href={partner.cvUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
                          >
                            <FileText size={12} /> Resume / CV
                          </a>
                        )}
                        {partner.portfolioUrl && (
                          <a
                            href={partner.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                          >
                            <ExternalLink size={12} /> Portfolio
                          </a>
                        )}
                        {partner.githubUrl && (
                          <a
                            href={partner.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                            title="GitHub"
                          >
                            <Github size={13} />
                          </a>
                        )}
                        {partner.linkedinUrl && (
                          <a
                            href={partner.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                            title="LinkedIn"
                          >
                            <Linkedin size={13} />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Card Bottom: 1-Click Accept / Reject Action Toolbar */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {/* 1-Click Accept */}
                        <Button
                          size="sm"
                          onClick={(e) => handleAcceptApplicant(partner, e)}
                          disabled={partner.status === "onboarded"}
                          className={`h-8 px-2.5 text-xs rounded-xl font-medium gap-1 transition-all ${
                            partner.status === "onboarded"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                              : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                          }`}
                          title="Accept and verify applicant into specialist network"
                        >
                          <Check size={13} /> {partner.status === "onboarded" ? "Accepted" : "Accept"}
                        </Button>

                        {/* 1-Click Reject */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => handleRejectApplicant(partner, e)}
                          disabled={partner.status === "archived"}
                          className={`h-8 px-2.5 text-xs rounded-xl font-medium gap-1 transition-all ${
                            partner.status === "archived"
                              ? "border-zinc-700 text-zinc-500 cursor-default"
                              : "border-rose-500/30 text-rose-400 hover:bg-rose-500/15"
                          }`}
                          title="Decline and archive application"
                        >
                          <X size={13} /> Reject
                        </Button>
                      </div>

                      {/* Review & Email Actions */}
                      <div className="flex items-center gap-1">
                        <Link href={`/admin/specialists/${partner.uid}`}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 px-2.5 text-xs rounded-xl border-white/10 hover:bg-white/10 gap-1 font-medium"
                          >
                            <Eye size={12} /> Dossier
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEmailModal(partner)}
                          className="h-8 w-8 p-0 rounded-xl border-white/10 hover:bg-white/10 text-primary"
                          title="Dispatch Email"
                        >
                          <Mail size={13} />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW MODE 2: HIGH-DENSITY ATS TABLE VIEW */}
          {/* ========================================================================= */}
          {!loading && filteredPartners.length > 0 && viewMode === "table" && (
            <div className="glass-card rounded-2xl border border-white/10 overflow-hidden bg-[#0c0e15]/80 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-black/40 text-muted-foreground border-b border-white/10 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-3.5 px-4">Candidate</th>
                      <th className="py-3.5 px-4">Category / Domain</th>
                      <th className="py-3.5 px-4">Key Capabilities</th>
                      <th className="py-3.5 px-4">Stage</th>
                      <th className="py-3.5 px-4">Rating</th>
                      <th className="py-3.5 px-4">Applied</th>
                      <th className="py-3.5 px-4 text-right">Quick Decision</th>
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
                                <span className="font-semibold text-foreground text-sm block flex items-center gap-1">
                                  {partner.name}
                                  {partner.verified && (
                                    <CheckCircle2 size={12} className="text-emerald-400" />
                                  )}
                                </span>
                                <span className="text-[11px] text-muted-foreground/80">{partner.email}</span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4 max-w-[180px]">
                            <span className="font-medium text-foreground truncate block">{partner.category}</span>
                          </td>

                          <td className="py-3.5 px-4 max-w-[220px]">
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
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border ${statusInfo.bg} ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-0.5 text-amber-400">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  size={11}
                                  className={star <= (partner.rating || 0) ? "fill-amber-400" : "text-white/20"}
                                />
                              ))}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap text-muted-foreground text-[11px]">
                            {new Date(partner.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 1-Click Accept */}
                              <Button
                                size="sm"
                                onClick={(e) => handleAcceptApplicant(partner, e)}
                                disabled={partner.status === "onboarded"}
                                className={`h-7 px-2 text-xs rounded-lg font-medium gap-1 ${
                                  partner.status === "onboarded"
                                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                                }`}
                                title="Accept Applicant"
                              >
                                <Check size={12} /> Accept
                              </Button>

                              {/* 1-Click Reject */}
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => handleRejectApplicant(partner, e)}
                                disabled={partner.status === "archived"}
                                className={`h-7 px-2 text-xs rounded-lg font-medium gap-1 ${
                                  partner.status === "archived"
                                    ? "border-zinc-700 text-zinc-500 cursor-default"
                                    : "border-rose-500/30 text-rose-400 hover:bg-rose-500/15"
                                }`}
                                title="Reject Applicant"
                              >
                                <X size={12} /> Reject
                              </Button>

                              <Link href={`/admin/specialists/${partner.uid}`}>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 px-2.5 text-xs rounded-lg border-white/10 hover:bg-white/10 gap-1"
                                >
                                  <Eye size={12} />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ATS ANALYTICS & TALENT INTELLIGENCE */}
      {/* ========================================================================= */}
      {activeMainTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-6 rounded-3xl border border-primary/20 bg-[#0c0e15]/90 space-y-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <TrendingUp size={14} className="text-primary" /> Funnel Conversion Rate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-foreground">{acceptanceRate}%</span>
                <span className="text-xs text-muted-foreground">acceptance rate</span>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                {counts.onboarded} accepted specialists from a total talent pool of {counts.total} applicants.
              </p>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c0e15]/90 space-y-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <Clock size={14} className="text-indigo-400" /> Active Pipeline Load
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-indigo-400">{counts.screening + counts.shortlisted}</span>
                <span className="text-xs text-muted-foreground">in active evaluation</span>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                {counts.screening} in screening review, {counts.shortlisted} in interview stages.
              </p>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c0e15]/90 space-y-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-semibold flex items-center gap-1.5">
                <Shield size={14} className="text-emerald-400" /> Network Quality Index
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-emerald-400">
                  {partners.filter(p => (p.rating || 0) >= 4).length}
                </span>
                <span className="text-xs text-muted-foreground">top-rated (4-5 stars)</span>
              </div>
              <p className="text-xs text-muted-foreground pt-1">
                Vetted against Neubofy technical orchestration standards.
              </p>
            </div>
          </div>

          {/* Domain Distribution Breakdown */}
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0c0e15]/90 space-y-5">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <BarChart3 size={18} className="text-primary" /> Specialist Domain Distribution
            </h2>
            <p className="text-xs text-muted-foreground">
              Real-time talent concentration across core technical disciplines.
            </p>

            <div className="space-y-3 pt-2">
              {sortedCategories.map(([category, count]) => {
                const pct = counts.total > 0 ? Math.round((count / counts.total) * 100) : 0;
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-foreground">{category}</span>
                      <span className="text-muted-foreground">{count} specialists ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: TRACK RECORD & INTERNAL AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeMainTab === "track_record" && (
        <div className="space-y-6">
          <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0c0e15]/90 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  <Activity size={18} className="text-primary" /> Internal Track Record & Audit Feed
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Chronological trail of administrative decisions, candidate stage changes, and evaluations.
                </p>
              </div>
              <span className="text-xs font-mono bg-white/5 px-3 py-1 rounded-xl border border-white/10 text-muted-foreground">
                {auditLogs.length} logged events
              </span>
            </div>

            {auditLogs.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-xs">
                No administrative audit actions recorded yet. Decisions made on candidates will appear here in real time.
              </div>
            ) : (
              <div className="space-y-3 pt-3">
                {auditLogs.map((log) => {
                  const isAccept = log.action === "ACCEPT_APPLICANT";
                  const isReject = log.action === "REJECT_APPLICANT";
                  return (
                    <div
                      key={log.id}
                      className="p-4 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                            isAccept
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : isReject
                              ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                              : "bg-primary/10 text-primary border-primary/20"
                          }`}>
                            {log.action.replace("_", " ")}
                          </span>
                          <span className="text-muted-foreground text-[11px]">
                            by <strong className="text-foreground">{log.actorEmail}</strong>
                          </span>
                        </div>
                        <p className="text-foreground font-medium">{log.details}</p>
                      </div>

                      <span className="text-[11px] text-muted-foreground/80 shrink-0 font-mono">
                        {new Date(log.timestamp).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: TEAM ACCESS MANAGEMENT (SUPER ADMIN ONLY) */}
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
              <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs flex items-center justify-between">
                <span>{adminTeamSuccess}</span>
                <button onClick={() => setAdminTeamSuccess("")}><X size={14} /></button>
              </div>
            )}

            {adminTeamError && (
              <div className="p-3 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl text-xs flex items-center justify-between">
                <span>{adminTeamError}</span>
                <button onClick={() => setAdminTeamError("")}><X size={14} /></button>
              </div>
            )}

            {/* Invite Form */}
            <form onSubmit={handleSaveAdminRole} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Grant Admin Access
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  required
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="team.member@neubofy.in"
                  className="sm:col-span-2 px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value as AdminRole)}
                  className="px-3 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option value="admin">Administrator</option>
                  <option value="super_admin">Super Administrator</option>
                </select>
              </div>
              <Button type="submit" disabled={savingAdminRole} className="btn-electric rounded-xl text-xs h-9 gap-1.5">
                <UserPlus size={14} /> {savingAdminRole ? "Assigning..." : "Authorize Access"}
              </Button>
            </form>

            {/* Team Members List */}
            <div className="space-y-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                Authorized Personnel ({adminTeam.length})
              </span>
              <div className="divide-y divide-white/5 rounded-2xl bg-black/30 border border-white/10 overflow-hidden">
                {adminTeam.map((member) => (
                  <div key={member.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-semibold text-foreground block">{member.email}</span>
                      <span className="text-[11px] text-muted-foreground">
                        Role: <strong className="text-primary uppercase">{member.role}</strong> • Added by {member.addedBy || "Owner"}
                      </span>
                    </div>
                    {member.email !== currentUser?.email && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRevokeRole(member.id, member.email)}
                        className="h-8 px-2.5 rounded-xl border-rose-500/30 text-rose-400 hover:bg-rose-500/10 text-xs gap-1"
                      >
                        <Trash2 size={12} /> Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SLIDE-OVER CANDIDATE DOSSIER DRAWER */}
      {/* ========================================================================= */}
      {selectedPartner && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
          <div className="w-full max-w-2xl bg-[#0c0e15] border-l border-white/10 h-full overflow-y-auto p-6 space-y-6 shadow-2xl">
            
            {/* Drawer Header */}
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-black/50 border border-primary/30 flex items-center justify-center shrink-0">
                  {selectedPartner.photoURL ? (
                    <img src={selectedPartner.photoURL} alt={selectedPartner.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={22} className="text-primary" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-1.5">
                    {selectedPartner.name}
                    {selectedPartner.verified && (
                      <CheckCircle2 size={14} className="text-emerald-400" />
                    )}
                  </h2>
                  <span className="text-xs text-primary font-medium">{selectedPartner.category}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPartner(null)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Quick Decision Actions Inside Drawer */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-muted-foreground">Direct Decision:</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => handleAcceptApplicant(selectedPartner)}
                  disabled={selectedPartner.status === "onboarded"}
                  className="btn-electric rounded-xl text-xs h-8 gap-1.5 font-medium"
                >
                  <Check size={13} /> {selectedPartner.status === "onboarded" ? "Verified Specialist" : "Accept Candidate"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleRejectApplicant(selectedPartner)}
                  disabled={selectedPartner.status === "archived"}
                  className="rounded-xl border-rose-500/30 text-rose-400 hover:bg-rose-500/15 text-xs h-8 gap-1.5 font-medium"
                >
                  <X size={13} /> Reject Candidate
                </Button>
              </div>
            </div>

            {/* Stage Progression Buttons */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Change Recruitment Stage
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(['applied', 'screening', 'shortlisted', 'interview', 'onboarded', 'archived'] as PartnerStatus[]).map((st) => (
                  <button
                    key={st}
                    disabled={changingStatus}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      selectedPartner.status === st
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-white/5 text-muted-foreground border-white/10 hover:border-white/20 hover:text-foreground"
                    }`}
                  >
                    {PARTNER_STATUS_LABELS[st].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact & Links */}
            <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 text-xs">
              <span className="font-semibold text-foreground block">Contact Information</span>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail size={13} className="text-primary" /> {selectedPartner.email}
              </p>
              {selectedPartner.phone && (
                <p className="text-muted-foreground flex items-center gap-2">
                  <Phone size={13} className="text-primary" /> {selectedPartner.phone}
                </p>
              )}
              <div className="flex flex-wrap gap-3 pt-2">
                {selectedPartner.cvUrl && (
                  <a
                    href={selectedPartner.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                  >
                    <FileText size={13} /> View Resume / CV
                  </a>
                )}
                {selectedPartner.portfolioUrl && (
                  <a
                    href={selectedPartner.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink size={13} /> Portfolio
                  </a>
                )}
                <Link href={`/admin/specialists/${selectedPartner.uid}`}>
                  <span className="inline-flex items-center gap-1 text-indigo-400 hover:underline">
                    <Eye size={13} /> Open Full Dossier Page →
                  </span>
                </Link>
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Technical Rating
              </span>
              <div className="flex items-center gap-1 text-amber-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleSetRating(star)}
                    className="hover:scale-125 transition-transform"
                  >
                    <Star
                      size={22}
                      className={star <= (selectedPartner.rating || 0) ? "fill-amber-400" : "text-white/20"}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Bio & Capabilities */}
            {selectedPartner.bio && (
              <div className="space-y-1 text-xs">
                <span className="font-semibold text-muted-foreground uppercase tracking-wider block">Specialist Bio</span>
                <p className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-muted-foreground leading-relaxed">
                  {selectedPartner.bio}
                </p>
              </div>
            )}

            {selectedPartner.capabilities.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                  Capabilities & Technologies
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPartner.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="px-2.5 py-1 rounded-xl text-xs bg-white/5 border border-white/10 text-foreground"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Internal Notes Thread */}
            <div className="space-y-3 pt-2 border-t border-white/10">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Internal Review Notes ({selectedPartner.internalNotes?.length || 0})
              </span>

              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={3}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add evaluation note or interview feedback..."
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none"
                />
                <Button type="submit" disabled={submittingNote || !newNote.trim()} size="sm" className="btn-electric rounded-xl text-xs h-8">
                  {submittingNote ? "Saving..." : "Save Note"}
                </Button>
              </form>

              <div className="space-y-2">
                {selectedPartner.internalNotes?.map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs space-y-1">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>{n.authorEmail}</span>
                      <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-foreground">{n.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RESEND EMAIL DISPATCH MODAL */}
      {/* ========================================================================= */}
      {emailModalPartner && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[#0c0e15] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Mail size={16} className="text-primary" /> Dispatch Notification to Candidate
                </h3>
                <p className="text-xs text-muted-foreground">Recipient: {emailModalPartner.email}</p>
              </div>
              <button onClick={() => setEmailModalPartner(null)} className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            {emailFeedback && (
              <div className={`p-3 rounded-xl text-xs border ${
                emailFeedback.success ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
              }`}>
                {emailFeedback.message}
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-muted-foreground mb-1">Email Template</label>
                <select
                  value={emailTemplateType}
                  onChange={(e) => setEmailTemplateType(e.target.value as "welcome" | "status_change" | "custom")}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-foreground focus:outline-none"
                >
                  <option value="welcome">Welcome / Application Received</option>
                  <option value="status_change">Stage Progression Update</option>
                  <option value="custom">Custom Message</option>
                </select>
              </div>

              {emailTemplateType === "status_change" && (
                <div>
                  <label className="block font-medium text-muted-foreground mb-1">Target Stage</label>
                  <select
                    value={emailNewStatus}
                    onChange={(e) => setEmailNewStatus(e.target.value as PartnerStatus)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-foreground focus:outline-none"
                  >
                    <option value="screening">Move to Screening</option>
                    <option value="interview">Invite to Interview</option>
                    <option value="onboarded">Accept & Verify Specialist</option>
                    <option value="archived">Application Update (Declined)</option>
                  </select>
                </div>
              )}

              {emailTemplateType === "custom" && (
                <>
                  <div>
                    <label className="block font-medium text-muted-foreground mb-1">Subject</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-foreground focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-muted-foreground mb-1">Message Body</label>
                    <textarea
                      rows={4}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-foreground focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setEmailModalPartner(null)} className="rounded-xl border-white/10 text-xs">
                  Cancel
                </Button>
                <Button size="sm" disabled={sendingEmail} onClick={handleSendEmail} className="btn-electric rounded-xl text-xs gap-1.5">
                  <Send size={13} /> {sendingEmail ? "Sending..." : "Dispatch Email"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
