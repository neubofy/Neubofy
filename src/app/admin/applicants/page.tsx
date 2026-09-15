"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getFirebaseDb } from "@/lib/firebase/firebase";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { 
  PartnerProfile, 
  PartnerStatus, 
  PARTNER_CATEGORIES, 
  STANDARD_CAPABILITIES, 
  PARTNER_STATUS_LABELS 
} from "@/lib/partner/types";
import { useAdmin } from "@/lib/admin/AdminContext";
import { canDeleteApplicant, canExportData } from "@/lib/admin/rbac";
import { 
  recordAdminActivity, 
  getApplicantId, 
  deleteApplicantRecord 
} from "@/lib/admin/team";
import { sendPartnerNotification } from "@/app/actions/sendPartnerEmail";
import { 
  getScreeningTemplate, 
  getInterviewInvitationTemplate, 
  getVerifiedWelcomeTemplate, 
  getApplicationUpdateTemplate 
} from "@/lib/email/templates";
import { adminCache, exportToCsv, exportToJson } from "@/lib/admin/dataCache";
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
  Send, 
  Eye, 
  FileText, 
  Github, 
  Linkedin, 
  RefreshCw,
  LayoutGrid,
  Table as TableIcon,
  Check,
  Users,
  AlertCircle,
  Trash2,
  Download,
  Calendar,
  Video,
  Code2,
  Sparkles,
  Layers,
  Sliders,
  FileCheck2
} from "lucide-react";

