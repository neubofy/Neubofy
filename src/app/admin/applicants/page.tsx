"use client";

import React, { useEffect, useState } from "react";
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
import { recordAdminActivity, getApplicantId } from "@/lib/admin/team";
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
  AlertCircle
} from "lucide-react";

export default function ApplicantsPipelinePage() {
  const { user: currentUser, role: currentRole } = useAdmin();
  const router = useRouter();

  const [partners, setPartners] = useState<PartnerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusTab, setStatusTab] = useState<string>("all");
  const [capabilityFilter, setCapabilityFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Feedback Notification
  const [actionFeedback, setActionFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

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
        setLoading(false);
      }, (err) => {
        console.error("Firestore listener error on /users:", err);
        setLoading(false);
      });
    } catch (e) {
      console.error("Error setting up snapshot:", e);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

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

  // 1-Click Accept Applicant
  const handleAcceptApplicant = async (partner: PartnerProfile, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    try {
      const docRef = doc(getFirebaseDb(), "users", partner.uid);
      await updateDoc(docRef, {
        status: "onboarded",
        verified: true,
        updatedAt: new Date().toISOString(),
      });

      await recordAdminActivity({
        actorEmail: currentUser?.email || "Super Administrator",
        actorUid: currentUser?.uid || "admin",
        action: "ACCEPT_APPLICANT",
        targetId: partner.uid,
        targetName: partner.name,
        details: `Accepted applicant ${partner.name} (${getApplicantId(partner.uid)}) as verified specialist in ${partner.category}`,
      });

      if (partner.email) {
        processPartnerStatusChange({
          partnerUid: partner.uid,
          partnerEmail: partner.email,
          partnerName: partner.name,
          category: partner.category,
          newStatus: "onboarded",
          notifyPartner: true,
        }).catch(console.error);
      }

      setActionFeedback({
        type: "success",
        message: `Accepted ${partner.name}! Status updated to Verified Specialist and welcome email dispatched.`
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
        actorEmail: currentUser?.email || "Super Administrator",
        actorUid: currentUser?.uid || "admin",
        action: "REJECT_APPLICANT",
        targetId: partner.uid,
        targetName: partner.name,
        details: `Archived/declined application for ${partner.name} (${getApplicantId(partner.uid)})`,
      });

      if (partner.email) {
        processPartnerStatusChange({
          partnerUid: partner.uid,
          partnerEmail: partner.email,
          partnerName: partner.name,
          category: partner.category,
          newStatus: "archived",
          notifyPartner: true,
        }).catch(console.error);
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

  // Open Email Modal
  const openEmailModal = (partner: PartnerProfile, defaultType: "welcome" | "status_change" | "custom" = "custom") => {
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
          actorEmail: currentUser?.email || "Super Administrator",
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

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Admin
            </Link>
            <span className="text-xs text-muted-foreground">/</span>
            <span className="text-xs text-primary font-semibold">Applicants</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Specialist Applicants Pipeline</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Triage candidate dossiers, assess capabilities, and make one-click recruitment decisions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/career/onboard" target="_blank">
            <Button size="sm" variant="outline" className="rounded-xl border-white/10 text-xs gap-1.5 h-9">
              <ExternalLink size={13} /> Public Application Form
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Feedback Banner */}
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

      {/* Search, Filter & View Mode Toolbar */}
      <div className="glass-card p-4 rounded-2xl border border-white/10 bg-[#0c0e15]/80 space-y-4">
        
        {/* Stage Filter Pills & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
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
              placeholder="Search name, email, skill, or ID (APP-...)..."
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
          <RefreshCw className="animate-spin w-4 h-4 text-primary" /> Loading candidate applications...
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
              ? "No candidates matched your search or stage filters."
              : "No specialist applications have been registered in Firestore yet. Candidates who complete onboarding at /career will appear here."}
          </p>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 1: GRID DOSSIER CARDS (EXECUTIVE VIEW) */}
      {/* ========================================================================= */}
      {!loading && filteredPartners.length > 0 && viewMode === "grid" && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPartners.map((partner) => {
            const applicantId = getApplicantId(partner.uid);
            const statusInfo = PARTNER_STATUS_LABELS[partner.status] || PARTNER_STATUS_LABELS.draft;
            return (
              <div
                key={partner.uid}
                className="glass-card rounded-2xl border border-white/10 hover:border-primary/40 transition-all duration-300 p-5 bg-[#0c0e15]/90 flex flex-col justify-between space-y-4 group shadow-xl"
              >
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
                        <div className="flex items-center gap-1.5">
                          <Link href={`/admin/applicants/${partner.uid}`} className="hover:text-primary transition-colors">
                            <h3 className="font-bold text-base text-foreground flex items-center gap-1">
                              {partner.name}
                              {partner.verified && (
                                <CheckCircle2 size={14} className="text-emerald-400 fill-emerald-400/20" />
                              )}
                            </h3>
                          </Link>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-muted-foreground border border-white/10">
                            {applicantId}
                          </span>
                          <span className="text-xs text-primary font-medium">{partner.category}</span>
                        </div>
                      </div>
                    </div>

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

                {/* 1-Click Accept / Reject Action Toolbar */}
                <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
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

                  <div className="flex items-center gap-1">
                    <Link href={`/admin/applicants/${partner.uid}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2.5 text-xs rounded-xl border-white/10 hover:bg-white/10 gap-1 font-medium"
                      >
                        <Eye size={12} /> Page
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
                  <th className="py-3.5 px-4">Applicant ID</th>
                  <th className="py-3.5 px-4">Candidate</th>
                  <th className="py-3.5 px-4">Domain</th>
                  <th className="py-3.5 px-4">Capabilities</th>
                  <th className="py-3.5 px-4">Stage</th>
                  <th className="py-3.5 px-4">Rating</th>
                  <th className="py-3.5 px-4 text-right">Quick Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredPartners.map((partner) => {
                  const applicantId = getApplicantId(partner.uid);
                  const statusInfo = PARTNER_STATUS_LABELS[partner.status] || PARTNER_STATUS_LABELS.draft;
                  return (
                    <tr 
                      key={partner.uid} 
                      className="hover:bg-white/[0.02] transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/applicants/${partner.uid}`)}
                    >
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-muted-foreground">
                        <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-foreground font-semibold text-[11px]">
                          {applicantId}
                        </span>
                      </td>

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

                      <td className="py-3.5 px-4 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
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

      {/* Resend Email Dispatch Modal */}
      {emailModalPartner && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-lg bg-[#0c0e15] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Mail size={16} className="text-primary" /> Notification to Candidate
                </h3>
                <p className="text-xs text-muted-foreground">Recipient: {emailModalPartner.email} ({getApplicantId(emailModalPartner.uid)})</p>
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
