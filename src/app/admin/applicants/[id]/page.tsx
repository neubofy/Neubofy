"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFirebaseDb } from "@/lib/firebase/firebase";
import { doc, updateDoc, onSnapshot, collection, query, where } from "firebase/firestore";
import { 
  PartnerProfile, 
  PartnerStatus, 
  PARTNER_STATUS_LABELS, 
  InternalNote 
} from "@/lib/partner/types";
import { useAdmin } from "@/lib/admin/AdminContext";
import { canDeleteApplicant, canScheduleInterviews } from "@/lib/admin/rbac";
import { sendPartnerNotification } from "@/app/actions/sendPartnerEmail";
import { 
  recordAdminActivity, 
  getApplicantId, 
  AuditLogEntry, 
  deleteApplicantRecord,
  scheduleApplicantInterview 
} from "@/lib/admin/team";
import { 
  getScreeningTemplate, 
  getInterviewInvitationTemplate, 
  getVerifiedWelcomeTemplate, 
  getApplicationUpdateTemplate 
} from "@/lib/email/templates";
import { adminCache } from "@/lib/admin/dataCache";
import { Button } from "@/components/ui/button";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  ExternalLink, 
  Star, 
  CheckCircle2, 
  FileText, 
  Github, 
  Linkedin, 
  Send, 
  MessageSquare, 
  Clock, 
  Shield, 
  Layers, 
  X,
  History,
  Check,
  Video,
  Calendar,
  Trash2,
  AlertTriangle,
  Code2,
  Sparkles,
  Eye,
  Sliders,
  FileCheck2,
  Paperclip
} from "lucide-react";
import Link from "next/link";