export default function ApplicantsPipelinePage() {
  const { user: currentUser, role: currentRole, isSuperAdmin, communicationEmail } = useAdmin();
  const router = useRouter();

  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusTab, setStatusTab] = useState<string>("all");
  const [capabilityFilter, setCapabilityFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Feedback Notification
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Super Admin Delete Modal State
  const [deleteModalPartner, setDeleteModalPartner] = useState<PartnerProfile | null>(null);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [isDeletingApplicant, setIsDeletingApplicant] = useState(false);

  // Email / Status Review Modal State
  const [emailModalPartner, setEmailModalPartner] = useState<PartnerProfile | null>(null);
  const [isStatusTransition, setIsStatusTransition] = useState(false);
  const [targetStatus, setTargetStatus] = useState<PartnerStatus>("interview");
  const [editorMode, setEditorMode] = useState<"basic" | "advanced">("basic");

  // Basic Editor Step-Specific Fields
  const [subjectInput, setSubjectInput] = useState("");
  const [customNoteInput, setCustomNoteInput] = useState("");
  const [meetingUrlInput, setMeetingUrlInput] = useState("");
  const [scheduledAtInput, setScheduledAtInput] = useState("");
  const [timezoneInput, setTimezoneInput] = useState("IST");
  const [interviewerNameInput, setInterviewerNameInput] = useState("");
  const [agendaNotesInput, setAgendaNotesInput] = useState("System architecture review, past code repositories, and project coordination standards.");
  const [prepTipsInput, setPrepTipsInput] = useState("Please prepare 1-2 representative code repositories or design decisions ready to walk through.");
  const [requestDocsCheck, setRequestDocsCheck] = useState(true);
  const [docChecklistInput, setDocChecklistInput] = useState("GitHub repositories, architecture diagrams, live web app/API deployments, or code audit reports.");

  // Advanced Raw HTML State
  const [rawHtmlInput, setRawHtmlInput] = useState("");
  const [showLiveHtmlPreview, setShowLiveHtmlPreview] = useState(false);

  // Reply-To Selector State
  const [selectedReplyToOption, setSelectedReplyToOption] = useState<string>("default");
  const [customReplyToInput, setCustomReplyToInput] = useState("");

  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchFeedback, setDispatchFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch candidate applications with caching
  const loadApplicantsData = (bypassCache = false) => {
    if (!bypassCache) {
      const cached = adminCache.get<PartnerProfile[]>("applicants");
      if (cached) {
        setPartners(cached);
        setLastUpdated(adminCache.getTimestamp("applicants"));
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    try {
      const usersRef = collection(getFirebaseDb(), "users");
      const unsubscribe = onSnapshot(usersRef, (snapshot) => {
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
        adminCache.set("applicants", list);
        setPartners(list);
        setLastUpdated(Date.now());
        setLoading(false);
      }, (err) => {
        console.error("Firestore listener error on /users:", err);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error("Error setting up snapshot:", e);
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = loadApplicantsData(false);
    return () => {
      if (unsub) unsub();
    };
  }, []);

  // Compute Active Reply-To Email
  const effectiveReplyTo = useMemo(() => {
    if (selectedReplyToOption === "communication" && communicationEmail) {
      return communicationEmail;
    }
    if (selectedReplyToOption === "profile" && currentUser?.email) {
      return currentUser.email;
    }
    if (selectedReplyToOption === "custom" && customReplyToInput.trim()) {
      return customReplyToInput.trim();
    }
    if (selectedReplyToOption === "support") {
      return "support@neubofy.in";
    }
    if (selectedReplyToOption === "contact") {
      return "contact@neubofy.in";
    }
    return "careers@neubofy.in";
  }, [selectedReplyToOption, communicationEmail, currentUser, customReplyToInput]);

  // Open Review & Email Modal
  const openReviewModal = (partner: PartnerProfile, newStatus: PartnerStatus, isTransition = true, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEmailModalPartner(partner);
    setTargetStatus(newStatus);
    setIsStatusTransition(isTransition);
    setEditorMode("basic");
    setShowLiveHtmlPreview(false);
    setDispatchFeedback(null);

    // Initial Reply-To selection
    if (communicationEmail) {
      setSelectedReplyToOption("communication");
    } else if (currentUser?.email) {
      setSelectedReplyToOption("profile");
    } else {
      setSelectedReplyToOption("careers");
    }

    setInterviewerNameInput(currentUser?.displayName || currentUser?.email || "Neubofy Technical Lead");
    setCustomNoteInput("");
    setMeetingUrlInput("");
    setScheduledAtInput("");

    // Step-Specific defaults
    if (newStatus === "screening") {
      setSubjectInput(`Technical Screening Active: ${partner.category} — Neubofy Specialist Network`);
      setRequestDocsCheck(true);
    } else if (newStatus === "interview") {
      setSubjectInput(`Technical Interview Call: Neubofy Specialist Network`);
    } else if (newStatus === "onboarded") {
      setSubjectInput(`Welcome to the Neubofy Specialist Network — Verified Specialist`);
    } else if (newStatus === "archived") {
      setSubjectInput(`Update regarding your application — Neubofy Specialist Network`);
    } else {
      setSubjectInput(`Communication regarding your Neubofy Specialist Application`);
    }

    // Pre-generate HTML
    let generated;
    if (newStatus === "screening") {
      generated = getScreeningTemplate(partner.name, { category: partner.category, requestDocs: true });
    } else if (newStatus === "interview") {
      generated = getInterviewInvitationTemplate(partner.name);
    } else if (newStatus === "onboarded") {
      generated = getVerifiedWelcomeTemplate(partner.name, partner.category);
    } else if (newStatus === "archived") {
      generated = getApplicationUpdateTemplate(partner.name);
    } else {
      generated = getScreeningTemplate(partner.name);
    }
    setRawHtmlInput(generated.html);
  };

  // Re-generate preview HTML from current fields
  const currentRenderedHtml = useMemo(() => {
    if (!emailModalPartner) return "";
    if (editorMode === "advanced") return rawHtmlInput;

    if (targetStatus === "screening") {
      return getScreeningTemplate(emailModalPartner.name, {
        category: emailModalPartner.category,
        requestDocs: requestDocsCheck,
        docChecklist: docChecklistInput,
        customNote: customNoteInput,
      }).html;
    }
    if (targetStatus === "interview") {
      return getInterviewInvitationTemplate(emailModalPartner.name, {
        meetingUrl: meetingUrlInput,
        scheduledAt: scheduledAtInput,
        timezone: timezoneInput,
        interviewerName: interviewerNameInput,
        agendaNotes: agendaNotesInput,
        preparationTips: prepTipsInput,
        customNote: customNoteInput,
      }).html;
    }
    if (targetStatus === "onboarded") {
      return getVerifiedWelcomeTemplate(emailModalPartner.name, emailModalPartner.category, customNoteInput).html;
    }
    if (targetStatus === "archived") {
      return getApplicationUpdateTemplate(emailModalPartner.name, customNoteInput).html;
    }
    return getScreeningTemplate(emailModalPartner.name).html;
  }, [
    emailModalPartner,
    editorMode,
    targetStatus,
    rawHtmlInput,
    requestDocsCheck,
    docChecklistInput,
    customNoteInput,
    meetingUrlInput,
    scheduledAtInput,
    timezoneInput,
    interviewerNameInput,
    agendaNotesInput,
    prepTipsInput,
  ]);

  // Choice 1: Update status silently without sending email
  const handleUpdateStatusSilently = async () => {
    if (!emailModalPartner) return;
    setIsDispatching(true);

    try {
      const docRef = doc(getFirebaseDb(), "users", emailModalPartner.uid);
      const isVerified = targetStatus === "onboarded";

      await updateDoc(docRef, {
        status: targetStatus,
        verified: isVerified,
        updatedAt: new Date().toISOString(),
      });

      await recordAdminActivity({
        actorEmail: currentUser?.email || "Super Administrator",
        actorUid: currentUser?.uid || "admin",
        action: targetStatus === "onboarded" ? "ACCEPT_APPLICANT" : targetStatus === "archived" ? "REJECT_APPLICANT" : "STATUS_CHANGE",
        targetId: emailModalPartner.uid,
        targetName: emailModalPartner.name,
        details: `Updated applicant status to '${targetStatus.toUpperCase()}' without email dispatch.`,
      });

      adminCache.invalidate("applicants");
      setEmailModalPartner(null);
      setActionFeedback({
        type: "success",
        message: `Updated status for ${emailModalPartner.name} to ${targetStatus.toUpperCase()} (no email sent).`,
      });
      setTimeout(() => setActionFeedback(null), 4000);
    } catch (err) {
      console.error("Error updating status silently:", err);
      alert("Failed to update status.");
    } finally {
      setIsDispatching(false);
    }
  };

  // Choice 2: Send email and apply status
  const handleDispatchEmailAndConfirm = async () => {
    if (!emailModalPartner) return;
    setIsDispatching(true);
    setDispatchFeedback(null);

    try {
      const docRef = doc(getFirebaseDb(), "users", emailModalPartner.uid);
      const isVerified = targetStatus === "onboarded";

      const updatePayload: Record<string, any> = {
        status: targetStatus,
        verified: isVerified,
        updatedAt: new Date().toISOString(),
      };

      if (targetStatus === "interview" && meetingUrlInput) {
        updatePayload.interviewMeetingUrl = meetingUrlInput;
        updatePayload.interviewScheduledAt = scheduledAtInput;
        updatePayload.interviewTimezone = timezoneInput;
        updatePayload.interviewerName = interviewerNameInput;
      }

      await updateDoc(docRef, updatePayload);

      let emailRes;
      if (editorMode === "advanced") {
        emailRes = await sendPartnerNotification({
          partnerEmail: emailModalPartner.email,
          partnerName: emailModalPartner.name,
          type: "raw_html",
          customSubject: subjectInput,
          customHtml: rawHtmlInput,
          replyTo: effectiveReplyTo,
        });
      } else {
        emailRes = await sendPartnerNotification({
          partnerEmail: emailModalPartner.email,
          partnerName: emailModalPartner.name,
          category: emailModalPartner.category,
          type: "status_change",
          newStatus: targetStatus,
          customSubject: subjectInput,
          customNote: customNoteInput,
          screeningDetails: targetStatus === "screening" ? {
            category: emailModalPartner.category,
            requestDocs: requestDocsCheck,
            docChecklist: docChecklistInput,
            customNote: customNoteInput,
          } : undefined,
          meetingDetails: targetStatus === "interview" ? {
            meetingUrl: meetingUrlInput,
            scheduledAt: scheduledAtInput,
            timezone: timezoneInput,
            interviewerName: interviewerNameInput,
            agendaNotes: agendaNotesInput,
            preparationTips: prepTipsInput,
            customNote: customNoteInput,
          } : undefined,
          replyTo: effectiveReplyTo,
        });
      }

      await recordAdminActivity({
        actorEmail: currentUser?.email || "Super Administrator",
        actorUid: currentUser?.uid || "admin",
        action: targetStatus === "onboarded" ? "ACCEPT_APPLICANT" : targetStatus === "archived" ? "REJECT_APPLICANT" : "STATUS_CHANGE",
        targetId: emailModalPartner.uid,
        targetName: emailModalPartner.name,
        details: `Updated status to '${targetStatus.toUpperCase()}' and dispatched email to ${emailModalPartner.email} (Reply-To: ${effectiveReplyTo})`,
      });

      adminCache.invalidate("applicants");

      setDispatchFeedback({
        success: true,
        message: emailRes.simulated
          ? "Status updated and simulated email logged."
          : `Status updated and notification delivered to ${emailModalPartner.email}!`,
      });

      setTimeout(() => {
        setEmailModalPartner(null);
        setDispatchFeedback(null);
      }, 1500);
    } catch (err: unknown) {
      console.error("Error dispatching email and updating status:", err);
      setDispatchFeedback({
        success: false,
        message: err instanceof Error ? err.message : "Failed to update status and send email.",
      });
    } finally {
      setIsDispatching(false);
    }
  };

  // Filtered partners
  const filteredPartners = partners.filter((p) => {
    const applicantId = getApplicantId(p.uid).toLowerCase();
    const query = searchQuery.toLowerCase().trim();

    const matchSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.email.toLowerCase().includes(query) ||
      p.phone.includes(query) ||
      applicantId.includes(query) ||
      p.capabilities.some((c) => c.toLowerCase().includes(query));

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

  const categoryCounts = PARTNER_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = partners.filter((p) => p.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  // Super Administrator: Hard Delete Applicant
  const handleConfirmDeleteApplicant = async () => {
    if (!deleteModalPartner) return;
    if (deleteConfirmationInput !== "DELETE") {
      alert("Please type DELETE to confirm permanent deletion.");
      return;
    }

    setIsDeletingApplicant(true);
    const target = deleteModalPartner;

    const res = await deleteApplicantRecord(
      target.uid,
      currentUser?.email || "Super Administrator",
      currentUser?.uid || "",
      target.name
    );

    setIsDeletingApplicant(false);
    if (res.success) {
      setDeleteModalPartner(null);
      setDeleteConfirmationInput("");
      adminCache.invalidate("applicants");
      setActionFeedback({
        type: "success",
        message: `Permanently deleted application record for ${target.name} (${getApplicantId(target.uid)}).`
      });
      setTimeout(() => setActionFeedback(null), 5000);
    } else {
      alert(`Error deleting record: ${res.error}`);
    }
  };

  // Data Export Actions
  const handleExportCsv = () => {
    const exportData = filteredPartners.map((p) => ({
      ApplicantID: getApplicantId(p.uid),
      Name: p.name,
      Email: p.email,
      Phone: p.phone,
      Category: p.category,
      Capabilities: p.capabilities.join(", "),
      Status: p.status,
      Rating: p.rating,
      CV_URL: p.cvUrl,
      Portfolio_URL: p.portfolioUrl,
      GitHub_URL: p.githubUrl,
      LinkedIn_URL: p.linkedinUrl,
      Bio: p.bio,
      CreatedAt: p.createdAt,
      UpdatedAt: p.updatedAt,
    }));
    exportToCsv(exportData, `neubofy_applicants_${new Date().toISOString().slice(0, 10)}`);
  };

  const handleExportJson = () => {
    exportToJson(filteredPartners, `neubofy_applicants_${new Date().toISOString().slice(0, 10)}`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in pb-12">
      
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Admin
            </Link>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs text-primary font-semibold">Candidate Pipeline</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Users size={22} className="text-primary" /> Specialist Candidate Applications
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Evaluate incoming technical profiles, review email notifications before dispatching, and manage verification status.
          </p>
        </div>

        {/* Global Pipeline Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {canExportData(currentRole) && (
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleExportCsv}
                className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
                title="Export Filtered Candidates to CSV"
              >
                <Download size={12} /> CSV
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleExportJson}
                className="h-7 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
                title="Export Filtered Candidates to JSON"
              >
                <Download size={12} /> JSON
              </Button>
            </div>
          )}

          <Button
            size="sm"
            variant="outline"
            onClick={() => loadApplicantsData(true)}
            className="h-9 px-3 rounded-xl border-white/10 text-xs gap-1.5 hover:bg-white/5"
            title="Force refresh data from Firestore"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            {lastUpdated ? `Sync (${Math.round((Date.now() - lastUpdated) / 1000)}s ago)` : "Sync Data"}
          </Button>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-black/40 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "grid" ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Dossier Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                viewMode === "table" ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
              }`}
              title="Compact Table View"
            >
              <TableIcon size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className={`p-4 rounded-2xl border text-xs font-medium flex items-center justify-between animate-fade-in ${
          actionFeedback.type === "success" 
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
            : "bg-destructive/10 border-destructive/30 text-destructive"
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{actionFeedback.message}</span>
          </div>
          <button onClick={() => setActionFeedback(null)} className="p-1 hover:opacity-75">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Smart Categorization Bar */}
      <div className="space-y-1.5">
        <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Layers size={13} className="text-primary" /> Specialization Domains
        </div>
        <div className="flex overflow-x-auto pb-1 gap-2 text-xs">
          <button
            onClick={() => setCategoryFilter("all")}
            className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              categoryFilter === "all"
                ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                : "bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10"
            }`}
          >
            All Disciplines
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/40 font-mono">
              {partners.length}
            </span>
          </button>
          {PARTNER_CATEGORIES.map((cat) => {
            const count = categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  categoryFilter === cat
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "bg-white/5 border border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/10"
                }`}
              >
                {cat}
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  count > 0 ? "bg-primary/20 text-primary" : "bg-white/10 text-muted-foreground"
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Progression Tabs & Search Filter */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 bg-[#0c0e15]/80 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <div className="flex overflow-x-auto pb-1 gap-1 text-xs max-w-full">
            {[
              { key: "all", label: "All Applicants", count: counts.total },
              { key: "applied", label: "Applied", count: counts.applied },
              { key: "screening", label: "Screening", count: counts.screening },
              { key: "shortlisted", label: "Interview", count: counts.shortlisted },
              { key: "onboarded", label: "Verified Specialists", count: counts.onboarded },
              { key: "archived", label: "Archived", count: counts.archived },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusTab(tab.key)}
                className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  statusTab === tab.key
                    ? "bg-white/15 text-foreground border border-white/20 font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                {tab.label}
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 text-muted-foreground font-mono">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <span className="text-xs text-muted-foreground whitespace-nowrap">
            Showing <strong className="text-foreground">{filteredPartners.length}</strong> candidates
          </span>
        </div>

        {/* Search & Capability Filter */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-1 border-t border-white/5">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by candidate name, email, phone, skill tag, or Applicant ID (APP-XXXXXX)..."
              className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <select
              value={capabilityFilter}
              onChange={(e) => setCapabilityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-muted-foreground focus:outline-none"
            >
              <option value="all">All Technical Capabilities</option>
              {STANDARD_CAPABILITIES.map((cap) => (
                <option key={cap} value={cap}>
                  {cap}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {loading ? (
        <div className="glass-card p-12 rounded-2xl border border-white/10 text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
          Syncing talent applications...
        </div>
      ) : filteredPartners.length === 0 ? (
        <div className="glass-card p-12 rounded-3xl border border-white/10 text-center space-y-3">
          <AlertCircle size={32} className="mx-auto text-muted-foreground/50" />
          <h3 className="font-semibold text-sm">No candidate applications found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            No candidates matched your search criteria or selected filter state. Try clearing filters or resetting the search query.
          </p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setSearchQuery("");
              setCategoryFilter("all");
              setStatusTab("all");
              setCapabilityFilter("all");
            }}
            className="rounded-xl text-xs border-white/10"
          >
            Clear All Filters
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        
        /* DOSSIER GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPartners.map((partner) => {
            const applicantId = getApplicantId(partner.uid);
            const statusInfo = PARTNER_STATUS_LABELS[partner.status] || {
              label: partner.status,
              color: "text-zinc-400",
              bg: "bg-zinc-500/10 border-zinc-500/20",
            };

            return (
              <div
                key={partner.uid}
                onClick={() => router.push(`/admin/applicants/${partner.uid}`)}
                className="group relative p-5 rounded-2xl glass-card card-3d border border-white/10 hover:border-primary/40 transition-all duration-300 flex flex-col justify-between cursor-pointer space-y-4 shadow-lg hover:shadow-primary/5"
              >
                {/* Header: ID, Category, Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-primary font-semibold">
                      {applicantId}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${statusInfo.bg} ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Candidate Name & Category */}
                  <div className="flex items-start gap-3 pt-1">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 overflow-hidden">
                      {partner.photoURL ? (
                        <img src={partner.photoURL} alt={partner.name} className="w-full h-full object-cover" />
                      ) : (
                        partner.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {partner.name}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">{partner.category}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-1 text-xs text-muted-foreground/80 pt-1">
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail size={12} className="text-muted-foreground shrink-0" />
                      <span className="truncate">{partner.email || "No email provided"}</span>
                    </div>
                    {partner.phone && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone size={12} className="text-muted-foreground shrink-0" />
                        <span className="truncate">{partner.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Technical Capabilities */}
                  {partner.capabilities.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {partner.capabilities.slice(0, 3).map((cap) => (
                        <span key={cap} className="px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-muted-foreground truncate">
                          {cap}
                        </span>
                      ))}
                      {partner.capabilities.length > 3 && (
                        <span className="text-[10px] text-primary self-center font-medium">
                          +{partner.capabilities.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer: Rating, Links, Accept, Reject, Email */}
                <div className="pt-3 border-t border-white/5 space-y-3" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-0.5 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={12}
                          className={star <= (partner.rating || 0) ? "fill-amber-400" : "text-white/20"}
                        />
                      ))}
                    </div>

                    <div className="flex items-center gap-2">
                      {partner.cvUrl && (
                        <a
                          href={partner.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title="Open CV / Resume"
                        >
                          <FileText size={13} />
                        </a>
                      )}
                      {partner.githubUrl && (
                        <a
                          href={partner.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title="Open GitHub"
                        >
                          <Github size={13} />
                        </a>
                      )}
                      {partner.portfolioUrl && (
                        <a
                          href={partner.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary transition-colors"
                          title="Open Portfolio"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions (Opens Email & Status Review Modal) */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    <Button
                      size="sm"
                      onClick={(e) => openReviewModal(partner, "onboarded", true, e)}
                      disabled={partner.status === "onboarded"}
                      className={`h-8 text-xs rounded-xl font-medium gap-1 ${
                        partner.status === "onboarded"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                          : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                      }`}
                      title="Accept Applicant (opens email review)"
                    >
                      <Check size={12} /> Accept
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => openReviewModal(partner, "archived", true, e)}
                      disabled={partner.status === "archived"}
                      className={`h-8 text-xs rounded-xl font-medium gap-1 ${
                        partner.status === "archived"
                          ? "border-zinc-700 text-zinc-500 cursor-default"
                          : "border-rose-500/30 text-rose-400 hover:bg-rose-500/15"
                      }`}
                      title="Decline / Archive Applicant (opens email review)"
                    >
                      <X size={12} /> Reject
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => openReviewModal(partner, partner.status === "screening" ? "interview" : "screening", false, e)}
                      className="h-8 text-xs rounded-xl border-white/10 hover:bg-white/10 text-primary gap-1"
                      title="Send Direct Email / Notification"
                    >
                      <Send size={12} /> Email
                    </Button>
                  </div>

                  {canDeleteApplicant(currentRole) && (
                    <div className="flex justify-end pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteModalPartner(partner);
                          setDeleteConfirmationInput("");
                        }}
                        className="text-[10px] text-rose-400/60 hover:text-rose-400 flex items-center gap-1 transition-colors"
                        title="Permanently Delete Candidate (Super Admin)"
                      >
                        <Trash2 size={11} /> Delete Candidate
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (

        /* COMPACT TABLE VIEW */
        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden bg-[#0c0e15]/90">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-white/5 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-white/10 font-semibold">
                <tr>
                  <th className="py-3 px-4">Applicant ID</th>
                  <th className="py-3 px-4">Specialist Candidate</th>
                  <th className="py-3 px-4">Domain Category</th>
                  <th className="py-3 px-4">Key Capabilities</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPartners.map((partner) => {
                  const applicantId = getApplicantId(partner.uid);
                  const statusInfo = PARTNER_STATUS_LABELS[partner.status] || {
                    label: partner.status,
                    color: "text-zinc-400",
                    bg: "bg-zinc-500/10 border-zinc-500/20",
                  };

                  return (
                    <tr
                      key={partner.uid}
                      onClick={() => router.push(`/admin/applicants/${partner.uid}`)}
                      className="hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <td className="py-3.5 px-4 font-mono text-primary font-semibold whitespace-nowrap">
                        {applicantId}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-foreground">{partner.name}</div>
                        <div className="text-[11px] text-muted-foreground">{partner.email}</div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-muted-foreground">
                        {partner.category}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
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

                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            onClick={(e) => openReviewModal(partner, "onboarded", true, e)}
                            disabled={partner.status === "onboarded"}
                            className={`h-7 px-2 text-xs rounded-lg font-medium gap-1 ${
                              partner.status === "onboarded"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                                : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30"
                            }`}
                            title="Accept Applicant (opens review)"
                          >
                            <Check size={12} /> Accept
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => openReviewModal(partner, "archived", true, e)}
                            disabled={partner.status === "archived"}
                            className={`h-7 px-2 text-xs rounded-lg font-medium gap-1 ${
                              partner.status === "archived"
                                ? "border-zinc-700 text-zinc-500 cursor-default"
                                : "border-rose-500/30 text-rose-400 hover:bg-rose-500/15"
                            }`}
                            title="Reject Applicant (opens review)"
                          >
                            <X size={12} /> Reject
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => openReviewModal(partner, partner.status === "screening" ? "interview" : "screening", false, e)}
                            className="h-7 px-2 text-xs rounded-lg border-white/10 hover:bg-white/10 text-primary gap-1"
                            title="Send Email"
                          >
                            <Send size={12} />
                          </Button>

                          {canDeleteApplicant(currentRole) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteModalPartner(partner);
                                setDeleteConfirmationInput("");
                              }}
                              className="h-7 px-2 text-xs rounded-lg border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                              title="Delete Applicant"
                            >
                              <Trash2 size={12} />
                            </Button>
                          )}

                          <Link href={`/admin/applicants/${partner.uid}`}>
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

      {/* STATUS TRANSITION & EMAIL REVIEW POPUP MODAL */}
      {emailModalPartner && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-[#0c0e15] border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl my-6">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2 text-foreground">
                  <Mail size={16} className="text-primary" /> 
                  {isStatusTransition ? `Review Status Change & Notification` : `Candidate Communication Dispatch`}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Candidate: <strong className="text-foreground">{emailModalPartner.name}</strong> ({emailModalPartner.email}) • Target Stage:{" "}
                  <span className="font-mono text-primary font-bold uppercase">{targetStatus}</span>
                </p>
              </div>
              <button onClick={() => setEmailModalPartner(null)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditorMode("basic")}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                    editorMode === "basic" ? "bg-primary text-black font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <Sliders size={13} /> Basic Template Editor
                </button>
                <button
                  type="button"
                  onClick={() => setEditorMode("advanced")}
                  className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                    editorMode === "advanced" ? "bg-primary text-black font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <Code2 size={13} /> Advanced Direct HTML
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowLiveHtmlPreview(!showLiveHtmlPreview)}
                className="text-[11px] text-primary flex items-center gap-1 hover:underline"
              >
                <Eye size={12} /> {showLiveHtmlPreview ? "Hide Render Preview" : "Preview Final Email"}
              </button>
            </div>

            {dispatchFeedback && (
              <div className={`p-3 rounded-xl text-xs border ${
                dispatchFeedback.success ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"
              }`}>
                {dispatchFeedback.message}
              </div>
            )}

            <div className="space-y-4 text-xs">
              
              {/* Subject Line */}
              <div>
                <label className="block font-medium text-muted-foreground mb-1">Email Subject</label>
                <input
                  type="text"
                  value={subjectInput}
                  onChange={(e) => setSubjectInput(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* TAB 1: BASIC STEP-SPECIFIC EDITOR */}
              {editorMode === "basic" && (
                <div className="space-y-3">
                  
                  {/* STEP: SCREENING */}
                  {targetStatus === "screening" && (
                    <div className="p-4 rounded-2xl bg-black/40 border border-indigo-500/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-indigo-400 font-semibold">
                          <FileCheck2 size={15} /> Screening Stage Artifacts
                        </div>
                        <label className="flex items-center gap-1.5 text-muted-foreground cursor-pointer">
                          <input
                            type="checkbox"
                            checked={requestDocsCheck}
                            onChange={(e) => setRequestDocsCheck(e.target.checked)}
                            className="rounded text-primary"
                          />
                          <span>Prompt user for additional docs/repos</span>
                        </label>
                      </div>

                      {requestDocsCheck && (
                        <div>
                          <label className="block font-medium text-muted-foreground mb-1">
                            Requested Artifacts Checklist
                          </label>
                          <input
                            type="text"
                            value={docChecklistInput}
                            onChange={(e) => setDocChecklistInput(e.target.value)}
                            placeholder="GitHub repos, architecture diagrams, live demo links..."
                            className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-foreground focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP: INTERVIEW */}
                  {targetStatus === "interview" && (
                    <div className="p-4 rounded-2xl bg-black/40 border border-primary/20 space-y-3">
                      <div className="flex items-center gap-2 text-primary font-semibold">
                        <Video size={15} /> Video Meeting Call Details
                      </div>

                      <div>
                        <label className="block font-medium text-muted-foreground mb-1">
                          Video Call Link (Google Meet / Zoom) *
                        </label>
                        <input
                          type="url"
                          value={meetingUrlInput}
                          onChange={(e) => setMeetingUrlInput(e.target.value)}
                          placeholder="https://meet.google.com/abc-defg-hij or Zoom URL"
                          className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-medium text-muted-foreground mb-1">Date & Time</label>
                          <input
                            type="text"
                            value={scheduledAtInput}
                            onChange={(e) => setScheduledAtInput(e.target.value)}
                            placeholder="e.g. Sep 18, 2026, 4:00 PM"
                            className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-foreground focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-muted-foreground mb-1">Timezone</label>
                          <input
                            type="text"
                            value={timezoneInput}
                            onChange={(e) => setTimezoneInput(e.target.value)}
                            placeholder="IST / UTC"
                            className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-foreground focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block font-medium text-muted-foreground mb-1">Interviewer Lead Name</label>
                          <input
                            type="text"
                            value={interviewerNameInput}
                            onChange={(e) => setInterviewerNameInput(e.target.value)}
                            placeholder="Neubofy Technical Lead"
                            className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-foreground focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block font-medium text-muted-foreground mb-1">Preparation Tips</label>
                          <input
                            type="text"
                            value={prepTipsInput}
                            onChange={(e) => setPrepTipsInput(e.target.value)}
                            className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-foreground focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reviewer Custom Note */}
                  <div>
                    <label className="block font-medium text-muted-foreground mb-1">
                      Personal Reviewer Note / Custom Instructions <span className="text-muted-foreground/60">(Optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      value={customNoteInput}
                      onChange={(e) => setCustomNoteInput(e.target.value)}
                      placeholder="Add a personalized human message or instructions from the review team..."
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-foreground focus:outline-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: ADVANCED DIRECT HTML EDITOR */}
              {editorMode === "advanced" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-muted-foreground">Raw HTML Source Code</label>
                    <button
                      type="button"
                      onClick={() => setRawHtmlInput(currentRenderedHtml)}
                      className="text-[11px] text-primary hover:underline"
                    >
                      Copy from Current Template
                    </button>
                  </div>
                  <textarea
                    rows={8}
                    value={rawHtmlInput}
                    onChange={(e) => setRawHtmlInput(e.target.value)}
                    placeholder="Enter or paste raw HTML email code here..."
                    className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-foreground font-mono text-[11px] focus:outline-none leading-normal"
                  />
                </div>
              )}

              {/* Live Preview */}
              {showLiveHtmlPreview && (
                <div className="p-4 rounded-2xl bg-[#07080c] border border-white/10 max-h-56 overflow-y-auto space-y-2 animate-fade-in">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">Live Render Preview</span>
                  <div dangerouslySetInnerHTML={{ __html: currentRenderedHtml }} />
                </div>
              )}

              {/* Dynamic Reply-To Selector */}
              <div className="p-3.5 rounded-2xl bg-black/50 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-foreground flex items-center gap-1.5">
                    <Mail size={13} className="text-primary" /> Routing Reply-To Address
                  </label>
                  <span className="text-[11px] font-mono text-primary truncate max-w-[200px]">
                    Active: {effectiveReplyTo}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <select
                    value={selectedReplyToOption}
                    onChange={(e) => setSelectedReplyToOption(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-foreground focus:outline-none text-xs"
                  >
                    {communicationEmail && (
                      <option value="communication">My Communication Email ({communicationEmail})</option>
                    )}
                    {currentUser?.email && (
                      <option value="profile">My Profile Email ({currentUser.email})</option>
                    )}
                    <option value="careers">Neubofy Careers Desk (careers@neubofy.in)</option>
                    <option value="support">Neubofy Support Desk (support@neubofy.in)</option>
                    <option value="contact">Neubofy Executive Contact (contact@neubofy.in)</option>
                    <option value="custom">Custom Reply-To Address...</option>
                  </select>

                  {selectedReplyToOption === "custom" && (
                    <input
                      type="email"
                      value={customReplyToInput}
                      onChange={(e) => setCustomReplyToInput(e.target.value)}
                      placeholder="custom-email@yourdomain.com"
                      className="w-full px-3 py-2 bg-black/60 border border-white/10 rounded-xl text-foreground focus:outline-none text-xs"
                    />
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => setEmailModalPartner(null)}
                  className="w-full sm:w-auto rounded-xl border-white/10 text-xs"
                >
                  Cancel
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {isStatusTransition && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isDispatching}
                      onClick={handleUpdateStatusSilently}
                      className="rounded-xl border-white/10 text-xs hover:bg-white/5"
                      title="Changes candidate status without sending an email notification"
                    >
                      Update Status Only (No Email)
                    </Button>
                  )}

                  <Button
                    type="button"
                    disabled={isDispatching}
                    onClick={handleDispatchEmailAndConfirm}
                    className="btn-electric rounded-xl text-xs font-semibold gap-1.5"
                  >
                    <Send size={13} /> {isDispatching ? "Processing..." : isStatusTransition ? "Send Email & Update Status" : "Send Email"}
                  </Button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* SUPER ADMINISTRATOR APPLICANT DELETION MODAL */}
      {deleteModalPartner && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#0e1017] border border-rose-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <Trash2 size={18} />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Delete Candidate Record</h3>
                <p className="text-xs text-muted-foreground">High-Stakes Super Administrator Action</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              You are about to permanently delete the entire application dossier and profile for{" "}
              <strong className="text-foreground">{deleteModalPartner.name}</strong> ({getApplicantId(deleteModalPartner.uid)}).
              This action cannot be undone and will be permanently recorded in the internal audit trail.
            </p>

            <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-xs text-rose-300">
              Type <strong className="font-mono text-white bg-black/40 px-1 py-0.5 rounded">DELETE</strong> to confirm permanent deletion:
            </div>

            <input
              type="text"
              value={deleteConfirmationInput}
              onChange={(e) => setDeleteConfirmationInput(e.target.value)}
              placeholder="DELETE"
              className="w-full px-3 py-2 bg-black/60 border border-rose-500/30 rounded-xl text-foreground font-mono text-center text-xs tracking-wider focus:outline-none focus:ring-1 focus:ring-rose-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDeleteModalPartner(null);
                  setDeleteConfirmationInput("");
                }}
                className="rounded-xl border-white/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={deleteConfirmationInput !== "DELETE" || isDeletingApplicant}
                onClick={handleConfirmDeleteApplicant}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
              >
                {isDeletingApplicant ? "Deleting..." : "Permanently Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
