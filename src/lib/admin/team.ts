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
