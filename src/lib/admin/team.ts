// Neubofy Internal Team & Audit Activity System

import { doc, setDoc, collection, addDoc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/firebase";
import { AdminRole } from "./rbac";

export interface NeubofyTeamMember {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
  invitedBy: string;
  createdAt: string;
  lastActive: string;
  photoURL?: string;
}

export type AuditLogAction = 
  | 'STATUS_CHANGE' 
  | 'ACCEPT_APPLICANT'
  | 'REJECT_APPLICANT'
  | 'ADD_NOTE' 
  | 'SEND_EMAIL' 
  | 'ASSIGN_ROLE' 
  | 'REVOKE_ROLE' 
  | 'RATE_CANDIDATE';

export interface AuditLogEntry {
  id?: string;
  actorEmail: string;
  actorUid: string;
  action: AuditLogAction;
  targetId?: string;
  targetName?: string;
  details: string;
  timestamp: string;
}

/**
 * Records an activity into the internal audit logs collection for tracking and analytics
 */
export async function recordAdminActivity({
  actorEmail,
  actorUid,
  action,
  targetId,
  targetName,
  details,
}: Omit<AuditLogEntry, 'timestamp'>) {
  try {
    const logsRef = collection(getFirebaseDb(), "audit_logs");
    await addDoc(logsRef, {
      actorEmail,
      actorUid,
      action,
      targetId: targetId || "",
      targetName: targetName || "",
      details,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Failed to record admin activity log:", err);
  }
}

/**
 * Ensures that the Super Administrator has an active profile document in Firestore /admins/{uid}
 */
export async function ensureOwnerAdminProfile(uid: string, email: string, displayName?: string) {
  try {
    const adminDocRef = doc(getFirebaseDb(), "admins", uid);
    const snap = await getDoc(adminDocRef);

    if (!snap.exists()) {
      await setDoc(adminDocRef, {
        uid,
        email,
        displayName: displayName || "Super Administrator",
        role: "super_admin",
        invitedBy: "System (Environment Secret)",
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
      });
    } else {
      await setDoc(adminDocRef, {
        lastActive: new Date().toISOString(),
      }, { merge: true });
    }
  } catch (err) {
    console.warn("Could not sync owner admin profile in Firestore:", err);
  }
}

/**
 * Formats a consistent Neubofy Applicant ID: APP-XXXXXX
 */
export function getApplicantId(uid: string): string {
  if (!uid) return "APP-000000";
  const clean = uid.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `APP-${clean.slice(0, 6).padEnd(6, "0")}`;
}

/**
 * Formats a consistent Neubofian Team Member ID: NBF-XXX
 */
export function getNeubofianId(uid: string, email?: string): string {
  const normEmail = (email || "").toLowerCase().trim();
  const ownerEnv = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL || "").toLowerCase().trim();
  const ownerEmails = ownerEnv.split(",").map((e) => e.trim()).filter(Boolean);

  if (ownerEmails.length > 0 && ownerEmails.includes(normEmail)) {
    return "NBF-001";
  }
  const clean = uid.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return `NBF-${clean.slice(0, 4).padEnd(4, "X")}`;
}
