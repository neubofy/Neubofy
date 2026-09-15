// Role-Based Access Control (RBAC) for Neubofy Admin Portal
// Enforces 2-post admin architecture: 'super_admin' (Owner) and 'admin'

export type AdminRole = 'super_admin' | 'admin';

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  role: AdminRole;
}

/**
 * Resolves the admin role for an authenticated user.
 * 1. Checks if email matches NEXT_PUBLIC_ADMIN_EMAIL (Super Administrator / Owner via Vercel Secret)
 * 2. Checks if user has a verified record in Firestore /admins/{uid} ('super_admin' or 'admin')
 * 3. Otherwise returns null (Access Denied / 403)
 */
export function resolveAdminRole(email: string | null | undefined, firestoreRole?: AdminRole): AdminRole | null {
  if (!email) return null;
  const normalized = email.toLowerCase().trim();

  // 1. Check Owner/Super Admin from Vercel Secret / Environment Variable
  const ownerEnvEmail = (
    process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
    process.env.ADMIN_EMAIL ||
    process.env.OWNER_EMAIL ||
    ""
  ).toLowerCase().trim();

  // Support single or comma-separated emails configured in Vercel secrets
  const ownerEmails = ownerEnvEmail.split(",").map((e) => e.trim()).filter(Boolean);

  if (ownerEmails.length > 0 && ownerEmails.includes(normalized)) {
    return 'super_admin';
  }

  // 2. Check dynamic role stored in Firestore /admins/{uid}
  if (firestoreRole && (firestoreRole === 'super_admin' || firestoreRole === 'admin')) {
    return firestoreRole;
  }

  // Without an environment secret match or Firestore record, access is strictly denied
  return null;
}

export function isOwner(role: AdminRole | null): boolean {
  return role === 'super_admin';
}

export function canManagePartners(role: AdminRole | null): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function canSendPartnerEmails(role: AdminRole | null): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function canManageAdminRoles(role: AdminRole | null): boolean {
  return role === 'super_admin';
}

export function canViewDossiers(role: AdminRole | null): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function canDeleteApplicant(role: AdminRole | null): boolean {
  return role === 'super_admin';
}

export function canRemoveAdmin(role: AdminRole | null): boolean {
  return role === 'super_admin';
}

export function canPurgeLogs(role: AdminRole | null): boolean {
  return role === 'super_admin';
}

export function canExportData(role: AdminRole | null): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function canScheduleInterviews(role: AdminRole | null): boolean {
  return role === 'super_admin' || role === 'admin';
}
