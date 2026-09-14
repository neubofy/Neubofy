'use server';

import { adminDb } from '@/lib/firebase/firebaseAdmin';

/**
 * Bootstraps the owner into the admins collection if they are the designated super administrator.
 * We must pass the token to verify the user securely on the server.
 */
export async function bootstrapSuperAdmin(email: string, uid: string) {
  try {
    const ownerEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!ownerEmail) {
      console.warn("ADMIN_EMAIL is not set in environment variables.");
      return { success: false, message: "Server misconfiguration." };
    }

    if (email.toLowerCase() === ownerEmail.toLowerCase()) {
      // Add or update the owner in the admins collection
      await adminDb.collection('admins').doc(uid).set({
        email: email,
        role: 'superadmin',
        bootstrappedAt: new Date().toISOString()
      }, { merge: true });

      return { success: true, message: "Super admin bootstrapped successfully." };
    }

    return { success: false, message: "Not a super admin." };
  } catch (error) {
    console.error("Error bootstrapping super admin:", error);
    return { success: false, error: "Internal server error." };
  }
}
