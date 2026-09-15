// Role-Based Access Control (RBAC) for Neubofy Admin Portal

export type AdminRole = 'super_admin' | 'admin' | 'member';

export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
  role: AdminRole;
}

// Built-in initial super admins and admins
const DEFAULT_SUPER_ADMINS = [
  "pawan@neubofy.in",
  "admin@neubofy.in",
  "founder@neubofy.in",
];

const DEFAULT_ADMINS = [
  "partner@neubofy.in",
  "partners@neubofy.in",
  "support@neubofy.in",
  "recruitment@neubofy.in",
];

export function resolveAdminRole(email: string | null | undefined, firestoreRole?: AdminRole): AdminRole | null {
  if (!email) return null;
  const normalized = email.toLowerCase().trim();

  // Check firestore role if explicitly set
  if (firestoreRole && ['super_admin', 'admin', 'member'].includes(firestoreRole)) {
    return firestoreRole;
  }

  // Check env overrides
  const envSuperAdmins = (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAILS || "")
    .toLowerCase()
    .split(",")
    .map(e => e.trim())
    .filter(Boolean);

  const envAdmins = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
    .toLowerCase()
    .split(",")
    .map(e => e.trim())
    .filter(Boolean);

  if (DEFAULT_SUPER_ADMINS.includes(normalized) || envSuperAdmins.includes(normalized)) {
    return 'super_admin';
  }

  if (DEFAULT_ADMINS.includes(normalized) || envAdmins.includes(normalized)) {
    return 'admin';
  }

  // Domain-level fallback for neubofy.in staff
  if (normalized.endsWith("@neubofy.in")) {
    return 'admin';
  }

  return null;
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
  return role === 'super_admin' || role === 'admin' || role === 'member';
}
