export type PartnerStatus = 
  | 'draft'
  | 'applied'
  | 'screening'
  | 'shortlisted'
  | 'interview'
  | 'onboarded'
  | 'archived';

export interface InternalNote {
  id: string;
  authorEmail: string;
  note: string;
  createdAt: string;
}

export interface PartnerProfile {
  uid: string;
  name: string;
  email: string;
  phone: string;
  photoURL?: string;
  category: string;
  capabilities: string[];
  bio: string;
  portfolioUrl?: string;
  cvUrl?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  status: PartnerStatus;
  rating?: number; // 1-5 scale
  internalNotes?: InternalNote[];
  verified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const PARTNER_CATEGORIES = [
  "AI Architect / AI Systems Engineer",
  "Security Engineer / Software & Code Auditor",
  "Full-Stack Software Engineer",
  "Backend & Distributed Systems Architect",
  "Frontend & Web Experience Specialist",
  "Mobile Application Developer (Android / iOS)",
  "DevOps, Cloud & Infrastructure Engineer",
  "Workflow & Automation Specialist (n8n / Zapier / Python)",
  "QA & Independent Verification Specialist",
  "Technology Strategy & Enterprise Consultant",
] as const;

export const STANDARD_CAPABILITIES = [
  "Android App Development",
  "iOS & Cross-Platform Mobile",
  "Static Web App / High-Performance Jamstack",
  "Full-Fledged Web Application (SaaS / Portals)",
  "Workflow & Process Automation (n8n / Zapier / Scripts)",
  "AI & LLM Systems (RAG, Agents, LLM Integrations)",
  "Enterprise Integrations & REST/GraphQL APIs",
  "Security & Code Audit / Vulnerability Assessment",
  "Cloud & DevOps Infrastructure (AWS / GCP / Docker / K8s)",
  "Technology Architecture & Solution Consultation",
  "Existing-System Modernization & Performance Tuning",
] as const;

export const PARTNER_STATUS_LABELS: Record<PartnerStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "Draft / Incomplete", color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/30" },
  applied: { label: "Application Received", color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/30" },
  screening: { label: "In Screening", color: "text-indigo-400", bg: "bg-indigo-400/10 border-indigo-400/30" },
  shortlisted: { label: "Shortlisted", color: "text-purple-400", bg: "bg-purple-400/10 border-purple-400/30" },
  interview: { label: "Interview Scheduled", color: "text-cyan-400", bg: "bg-cyan-400/10 border-cyan-400/30" },
  onboarded: { label: "Verified Partner", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/30" },
  archived: { label: "Archived", color: "text-zinc-400", bg: "bg-zinc-400/10 border-zinc-400/30" },
};
