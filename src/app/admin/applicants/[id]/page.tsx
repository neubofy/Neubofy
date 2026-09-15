"use client";

import React, { useEffect, useState } from "react";
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
import { processPartnerStatusChange } from "@/app/actions/adminPartnerActions";
import { sendPartnerNotification } from "@/app/actions/sendPartnerEmail";
import { recordAdminActivity, getApplicantId, AuditLogEntry } from "@/lib/admin/team";
import { EmailSenderType, ReplyToType } from "@/lib/email/resend";
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
  Check
} from "lucide-react";
import Link from "next/link";

export default function ApplicantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const { user: currentUser, role, isSuperAdmin, isAdmin } = useAdmin();

  const [specialist, setSpecialist] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [changingStatus, setChangingStatus] = useState(false);
  const [statusNotifyEmail, setStatusNotifyEmail] = useState(true);

  // Review Notes State
  const [newNote, setNewNote] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  // Audit Logs for this candidate
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // Email Modal State
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailTemplateType, setEmailTemplateType] = useState<"welcome" | "status_change" | "custom">("custom");
  const [emailNewStatus, setEmailNewStatus] = useState<PartnerStatus>("screening");
  const [emailSender, setEmailSender] = useState<EmailSenderType>("careers");
  const [emailReplyTo, setEmailReplyTo] = useState<ReplyToType>("careers@neubofy.in");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailBookingUrl, setEmailBookingUrl] = useState("https://booking.neubofy.in");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Active section tab
  const [activeTab, setActiveTab] = useState<"dossier" | "notes" | "history">("dossier");

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
        });
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
        const logs: AuditLogEntry[] = [];
        snapshot.forEach((d) => {
          const item = d.data();
          logs.push({
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
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAuditLogs(logs);
      }, (err) => {
        console.warn("Audit log query notice:", err);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn("Error subscribing to audit history:", e);
    }
  }, [id]);

  // Change Recruitment Stage
  const handleStatusChange = async (newStatus: PartnerStatus) => {
    if (!specialist) return;
    setChangingStatus(true);

    try {
      const docRef = doc(getFirebaseDb(), "users", specialist.uid);
      await updateDoc(docRef, {
        status: newStatus,
        verified: newStatus === "onboarded",
        updatedAt: new Date().toISOString(),
      });

      await recordAdminActivity({
        actorEmail: currentUser?.email || "Super Administrator",
        actorUid: currentUser?.uid || "admin",
        action: newStatus === "onboarded" ? "ACCEPT_APPLICANT" : newStatus === "archived" ? "REJECT_APPLICANT" : "STATUS_CHANGE",
        targetId: specialist.uid,
        targetName: specialist.name,
        details: `Updated stage to ${newStatus.toUpperCase()} (${statusNotifyEmail ? "email notified" : "silent"})`,
      });

      if (statusNotifyEmail && specialist.email) {
        await processPartnerStatusChange({
          partnerUid: specialist.uid,
          partnerEmail: specialist.email,
          partnerName: specialist.name,
          category: specialist.category,
          newStatus: newStatus,
          notifyPartner: true,
          bookingUrl: "https://booking.neubofy.in",
        });
      }

      setSpecialist({
        ...specialist,
        status: newStatus,
        verified: newStatus === "onboarded",
      });
    } catch (err) {
      console.error("Error updating candidate stage:", err);
    } finally {
      setChangingStatus(false);
    }
  };

  // Set Technical Rating
  const handleSetRating = async (rating: number) => {
    if (!specialist) return;
    try {
      const docRef = doc(getFirebaseDb(), "users", specialist.uid);
      await updateDoc(docRef, { rating });

      await recordAdminActivity({
        actorEmail: currentUser?.email || "Super Administrator",
        actorUid: currentUser?.uid || "admin",
        action: "RATE_CANDIDATE",
        targetId: specialist.uid,
        targetName: specialist.name,
        details: `Assigned technical score ${rating}/5 stars`,
      });

      setSpecialist({ ...specialist, rating });
    } catch (err) {
      console.error("Error saving rating:", err);
    }
  };

  // Add Internal Assessment Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialist || !newNote.trim()) return;
    setSubmittingNote(true);

    try {
      const noteItem: InternalNote = {
        id: `note_${Date.now()}`,
        authorEmail: currentUser?.email || "Super Administrator",
        note: newNote.trim(),
        createdAt: new Date().toISOString(),
      };

      const updatedNotes = [...(specialist.internalNotes || []), noteItem];
      const docRef = doc(getFirebaseDb(), "users", specialist.uid);
      await updateDoc(docRef, { internalNotes: updatedNotes });

      await recordAdminActivity({
        actorEmail: currentUser?.email || "Super Administrator",
        actorUid: currentUser?.uid || "admin",
        action: "ADD_NOTE",
        targetId: specialist.uid,
        targetName: specialist.name,
        details: `Added internal review note: "${newNote.trim().slice(0, 40)}..."`,
      });

      setSpecialist({ ...specialist, internalNotes: updatedNotes });
      setNewNote("");
    } catch (err) {
      console.error("Error adding note:", err);
    } finally {
      setSubmittingNote(false);
    }
  };

  // Open Email Modal
  const openEmailModal = () => {
    if (!specialist) return;
    setEmailTemplateType("custom");
    setEmailFeedback(null);
    setEmailSender("careers");
    setEmailReplyTo("careers@neubofy.in");
    setEmailSubject(`Neubofy Technical Opportunity — Update for ${specialist.name}`);
    setEmailBody(`Hi ${specialist.name},\n\nWe are reviewing your candidate dossier at Neubofy Talent Operations regarding project orchestration opportunities matching your ${specialist.category} skill set.`);
    setEmailModalOpen(true);
  };

  // Send Resend Email
  const handleSendEmail = async () => {
    if (!specialist) return;
    setSendingEmail(true);
    setEmailFeedback(null);

    try {
      const res = await sendPartnerNotification({
        partnerEmail: specialist.email,
        partnerName: specialist.name,
        category: specialist.category,
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
            ? "Simulated dispatch (RESEND_API_KEY is not configured)."
            : `Email dispatched successfully! Message ID: ${res.messageId}`,
        });

        await recordAdminActivity({
          actorEmail: currentUser?.email || "Super Administrator",
          actorUid: currentUser?.uid || "",
          action: "SEND_EMAIL",
          targetId: specialist.uid,
          targetName: specialist.name,
          details: `Dispatched ${emailTemplateType} email to ${specialist.email}`,
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

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground text-xs">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span>Loading applicant dossier...</span>
        </div>
      </div>
    );
  }

  if (!specialist) {
    return (
      <div className="text-center py-20 space-y-4">
        <h2 className="text-xl font-bold">Applicant Record Not Found</h2>
        <p className="text-xs text-muted-foreground">The candidate profile does not exist or may have been removed.</p>
        <Link href="/admin/applicants">
          <Button variant="outline" className="rounded-xl text-xs gap-1.5">
            <ArrowLeft size={14} /> Return to Applicants Pipeline
          </Button>
        </Link>
      </div>
    );
  }

  const applicantId = getApplicantId(specialist.uid);
  const statusInfo = PARTNER_STATUS_LABELS[specialist.status] || PARTNER_STATUS_LABELS.draft;

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      
      {/* Top Breadcrumb & Back Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <Link href="/admin/applicants" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} /> Back to Applicants Pipeline
        </Link>

        {/* 1-Click Accept & Reject Quick Action Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            onClick={() => handleStatusChange("onboarded")}
            disabled={changingStatus || specialist.status === "onboarded"}
            className="rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs h-8 gap-1.5 font-semibold"
          >
            <Check size={13} /> {specialist.status === "onboarded" ? "Verified Specialist" : "Accept Candidate"}
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (confirm(`Decline and archive application for ${specialist.name}?`)) {
                handleStatusChange("archived");
              }
            }}
            disabled={changingStatus || specialist.status === "archived"}
            className="rounded-xl border-rose-500/30 text-rose-400 hover:bg-rose-500/15 text-xs h-8 gap-1.5 font-medium"
          >
            <X size={13} /> Reject Candidate
          </Button>

          <Button
            size="sm"
            onClick={openEmailModal}
            className="rounded-xl btn-electric text-xs h-8 gap-1.5"
          >
            <Mail size={12} /> Dispatch Email
          </Button>
        </div>
      </div>

      {/* Main Candidate Header Card */}
      <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0c0e15]/90 backdrop-blur-2xl shadow-xl">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-black/40 border-2 border-primary/30 flex items-center justify-center shrink-0">
              {specialist.photoURL ? (
                <img src={specialist.photoURL} alt={specialist.name} className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-primary" />
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mb-1.5">
                <h1 className="text-2xl md:text-3xl font-bold">{specialist.name}</h1>
                <span className="font-mono text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-muted-foreground font-semibold">
                  {applicantId}
                </span>
                <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.bg} ${statusInfo.color} flex items-center gap-1`}>
                  <Shield size={12} /> {statusInfo.label}
                </span>
              </div>
              <p className="text-sm text-primary font-medium">{specialist.category}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-muted-foreground mt-2">
                <span className="flex items-center gap-1.5"><Mail size={13} className="text-primary" /> {specialist.email}</span>
                <span className="flex items-center gap-1.5"><Phone size={13} className="text-primary" /> {specialist.phone || "No phone"}</span>
                <span>Applied: <strong className="text-foreground">{new Date(specialist.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</strong></span>
              </div>
            </div>
          </div>

          {/* Star Rating Block */}
          <div className="flex flex-col items-center md:items-end bg-black/40 p-4 rounded-2xl border border-white/10 shrink-0">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1.5">Technical Rating</span>
            <div className="flex items-center gap-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleSetRating(star)}
                  className="hover:scale-125 transition-transform"
                >
                  <Star
                    size={20}
                    className={star <= (specialist.rating || 0) ? "fill-amber-400" : "text-white/20"}
                  />
                </button>
              ))}
            </div>
            <span className="text-[11px] text-muted-foreground mt-1">
              {specialist.rating ? `${specialist.rating} / 5 Stars` : "Not Rated"}
            </span>
          </div>
        </div>

        {/* Stage Progression Selector */}
        <div className="mt-8 pt-6 border-t border-white/10 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Change Recruitment Stage</span>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="notifyCheck"
                checked={statusNotifyEmail}
                onChange={(e) => setStatusNotifyEmail(e.target.checked)}
                className="rounded border-white/20 text-primary h-3.5 w-3.5"
              />
              <label htmlFor="notifyCheck" className="text-xs text-muted-foreground cursor-pointer">
                Send automated email notice on stage change
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(['applied', 'screening', 'shortlisted', 'interview', 'onboarded', 'archived'] as PartnerStatus[]).map((st) => (
              <button
                key={st}
                disabled={changingStatus}
                onClick={() => handleStatusChange(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                  specialist.status === st
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-white/5 text-muted-foreground border-white/10 hover:border-white/20 hover:text-foreground"
                }`}
              >
                {PARTNER_STATUS_LABELS[st].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Menu: Overview vs Notes vs Audit History */}
      <div className="flex gap-2 border-b border-white/10 pb-2 text-xs">
        <button
          onClick={() => setActiveTab("dossier")}
          className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "dossier"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <Layers size={14} /> Technical Dossier
        </button>

        <button
          onClick={() => setActiveTab("notes")}
          className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "notes"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <MessageSquare size={14} /> Evaluation Notes ({specialist.internalNotes?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "history"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <History size={14} /> Applicant Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* SECTION 1: TECHNICAL DOSSIER */}
      {activeTab === "dossier" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Bio */}
            <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#0c0e15]/80 space-y-3">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <FileText size={16} className="text-primary" /> Specialist Biography & Summary
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                {specialist.bio || "No biography provided by applicant."}
              </p>
            </div>

            {/* Stated Capabilities */}
            <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#0c0e15]/80 space-y-3">
              <h3 className="font-semibold text-sm text-foreground flex items-center gap-2">
                <Layers size={16} className="text-primary" /> Technical Capabilities & Stack
              </h3>
              {specialist.capabilities.length === 0 ? (
                <p className="text-xs text-muted-foreground">No capabilities specified.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {specialist.capabilities.map((cap) => (
                    <span
                      key={cap}
                      className="px-3 py-1.5 rounded-xl text-xs bg-white/5 border border-white/10 text-foreground font-medium"
                    >
                      {cap}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Links & Verification Checklist */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl border border-white/10 bg-[#0c0e15]/80 space-y-4 text-xs">
              <h3 className="font-semibold text-sm text-foreground">Verified Proof of Work</h3>

              <div className="space-y-3">
                {specialist.cvUrl ? (
                  <a
                    href={specialist.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all font-medium"
                  >
                    <span className="flex items-center gap-2"><FileText size={15} /> Resume / CV</span>
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <span className="block p-3 rounded-xl bg-white/5 text-muted-foreground border border-white/5">
                    No Resume / CV URL attached
                  </span>
                )}

                {specialist.portfolioUrl && (
                  <a
                    href={specialist.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition-all font-medium"
                  >
                    <span className="flex items-center gap-2"><ExternalLink size={15} className="text-primary" /> Live Portfolio</span>
                    <ExternalLink size={13} className="text-muted-foreground" />
                  </a>
                )}

                {specialist.githubUrl && (
                  <a
                    href={specialist.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition-all font-medium"
                  >
                    <span className="flex items-center gap-2"><Github size={15} /> GitHub Profile</span>
                    <ExternalLink size={13} className="text-muted-foreground" />
                  </a>
                )}

                {specialist.linkedinUrl && (
                  <a
                    href={specialist.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 text-foreground hover:bg-white/10 transition-all font-medium"
                  >
                    <span className="flex items-center gap-2"><Linkedin size={15} /> LinkedIn Profile</span>
                    <ExternalLink size={13} className="text-muted-foreground" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: EVALUATION NOTES */}
      {activeTab === "notes" && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c0e15]/80 space-y-6">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <MessageSquare size={16} className="text-primary" /> Internal Assessment Notes
            </h3>
            <p className="text-xs text-muted-foreground">
              Private review comments visible only to authorized Neubofy administrators.
            </p>
          </div>

          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              rows={3}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Record technical impressions, code review findings, or interview notes..."
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <Button
              type="submit"
              disabled={submittingNote || !newNote.trim()}
              className="btn-electric rounded-xl text-xs h-9"
            >
              {submittingNote ? "Logging..." : "Log Assessment Note"}
            </Button>
          </form>

          <div className="space-y-3 pt-2">
            {specialist.internalNotes?.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No evaluation notes recorded yet.</p>
            ) : (
              specialist.internalNotes?.map((note) => (
                <div key={note.id} className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground">{note.authorEmail}</span>
                    <span className="font-mono">{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-foreground leading-relaxed">{note.note}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: APPLICANT AUDIT TRAIL */}
      {activeTab === "history" && (
        <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c0e15]/80 space-y-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <History size={16} className="text-primary" /> Applicant Action History
            </h3>
            <p className="text-xs text-muted-foreground">
              Chronological log of administrative actions taken on {specialist.name} ({applicantId}).
            </p>
          </div>

          {auditLogs.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">No recorded actions for this applicant yet.</p>
          ) : (
            <div className="space-y-2.5 pt-2">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-black/40 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                        {log.action.replace("_", " ")}
                      </span>
                      <span className="text-muted-foreground text-[11px]">by {log.actorEmail}</span>
                    </div>
                    <p className="text-foreground">{log.details}</p>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resend Outgoing Email Dispatch Modal */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[#0c0e15] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Mail size={16} className="text-primary" /> Dispatch Notification to Applicant
                </h3>
                <p className="text-xs text-muted-foreground">Recipient: {specialist.email} ({applicantId})</p>
              </div>
              <button onClick={() => setEmailModalOpen(false)} className="p-1 rounded-lg hover:bg-white/10 text-muted-foreground">
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
                  <option value="custom">Custom Message</option>
                  <option value="welcome">Welcome / Application Received</option>
                  <option value="status_change">Stage Progression Update</option>
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
                      rows={5}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-foreground focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => setEmailModalOpen(false)} className="rounded-xl border-white/10 text-xs">
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
