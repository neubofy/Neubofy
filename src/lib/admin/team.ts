// Neubofy Internal Team & Audit Activity System

import { 
  doc, 
  setDoc, 
  collection, 
  addDoc, 
  getDoc, 
  deleteDoc, 
  updateDoc, 
  query, 
  where, 
  getDocs, 
  writeBatch 
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/firebase";
import { AdminRole } from "./rbac";

export interface NeubofyTeamMember {
  uid: string;
  email: string;
  displayName: string;
  role: AdminRole;
  invitedBy: string;
  communicationEmail?: string;
  createdAt: string;
  lastActive: string;
  photoURL?: string;
}

/**
 * Updates an administrator's preferred personal communication/reply-to email
 */
export async function updateAdminCommunicationEmail(uid: string, communicationEmail: string): Promise<{ success: boolean; error?: string }> {
  try {
    const adminDocRef = doc(getFirebaseDb(), "admins", uid);
    await setDoc(adminDocRef, {
      communicationEmail: communicationEmail.trim().toLowerCase(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to update communication email:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to update email" };
  }
}

export type AuditLogAction = 
  | 'STATUS_CHANGE' 
  | 'ACCEPT_APPLICANT'
  | 'REJECT_APPLICANT'
  | 'ADD_NOTE' 
  | 'SEND_EMAIL' 
  | 'ASSIGN_ROLE' 
  | 'REVOKE_ROLE' 
  | 'REMOVE_ADMIN'
  | 'DELETE_APPLICANT'
  | 'SCHEDULE_INTERVIEW'
  | 'PURGE_LOGS'
  | 'EXPORT_DATA'
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
 * Permanently deletes an applicant profile from /users/{uid} (Super Administrator only)
 */
export async function deleteApplicantRecord(
  applicantUid: string,
  actorEmail: string,
  actorUid: string,
  applicantName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const userDocRef = doc(getFirebaseDb(), "users", applicantUid);
    await deleteDoc(userDocRef);

    await recordAdminActivity({
      actorEmail,
      actorUid,
      action: "DELETE_APPLICANT",
      targetId: applicantUid,
      targetName: applicantName,
      details: `Permanently deleted candidate application dossier and all associated data.`,
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to delete applicant record:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to delete applicant" };
  }
}

/**
 * Removes an administrator from /admins/{uid} (Super Administrator only)
 */
export async function removeAdminMember(
  adminUid: string,
  actorEmail: string,
  actorUid: string,
  memberEmail: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const adminDocRef = doc(getFirebaseDb(), "admins", adminUid);
    await deleteDoc(adminDocRef);

    await recordAdminActivity({
      actorEmail,
      actorUid,
      action: "REMOVE_ADMIN",
      targetId: adminUid,
      targetName: memberEmail,
      details: `Revoked administrative privileges and removed team member profile.`,
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to remove admin member:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to remove administrator" };
  }
}

/**
 * Prunes audit logs older than a specified number of days (Super Administrator only)
 */
export async function purgeOldAuditLogs(
  daysOld: number,
  actorEmail: string,
  actorUid: string
): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000).toISOString();
    const logsRef = collection(getFirebaseDb(), "audit_logs");
    const q = query(logsRef, where("timestamp", "<", cutoffDate));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return { success: true, count: 0 };
    }

    const batch = writeBatch(getFirebaseDb());
    let deletedCount = 0;

    snapshot.docs.forEach((d) => {
      batch.delete(d.ref);
      deletedCount++;
    });

    await batch.commit();

    await recordAdminActivity({
      actorEmail,
      actorUid,
      action: "PURGE_LOGS",
      targetId: "SYSTEM",
      targetName: "Audit Trail Maintenance",
      details: `Pruned ${deletedCount} audit log entries older than ${daysOld} days (prior to ${cutoffDate.slice(0, 10)}).`,
    });

    return { success: true, count: deletedCount };
  } catch (err: unknown) {
    console.error("Failed to purge audit logs:", err);
    return { success: false, count: 0, error: err instanceof Error ? err.message : "Failed to purge audit logs" };
  }
}

/**
 * Schedules a technical interview meeting with an applicant
 */
export async function scheduleApplicantInterview({
  applicantUid,
  meetingUrl,
  scheduledAt,
  timezone = "IST",
  interviewerName,
  actorEmail,
  actorUid,
  applicantName,
}: {
  applicantUid: string;
  meetingUrl: string;
  scheduledAt: string;
  timezone?: string;
  interviewerName?: string;
  actorEmail: string;
  actorUid: string;
  applicantName: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const userDocRef = doc(getFirebaseDb(), "users", applicantUid);
    await updateDoc(userDocRef, {
      interviewMeetingUrl: meetingUrl,
      interviewScheduledAt: scheduledAt,
      interviewTimezone: timezone,
      interviewerName: interviewerName || actorEmail,
      status: "interview",
      updatedAt: new Date().toISOString(),
    });

    await recordAdminActivity({
      actorEmail,
      actorUid,
      action: "SCHEDULE_INTERVIEW",
      targetId: applicantUid,
      targetName: applicantName,
      details: `Scheduled technical interview call on ${scheduledAt} (${timezone}) with meeting link: ${meetingUrl}`,
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("Failed to schedule interview:", err);
    return { success: false, error: err instanceof Error ? err.message : "Failed to schedule interview" };
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