export default function ApplicantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { user: currentUser, role, isSuperAdmin, isAdmin, communicationEmail } = useAdmin();

  const [specialist, setSpecialist] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);

  // Review Notes State
  const [newNote, setNewNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  // Audit Logs for this candidate
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Super Admin Delete Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Status & Email Review Modal State (Always opened before emailing or transitioning status)
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [isStatusTransition, setIsStatusTransition] = useState(false);
  const [targetStatus, setTargetStatus] = useState<PartnerStatus>("screening");
  const [editorMode, setEditorMode] = useState<"basic" | "advanced">("basic");

  // Step-Specific Basic Template Fields
  const [subjectInput, setSubjectInput] = useState("");
  const [customNoteInput, setCustomNoteInput] = useState("");
  const [meetingUrlInput, setMeetingUrlInput] = useState("");
  const [scheduledAtInput, setScheduledAtInput] = useState("");
  const [timezoneInput, setTimezoneInput] = useState("IST");
  const [interviewerNameInput, setInterviewerNameInput] = useState("");
  const [agendaNotesInput, setAgendaNotesInput] = useState("System architecture walk-through, past code repositories, and project coordination standards.");
  const [prepTipsInput, setPrepTipsInput] = useState("Please have 1-2 representative code repositories or design decisions ready to walk through.");
  const [requestDocsCheck, setRequestDocsCheck] = useState(true);
  const [docChecklistInput, setDocChecklistInput] = useState("GitHub repositories, architecture diagrams, live deployments, or security audit reports.");

  // Advanced Raw HTML State
  const [rawHtmlInput, setRawHtmlInput] = useState("");
  const [showLiveHtmlPreview, setShowLiveHtmlPreview] = useState(false);

  // Reply-To Selector State
  const [selectedReplyToOption, setSelectedReplyToOption] = useState<string>("default");
  const [customReplyToInput, setCustomReplyToInput] = useState("");

  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchFeedback, setDispatchFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Active section tab
  const [activeTab, setActiveTab] = useState<"dossier" | "interview" | "notes" | "history">("dossier");

  // Load Applicant Profile
  useEffect(() => {
    if (!id) return;
    const docRef = doc(getFirebaseDb(), "users", id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSpecialist({
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
          // Custom interview fields if scheduled
          ...(data.interviewMeetingUrl && {
            interviewMeetingUrl: data.interviewMeetingUrl,
            interviewScheduledAt: data.interviewScheduledAt,
            interviewTimezone: data.interviewTimezone,
            interviewerName: data.interviewerName,
          } as any)
        });

        // Pre-populate interview fields if present
        if (data.interviewMeetingUrl) setMeetingUrlInput(data.interviewMeetingUrl);
        if (data.interviewScheduledAt) setScheduledAtInput(data.interviewScheduledAt);
        if (data.interviewerName) setInterviewerNameInput(data.interviewerName);
      } else {
        setSpecialist(null);
      }
      setLoading(false);
    }, (err) => {
      console.error("Error loading candidate profile:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  // Load Audit Trail for this applicant
  useEffect(() => {
    if (!id) return;
    try {
      const logsRef = collection(getFirebaseDb(), "audit_logs");
      const q = query(logsRef, where("targetId", "==", id));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: AuditLogEntry[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            actorEmail: data.actorEmail || "Administrator",
            actorUid: data.actorUid || "",
            action: data.action,
            targetId: data.targetId,
            targetName: data.targetName,
            details: data.details,
            timestamp: data.timestamp,
          });
        });
        list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAuditLogs(list);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Audit logs listener error:", e);
    }
  }, [id]);

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

  // Initialize Modal for a Status Change or Direct Email
  const openStatusOrEmailModal = (newStatus: PartnerStatus, isTransition = true) => {
    if (!specialist) return;
    setTargetStatus(newStatus);
    setIsStatusTransition(isTransition);
    setEditorMode("basic");
    setShowLiveHtmlPreview(false);
    setDispatchFeedback(null);

    // Set initial reply-to to personal communication email if available, else profile email
    if (communicationEmail) {
      setSelectedReplyToOption("communication");
    } else if (currentUser?.email) {
      setSelectedReplyToOption("profile");
    } else {
      setSelectedReplyToOption("careers");
    }

    setInterviewerNameInput(currentUser?.displayName || currentUser?.email || "Neubofy Technical Lead");
    setCustomNoteInput("");

    // Step-Specific defaults
    if (newStatus === "screening") {
      setSubjectInput(`Technical Screening Active: ${specialist.category} — Neubofy Specialist Network`);
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

    // Pre-generate HTML for advanced tab
    let generated;
    if (newStatus === "screening") {
      generated = getScreeningTemplate(specialist.name, {
        category: specialist.category,
        requestDocs: requestDocsCheck,
        docChecklist: docChecklistInput,
      });
    } else if (newStatus === "interview") {
      generated = getInterviewInvitationTemplate(specialist.name, {
        meetingUrl: meetingUrlInput,
        scheduledAt: scheduledAtInput,
        timezone: timezoneInput,
        interviewerName: interviewerNameInput,
        agendaNotes: agendaNotesInput,
      });
    } else if (newStatus === "onboarded") {
      generated = getVerifiedWelcomeTemplate(specialist.name, specialist.category);
    } else if (newStatus === "archived") {
      generated = getApplicationUpdateTemplate(specialist.name);
    } else {
      generated = getScreeningTemplate(specialist.name);
    }
    setRawHtmlInput(generated.html);

    setEmailModalOpen(true);
  };

  // Re-generate preview HTML from current basic fields
  const currentRenderedHtml = useMemo(() => {
    if (!specialist) return "";
    if (editorMode === "advanced") return rawHtmlInput;

    if (targetStatus === "screening") {
      return getScreeningTemplate(specialist.name, {
        category: specialist.category,
        requestDocs: requestDocsCheck,
        docChecklist: docChecklistInput,
        customNote: customNoteInput,
      }).html;
    }
    if (targetStatus === "interview") {
      return getInterviewInvitationTemplate(specialist.name, {
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
      return getVerifiedWelcomeTemplate(specialist.name, specialist.category, customNoteInput).html;
    }
    if (targetStatus === "archived") {
      return getApplicationUpdateTemplate(specialist.name, customNoteInput).html;
    }
    return getScreeningTemplate(specialist.name).html;
  }, [
    specialist,
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

  // 1. Silent Status Update (No Email)
  const handleUpdateStatusSilently = async () => {
    if (!specialist) return;
    setIsDispatching(true);

    try {
      const docRef = doc(getFirebaseDb(), "users", specialist.uid);
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
        targetId: specialist.uid,
        targetName: specialist.name,
        details: `Updated applicant status to '${targetStatus.toUpperCase()}' without dispatching email notification.`,
      });

      adminCache.invalidate("applicants");
      setEmailModalOpen(false);
      alert(`Status updated to ${targetStatus.toUpperCase()} successfully (no email sent).`);
    } catch (err) {
      console.error("Error updating status silently:", err);
      alert("Failed to update status.");
    } finally {
      setIsDispatching(false);
    }
  };

  // 2. Dispatch Email & Update Status
  const handleDispatchEmailAndConfirm = async () => {
    if (!specialist) return;
    setIsDispatching(true);
    setDispatchFeedback(null);

    try {
      // 1. Update candidate doc in Firestore
      const docRef = doc(getFirebaseDb(), "users", specialist.uid);
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

      // 2. Dispatch email via server action
      let emailRes;
      if (editorMode === "advanced") {
        emailRes = await sendPartnerNotification({
          partnerEmail: specialist.email,
          partnerName: specialist.name,
          type: "raw_html",
          customSubject: subjectInput,
          customHtml: rawHtmlInput,
          replyTo: effectiveReplyTo,
        });
      } else {
        emailRes = await sendPartnerNotification({
          partnerEmail: specialist.email,
          partnerName: specialist.name,
          category: specialist.category,
          type: "status_change",
          newStatus: targetStatus,
          customSubject: subjectInput,
          customNote: customNoteInput,
          screeningDetails: targetStatus === "screening" ? {
            category: specialist.category,
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

      // 3. Record in audit log
      await recordAdminActivity({
        actorEmail: currentUser?.email || "Super Administrator",
        actorUid: currentUser?.uid || "admin",
        action: targetStatus === "onboarded" ? "ACCEPT_APPLICANT" : targetStatus === "archived" ? "REJECT_APPLICANT" : "STATUS_CHANGE",
        targetId: specialist.uid,
        targetName: specialist.name,
        details: `Updated status to '${targetStatus.toUpperCase()}' and dispatched email to ${specialist.email} (Reply-To: ${effectiveReplyTo})`,
      });

      adminCache.invalidate("applicants");

      setDispatchFeedback({
        success: true,
        message: emailRes.simulated
          ? "Status updated and simulated email logged to server console."
          : `Status updated and candidate notification delivered to ${specialist.email}!`,
      });

      setTimeout(() => {
        setEmailModalOpen(false);
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

  // Handle Star Rating
  const handleRateCandidate = async (rating: number) => {
    if (!specialist) return;
    try {
      const docRef = doc(getFirebaseDb(), "users", specialist.uid);
      await updateDoc(docRef, {
        rating,
        updatedAt: new Date().toISOString(),
      });

      await recordAdminActivity({
        actorEmail: currentUser?.email || "Super Administrator",
        actorUid: currentUser?.uid || "admin",
        action: "RATE_CANDIDATE",
        targetId: specialist.uid,
        targetName: specialist.name,
        details: `Assigned candidate quality evaluation rating: ${rating} Stars`,
      });

      adminCache.invalidate("applicants");
    } catch (err) {
      console.error("Error rating candidate:", err);
    }
  };

  // Handle Internal Note Submission
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim() || !specialist || submittingNote) return;
    setSubmittingNote(true);

    try {
      const docRef = doc(getFirebaseDb(), "users", specialist.uid);
      const noteEntry: InternalNote = {
        id: `note_${Date.now()}`,
        authorEmail: currentUser?.email || "Super Administrator",
        note: newNote.trim(),
        createdAt: new Date().toISOString(),
      };

      const updatedNotes = [...(specialist.internalNotes || []), noteEntry];
      await updateDoc(docRef, {
        internalNotes: updatedNotes,
        updatedAt: new Date().toISOString(),
      });

      await recordAdminActivity({
        actorEmail: currentUser?.email || "Super Administrator",
        actorUid: currentUser?.uid || "admin",
        action: "ADD_NOTE",
        targetId: specialist.uid,
        targetName: specialist.name,
        details: `Added technical evaluation note (${newNote.slice(0, 50)}...)`,
      });

      setNewNote("");
      adminCache.invalidate("applicants");
    } catch (err) {
      console.error("Error adding review note:", err);
      alert("Failed to save review note.");
    } finally {
      setSubmittingNote(false);
    }
  };

  // Super Administrator: Hard Delete Applicant
  const handleConfirmDelete = async () => {
    if (!specialist) return;
    if (deleteConfirmationInput !== "DELETE") {
      alert("Please type DELETE to confirm permanent deletion.");
      return;
    }

    setIsDeleting(true);
    const res = await deleteApplicantRecord(
      specialist.uid,
      currentUser?.email || "Super Administrator",
      currentUser?.uid || "admin",
      specialist.name
    );

    setIsDeleting(false);
    if (res.success) {
      adminCache.invalidate("applicants");
      alert(`Candidate dossier for ${specialist.name} permanently deleted.`);
      router.push("/admin/applicants");
    } else {
      alert(`Failed to delete record: ${res.error}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Loading Candidate Dossier...</span>
        </div>
      </div>
    );
  }

  if (!specialist) {
    return (
      <div className="glass-card p-12 rounded-3xl border border-white/10 text-center space-y-4 max-w-md mx-auto my-12">
        <Shield size={36} className="mx-auto text-muted-foreground" />
        <h2 className="text-lg font-bold">Candidate Application Not Found</h2>
        <p className="text-xs text-muted-foreground">
          No specialist application exists with ID: <span className="font-mono text-primary">{id}</span>.
        </p>
        <Link href="/admin/applicants">
          <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1">
            <ArrowLeft size={13} /> Back to Pipeline
          </Button>
        </Link>
      </div>
    );
  }

  const applicantId = getApplicantId(specialist.uid);
  const statusInfo = PARTNER_STATUS_LABELS[specialist.status] || {
    label: specialist.status,
    color: "text-zinc-400",
    bg: "bg-zinc-500/10 border-zinc-500/20",
  };

  const hasScheduledInterview = (specialist as any).interviewMeetingUrl;

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in pb-16">
      
      {/* Top Back Navigation Bar */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/applicants">
            <Button variant="outline" size="sm" className="h-8 px-2.5 rounded-xl border-white/10 text-xs gap-1 hover:bg-white/10">
              <ArrowLeft size={13} /> Pipeline
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary font-bold">
              {applicantId}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.bg} ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>

        {/* Action Controls (All trigger the Review & Email Modal) */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => openStatusOrEmailModal("onboarded", true)}
            disabled={specialist.status === "onboarded" || changingStatus}
            className="h-8 px-3 text-xs rounded-xl font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 gap-1.5"
            title="Accept candidate as Verified Specialist (opens email preview)"
          >
            <Check size={13} /> Accept & Verify
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => openStatusOrEmailModal("archived", true)}
            disabled={specialist.status === "archived" || changingStatus}
            className="h-8 px-3 text-xs rounded-xl font-medium border-rose-500/30 text-rose-400 hover:bg-rose-500/15 gap-1.5"
            title="Decline candidate (opens email preview)"
          >
            <X size={13} /> Reject & Archive
          </Button>

          <Button
            size="sm"
            onClick={() => openStatusOrEmailModal(specialist.status, false)}
            className="h-8 px-3 text-xs rounded-xl btn-electric font-medium gap-1.5"
            title="Compose message to candidate"
          >
            <Send size={13} /> Dispatch Email
          </Button>
        </div>
      </div>

      {/* Main Candidate Header Card */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c0e15]/90 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary font-bold text-xl overflow-hidden shrink-0">
              {specialist.photoURL ? (
                <img src={specialist.photoURL} alt={specialist.name} className="w-full h-full object-cover" />
              ) : (
                specialist.name.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
                  {specialist.name}
                </h1>
                {specialist.verified && (
                  <span title="Verified Specialist">
                    <CheckCircle2 size={18} className="text-emerald-400" />
                  </span>
                )}
              </div>
              <p className="text-sm text-primary font-medium">{specialist.category}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground mt-1">
                <span className="flex items-center gap-1"><Mail size={12} /> {specialist.email}</span>
                {specialist.phone && (
                  <span className="flex items-center gap-1"><Phone size={12} /> {specialist.phone}</span>
                )}
                <span className="flex items-center gap-1"><Clock size={12} /> Applied {new Date(specialist.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* 5-Star Quality Evaluation Controls */}
          <div className="flex flex-col sm:items-end gap-1.5 p-3 rounded-2xl bg-black/40 border border-white/10">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
              Technical Evaluation Rating
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRateCandidate(star)}
                  className="p-1 hover:scale-110 transition-transform"
                  title={`Rate ${star} Stars`}
                >
                  <Star
                    size={16}
                    className={star <= (specialist.rating || 0) ? "fill-amber-400 text-amber-400" : "text-white/20 hover:text-white/40"}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active Interview Notice Banner (if scheduled) */}
        {hasScheduledInterview && (
          <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary shrink-0">
                <Video size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground flex items-center gap-2">
                  Technical Video Interview Scheduled
                  <span className="px-2 py-0.2 rounded-full text-[10px] bg-primary text-black font-semibold uppercase">Active</span>
                </h4>
                <p className="text-xs text-muted-foreground">
                  Time: <strong className="text-foreground">{(specialist as any).interviewScheduledAt || "Confirmed"} ({(specialist as any).interviewTimezone || "IST"})</strong> • 
                  Interviewer: <strong className="text-foreground">{(specialist as any).interviewerName || "Engineering Team"}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={(specialist as any).interviewMeetingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-primary text-black font-semibold text-xs flex items-center gap-1.5 hover:opacity-90 shadow-md shadow-primary/10"
              >
                <Video size={13} /> Join Call
              </a>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openStatusOrEmailModal("interview", true)}
                className="h-7 text-xs rounded-xl border-white/10 hover:bg-white/10"
              >
                Reschedule Call
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs">
        <button
          onClick={() => setActiveTab("dossier")}
          className={`px-4 py-2 rounded-xl font-medium transition-all ${
            activeTab === "dossier" ? "bg-primary text-black font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          Technical Dossier
        </button>
        <button
          onClick={() => setActiveTab("interview")}
          className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
            activeTab === "interview" ? "bg-primary text-black font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <Video size={13} /> Interview Management
        </button>
        <button
          onClick={() => setActiveTab("notes")}
          className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
            activeTab === "notes" ? "bg-primary text-black font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <MessageSquare size={13} /> Review Notes ({specialist.internalNotes?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
            activeTab === "history" ? "bg-primary text-black font-semibold" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <History size={13} /> Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: TECHNICAL DOSSIER */}
      {activeTab === "dossier" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            
            {/* Bio & Background */}
            <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c0e15]/80 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <FileText size={14} className="text-primary" /> Specialist Statement / Bio
              </h3>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
                {specialist.bio || "No biographical introduction provided."}
              </p>
            </div>

            {/* Technical Capabilities List */}
            <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c0e15]/80 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Layers size={14} className="text-primary" /> Verified Technical Capabilities & Frameworks
              </h3>
              {specialist.capabilities.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {specialist.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-medium text-foreground"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No specific capabilities selected.</p>
              )}
            </div>

            {/* SUPER ADMINISTRATOR DANGER ZONE */}
            {canDeleteApplicant(role) && (
              <div className="glass-card p-6 rounded-3xl border border-rose-500/20 bg-rose-500/[0.03] space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <AlertTriangle size={15} /> Super Administrator Governance
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Permanently delete this applicant dossier and remove all indexed data from the Neubofy candidate database. This action is permanently logged to the internal audit record.
                </p>
                <Button
                  size="sm"
                  onClick={() => {
                    setDeleteModalOpen(true);
                    setDeleteConfirmationInput("");
                  }}
                  className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-medium rounded-xl gap-1.5"
                >
                  <Trash2 size={13} /> Permanently Delete Dossier
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar: Verified Links & Stage Stepper */}
          <div className="space-y-6">
            
            {/* Links Box */}
            <div className="glass-card p-5 rounded-3xl border border-white/10 bg-[#0c0e15]/80 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Verified Repositories & Links
              </h3>
              <div className="space-y-2 text-xs">
                {specialist.cvUrl ? (
                  <a
                    href={specialist.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-primary/40 flex items-center justify-between text-foreground hover:text-primary transition-colors group"
                  >
                    <span className="flex items-center gap-2"><FileText size={14} /> Curriculum Vitae (PDF)</span>
                    <ExternalLink size={12} className="text-muted-foreground group-hover:text-primary" />
                  </a>
                ) : (
                  <div className="p-3 rounded-xl bg-black/20 border border-white/5 text-muted-foreground text-xs">
                    No CV attached
                  </div>
                )}

                {specialist.githubUrl && (
                  <a
                    href={specialist.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-primary/40 flex items-center justify-between text-foreground hover:text-primary transition-colors group"
                  >
                    <span className="flex items-center gap-2"><Github size={14} /> GitHub Profile</span>
                    <ExternalLink size={12} className="text-muted-foreground group-hover:text-primary" />
                  </a>
                )}

                {specialist.portfolioUrl && (
                  <a
                    href={specialist.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-primary/40 flex items-center justify-between text-foreground hover:text-primary transition-colors group"
                  >
                    <span className="flex items-center gap-2"><ExternalLink size={14} /> Portfolio Website</span>
                    <ExternalLink size={12} className="text-muted-foreground group-hover:text-primary" />
                  </a>
                )}

                {specialist.linkedinUrl && (
                  <a
                    href={specialist.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-black/40 border border-white/10 hover:border-primary/40 flex items-center justify-between text-foreground hover:text-primary transition-colors group"
                  >
                    <span className="flex items-center gap-2"><Linkedin size={14} /> LinkedIn Profile</span>
                    <ExternalLink size={12} className="text-muted-foreground group-hover:text-primary" />
                  </a>
                )}
              </div>
            </div>

            {/* Pipeline Stage Transition Stepper (Triggers Modal Review instead of silent email) */}
            <div className="glass-card p-5 rounded-3xl border border-white/10 bg-[#0c0e15]/80 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pipeline Stage Progression
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Click any stage below to open the review modal, preview the notification, and decide whether to send an email.
              </p>
              
              <div className="space-y-1.5 text-xs">
                {[
                  { key: "applied", label: "Applied / Received" },
                  { key: "screening", label: "Technical Screening" },
                  { key: "interview", label: "Technical Interview" },
                  { key: "onboarded", label: "Verified Specialist" },
                  { key: "archived", label: "Archived / Declined" },
                ].map((st) => (
                  <button
                    key={st.key}
                    onClick={() => openStatusOrEmailModal(st.key as PartnerStatus, true)}
                    className={`w-full p-2.5 rounded-xl text-left font-medium transition-all flex items-center justify-between ${
                      specialist.status === st.key
                        ? "bg-primary text-black font-semibold shadow-sm"
                        : "hover:bg-white/5 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span>{st.label}</span>
                    {specialist.status === st.key && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 2: INTERVIEW MANAGEMENT */}
      {activeTab === "interview" && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c0e15]/90 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Video size={18} className="text-primary" /> Technical Interview Call Coordination
              </h2>
              <p className="text-xs text-muted-foreground">
                Schedule a direct 1-on-1 technical discussion with candidate using Google Meet or Zoom.
              </p>
            </div>
          </div>

          <div className="max-w-xl space-y-4 text-xs">
            <p className="text-muted-foreground leading-relaxed">
              To schedule or update an interview slot with candidate notification review, click the button below. You can preview the email, customize agenda notes, and select your personal reply-to email.
            </p>

            <Button
              onClick={() => openStatusOrEmailModal("interview", true)}
              className="h-10 px-5 rounded-xl btn-electric text-xs font-semibold gap-1.5"
            >
              <Calendar size={14} /> Configure & Schedule Interview
            </Button>
          </div>
        </div>
      )}

      {/* TAB 3: REVIEW NOTES */}
      {activeTab === "notes" && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c0e15]/90 space-y-6">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <MessageSquare size={18} className="text-primary" /> Internal Technical Evaluation Notes
            </h2>
            <p className="text-xs text-muted-foreground">
              Private notes viewable strictly by authorized administrators. Not visible to candidates.
            </p>
          </div>

          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              rows={3}
              required
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Record candidate strengths, architectural observations, code walkthrough notes, or compensation expectations..."
              className="w-full px-4 py-3 bg-black/50 border border-white/10 rounded-2xl text-xs text-foreground focus:ring-1 focus:ring-primary focus:outline-none leading-relaxed"
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submittingNote || !newNote.trim()}
                className="h-8 px-4 text-xs rounded-xl btn-electric font-medium gap-1.5"
              >
                <Check size={13} /> {submittingNote ? "Saving..." : "Add Evaluation Note"}
              </Button>
            </div>
          </form>

          <div className="space-y-3 pt-2">
            {specialist.internalNotes && specialist.internalNotes.length > 0 ? (
              specialist.internalNotes.slice().reverse().map((note) => (
                <div key={note.id} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span className="font-semibold text-foreground">{note.authorEmail}</span>
                    <span className="text-[11px] font-mono">{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-foreground/90 whitespace-pre-line leading-relaxed">{note.note}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">No evaluation notes added yet.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: AUDIT TRAIL */}
      {activeTab === "history" && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c0e15]/90 space-y-4">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
              <History size={18} className="text-primary" /> Candidate Dossier Audit Stream
            </h2>
            <p className="text-xs text-muted-foreground">
              Immutable chronological history of all administrative decisions for this candidate.
            </p>
          </div>

          <div className="space-y-2">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-primary/10 text-primary">
                        {log.action}
                      </span>
                      <span className="font-medium text-foreground">{log.details}</span>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      By: <span className="text-foreground/80">{log.actorEmail}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">No audit records logged for this candidate yet.</p>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: STATUS TRANSITION & EMAIL REVIEW POPUP */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-[#0c0e15] border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl my-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2 text-foreground">
                  <Mail size={16} className="text-primary" /> 
                  {isStatusTransition ? `Review Status Change & Notification` : `Candidate Communication Dispatch`}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Candidate: <strong className="text-foreground">{specialist.name}</strong> ({specialist.email}) • Target Stage:{" "}
                  <span className="font-mono text-primary font-bold uppercase">{targetStatus}</span>
                </p>
              </div>
              <button onClick={() => setEmailModalOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10 text-muted-foreground">
                <X size={18} />
              </button>
            </div>

            {/* Mode Switcher: Basic Step-Specific Template vs Advanced Direct HTML */}
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

                  {/* Reviewer Custom Note for Any Step */}
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

              {/* Live Preview Container */}
              {showLiveHtmlPreview && (
                <div className="p-4 rounded-2xl bg-[#07080c] border border-white/10 max-h-56 overflow-y-auto space-y-2 animate-fade-in">
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider block">Live Render Preview</span>
                  <div dangerouslySetInnerHTML={{ __html: currentRenderedHtml }} />
                </div>
              )}

              {/* Dynamic Reply-To Configuration */}
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
                  onClick={() => setEmailModalOpen(false)}
                  className="w-full sm:w-auto rounded-xl border-white/10 text-xs"
                >
                  Cancel
                </Button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {/* Choice 1: Update status silently without sending email */}
                  {isStatusTransition && (
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isDispatching}
                      onClick={handleUpdateStatusSilently}
                      className="rounded-xl border-white/10 text-xs hover:bg-white/5"
                      title="Changes candidate status in Firestore without sending an email notification"
                    >
                      Update Status Only (No Email)
                    </Button>
                  )}

                  {/* Choice 2: Send email and apply status */}
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

      {/* MODAL 2: SUPER ADMINISTRATOR PERMANENT DELETE */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-md bg-[#0e1017] border border-rose-500/30 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                <Trash2 size={18} />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Permanent Dossier Deletion</h3>
                <p className="text-xs text-muted-foreground">High-Stakes Super Admin Action</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              You are about to permanently delete the entire application profile and audit records for{" "}
              <strong className="text-foreground">{specialist.name}</strong> ({applicantId}). This action cannot be reversed.
            </p>

            <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-500/20 text-xs text-rose-300">
              Type <strong className="font-mono text-white bg-black/40 px-1 py-0.5 rounded">DELETE</strong> to confirm permanent erasure:
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
                  setDeleteModalOpen(false);
                  setDeleteConfirmationInput("");
                }}
                className="rounded-xl border-white/10 text-xs"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={deleteConfirmationInput !== "DELETE" || isDeleting}
                onClick={handleConfirmDelete}
                className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold"
              >
                {isDeleting ? "Deleting..." : "Permanently Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
