"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getFirebaseDb } from "@/lib/firebase/firebase";
import { doc, getDoc, updateDoc, onSnapshot, collection, query, where } from "firebase/firestore";
import { 
  PartnerProfile, 
  PartnerStatus, 
  PARTNER_STATUS_LABELS, 
  InternalNote 
} from "@/lib/partner/types";
import { useAdmin } from "@/lib/admin/AdminContext";
import { processPartnerStatusChange } from "@/app/actions/adminPartnerActions";
import { sendPartnerNotification } from "@/app/actions/sendPartnerEmail";
import { recordAdminActivity, AuditLogEntry } from "@/lib/admin/team";
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
  AlertTriangle,
  X,
  History,
  Check
} from "lucide-react";
import Link from "next/link";

export default function SpecialistManagePage() {
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

  // Load Specialist Profile
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
      console.error("Error loading candidate doc:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id]);

  // Load Candidate Audit Trail
  useEffect(() => {
    if (!id) return;
    try {
      const logsRef = collection(getFirebaseDb(), "audit_logs");
      const q = query(logsRef, where("targetId", "==", id));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const logs: AuditLogEntry[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          logs.push({
            id: d.id,
            actorEmail: data.actorEmail,
            actorUid: data.actorUid,
            action: data.action,
            targetId: data.targetId,
            targetName: data.targetName,
            details: data.details,
            timestamp: data.timestamp,
          });
        });
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setAuditLogs(logs);
      });
      return () => unsubscribe();
    } catch (err) {
      console.warn("Could not setup audit log listener:", err);
    }
  }, [id]);

  // Change Recruitment Status
  const handleStatusChange = async (newStatus: PartnerStatus) => {
    if (!specialist || !currentUser) return;
    setChangingStatus(true);

    try {
      const docRef = doc(getFirebaseDb(), "users", specialist.uid);
      await updateDoc(docRef, {
        status: newStatus,
        verified: newStatus === "onboarded",
        updatedAt: new Date().toISOString(),
      });

      // Record Activity Log
      await recordAdminActivity({
        actorEmail: currentUser.email || "admin@neubofy.in",
        actorUid: currentUser.uid,
        action: "STATUS_CHANGE",
        targetId: specialist.uid,
        targetName: specialist.name,
        details: `Updated stage from ${specialist.status} to ${newStatus}${statusNotifyEmail ? " (Automated email dispatched)" : ""}`,
      });

      // Send Email Notification via Resend if enabled
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

  // Add Review Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialist || !currentUser || !newNote.trim()) return;
    setSubmittingNote(true);

    try {
      const noteItem: InternalNote = {
        id: `note_${Date.now()}`,
        authorEmail: currentUser.email || "admin@neubofy.in",
        note: newNote.trim(),
        createdAt: new Date().toISOString(),
      };

      const updatedNotes = [...(specialist.internalNotes || []), noteItem];
      const docRef = doc(getFirebaseDb(), "users", specialist.uid);
      await updateDoc(docRef, { internalNotes: updatedNotes });

      await recordAdminActivity({
        actorEmail: currentUser.email || "admin@neubofy.in",
        actorUid: currentUser.uid,
        action: "ADD_NOTE",
        targetId: specialist.uid,
        targetName: specialist.name,
        details: `Logged internal note: "${newNote.slice(0, 60)}..."`,
      });

      setSpecialist({ ...specialist, internalNotes: updatedNotes });
      setNewNote("");
    } catch (err) {
      console.error("Error posting note:", err);
    } finally {
      setSubmittingNote(false);
    }
  };

  // Set Star Rating
  const handleSetRating = async (newRating: number) => {
    if (!specialist || !currentUser) return;
    try {
      const docRef = doc(getFirebaseDb(), "users", specialist.uid);
      await updateDoc(docRef, { rating: newRating });

      await recordAdminActivity({
        actorEmail: currentUser.email || "admin@neubofy.in",
        actorUid: currentUser.uid,
        action: "RATE_CANDIDATE",
        targetId: specialist.uid,
        targetName: specialist.name,
        details: `Assigned specialist score of ${newRating}/5 stars`,
      });

      setSpecialist({ ...specialist, rating: newRating });
    } catch (err) {
      console.error("Error updating rating:", err);
    }
  };

  // Open Email Dispatch Modal
  const openEmailModal = () => {
    if (!specialist) return;
    setEmailFeedback(null);
    setEmailSender("careers");
    setEmailReplyTo("careers@neubofy.in");
    setEmailSubject(`Neubofy Specialist Opportunity — Update for ${specialist.name}`);
    setEmailBody(`Hi ${specialist.name},\n\nWe are reaching out from Neubofy Talent Operations regarding project requirements in ${specialist.category}.`);
    setEmailModalOpen(true);
  };

  // Dispatch Email via Resend
  const handleSendEmail = async () => {
    if (!specialist || !currentUser) return;
    setSendingEmail(true);
    setEmailFeedback(null);

    try {
      const res = await sendPartnerNotification({
        partnerEmail: specialist.email,
        partnerName: specialist.name,
        category: specialist.category,
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
            : `Email dispatched successfully via Resend to ${specialist.email}`,
        });

        await recordAdminActivity({
          actorEmail: currentUser.email || "admin@neubofy.in",
          actorUid: currentUser.uid,
          action: "SEND_EMAIL",
          targetId: specialist.uid,
          targetName: specialist.name,
          details: `Sent ${emailTemplateType} email via ${emailSender}@updates.neubofy.in`,
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
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!specialist) {
    return (
      <div className="glass-card p-12 rounded-3xl border border-white/10 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">Specialist Dossier Not Found</h2>
        <p className="text-sm text-muted-foreground">The candidate profile you requested does not exist or has been deleted.</p>
        <Link href="/admin">
          <Button variant="outline" className="rounded-xl border-white/10 text-xs gap-1.5">
            <ArrowLeft size={14} /> Back to ATS Pipeline
          </Button>
        </Link>
      </div>
    );
  }

  const statusInfo = PARTNER_STATUS_LABELS[specialist.status] || PARTNER_STATUS_LABELS.draft;

  return (
    <div className="space-y-6">
      
      {/* Top Breadcrumb & Back Action */}
      <div className="flex items-center justify-between">
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} /> Back to ATS Pipeline
        </Link>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert("Specialist manage link copied to clipboard.");
            }}
            className="rounded-xl border-white/10 text-xs h-8"
          >
            Copy Link
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
                <span className={`px-3 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.bg} ${statusInfo.color} flex items-center gap-1`}>
                  <Shield size={12} /> {statusInfo.label}
                </span>
              </div>
              <p className="text-sm text-primary font-medium">{specialist.category}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-muted-foreground mt-2">
                <span className="flex items-center gap-1.5"><Mail size={13} className="text-primary" /> {specialist.email}</span>
                <span className="flex items-center gap-1.5"><Phone size={13} className="text-primary" /> {specialist.phone || "No phone"}</span>
                <span>ID: <code className="text-foreground/80">{specialist.uid.slice(0, 8)}...</code></span>
              </div>
            </div>
          </div>

          {/* Star Rating Block */}
          <div className="flex flex-col items-center md:items-end bg-black/40 p-4 rounded-2xl border border-white/10 shrink-0">
            <span className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-1.5">Rating Score</span>
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
                Send automated email notice (<code className="text-primary">@updates.neubofy.in</code>) on status change
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
          <Layers size={14} /> Full Technical Dossier
        </button>

        <button
          onClick={() => setActiveTab("notes")}
          className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "notes"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <MessageSquare size={14} /> Review Notes ({specialist.internalNotes?.length || 0})
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center gap-1.5 ${
            activeTab === "history"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
          }`}
        >
          <History size={14} /> Audit Trail ({auditLogs.length})
        </button>
      </div>

      {/* SECTION 1: FULL DOSSIER */}
      {activeTab === "dossier" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Bio and Capabilities */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Bio Card */}
            <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c0e15]/80 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Professional Summary & Approach</h3>
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                {specialist.bio || "No summary provided."}
              </div>
            </div>

            {/* Stated Capabilities Badges */}
            <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c0e15]/80 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verified & Stated Capabilities</h3>
                <span className="text-xs text-primary font-medium">{specialist.capabilities.length} total</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {specialist.capabilities.map((cap) => (
                  <span key={cap} className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 border border-white/10 text-foreground">
                    {cap}
                  </span>
                ))}
              </div>
            </div>

          </div>

          {/* Right Col: Links & Quick Contacts */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c0e15]/80 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Profiles & Portfolios</h3>

              <div className="space-y-2.5">
                {specialist.cvUrl ? (
                  <a
                    href={specialist.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-primary/10 text-primary border border-primary/25 hover:bg-primary/20 transition-colors text-xs font-medium"
                  >
                    <span className="flex items-center gap-2"><FileText size={16} /> Open CV / Resume</span>
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  <div className="p-3 rounded-xl bg-black/30 border border-white/5 text-xs text-muted-foreground">
                    No CV URL submitted.
                  </div>
                )}

                {specialist.portfolioUrl && (
                  <a
                    href={specialist.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-xs"
                  >
                    <span className="flex items-center gap-2"><ExternalLink size={14} className="text-primary" /> Portfolio Site</span>
                    <ExternalLink size={12} className="text-muted-foreground" />
                  </a>
                )}

                {specialist.githubUrl && (
                  <a
                    href={specialist.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#24292F]/80 text-white border border-transparent hover:bg-[#24292F] transition-colors text-xs"
                  >
                    <span className="flex items-center gap-2"><Github size={14} /> GitHub Profile</span>
                    <ExternalLink size={12} />
                  </a>
                )}

                {specialist.linkedinUrl && (
                  <a
                    href={specialist.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-[#0077b5]/20 text-[#0077b5] border border-[#0077b5]/30 hover:bg-[#0077b5]/30 transition-colors text-xs"
                  >
                    <span className="flex items-center gap-2"><Linkedin size={14} /> LinkedIn Profile</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>

            {/* Quick Metadata Card */}
            <div className="glass-card p-6 rounded-3xl border border-white/10 bg-[#0c0e15]/80 space-y-2 text-xs text-muted-foreground">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">Record Details</h3>
              <p>Registered: <strong>{new Date(specialist.createdAt).toLocaleDateString()}</strong></p>
              <p>Last Modified: <strong>{new Date(specialist.updatedAt).toLocaleDateString()}</strong></p>
            </div>
          </div>

        </div>
      )}

      {/* SECTION 2: REVIEW NOTES */}
      {activeTab === "notes" && (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0c0e15]/80 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Internal Assessment & Team Evaluation Notes</h3>
            <span className="text-xs text-primary font-medium">{specialist.internalNotes?.length || 0} notes logged</span>
          </div>

          {/* Note Form */}
          <form onSubmit={handleAddNote} className="space-y-3">
            <textarea
              rows={3}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add evaluation note (e.g. Verified code sample, reviewed architecture approach, approved for interview invitation...)"
              className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-2xl text-xs focus:ring-1 focus:ring-primary focus:outline-none"
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={submittingNote || !newNote.trim()} className="btn-electric rounded-xl text-xs h-9 gap-1.5">
                <MessageSquare size={13} /> {submittingNote ? "Posting..." : "Post Review Note"}
              </Button>
            </div>
          </form>

          {/* Notes Feed */}
          <div className="space-y-3 pt-2">
            {specialist.internalNotes && specialist.internalNotes.length > 0 ? (
              specialist.internalNotes.map((note) => (
                <div key={note.id} className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <strong className="text-foreground">{note.authorEmail}</strong>
                    <span>{new Date(note.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-foreground/90 leading-relaxed">{note.note}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic text-center py-6">No evaluation notes logged yet.</p>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: AUDIT TRAIL */}
      {activeTab === "history" && (
        <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/10 bg-[#0c0e15]/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Activity & Audit Timeline</h3>
            <span className="text-xs text-primary font-medium">{auditLogs.length} events</span>
          </div>

          <div className="space-y-3">
            {auditLogs.length > 0 ? (
              auditLogs.map((log) => (
                <div key={log.id} className="p-3.5 rounded-2xl bg-black/30 border border-white/10 flex items-start justify-between gap-4 text-xs">
                  <div>
                    <span className="font-semibold text-foreground mr-2">{log.action}</span>
                    <span className="text-muted-foreground">{log.details}</span>
                    <span className="block text-[11px] text-muted-foreground/70 mt-1">Performed by {log.actorEmail}</span>
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground italic text-center py-6">No audit log entries recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* RESEND EMAIL DISPATCH MODAL */}
      {emailModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-xl bg-[#0e1017] border border-white/10 rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl">
            
            <div className="flex items-start justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold">Dispatch Resend Email</h3>
                <p className="text-xs text-muted-foreground">
                  Sending branded communication to <strong className="text-foreground">{specialist.name}</strong> ({specialist.email})
                </p>
              </div>
              <button
                onClick={() => setEmailModalOpen(false)}
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
                Email Template
              </label>
              <select
                value={emailTemplateType}
                onChange={(e) => setEmailTemplateType(e.target.value as any)}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
              >
                <option value="custom">Custom Message (compose subject & body below)</option>
                <option value="welcome">Specialist Welcome / Application Received Template</option>
                <option value="status_change">Recruitment Stage Update Template</option>
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
                    <option value="onboarded">Verified Specialist Welcome</option>
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
                    placeholder="Type message..."
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-xl text-xs focus:ring-1 focus:ring-primary focus:outline-none text-foreground"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEmailModalOpen(false)}
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
