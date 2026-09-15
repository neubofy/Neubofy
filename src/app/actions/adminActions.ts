"use server";

import { adminDb, adminAuth } from "@/lib/firebase/firebaseAdmin";

/**
 * Bootstraps the owner into the admins collection if they are the designated super administrator.
 * We must pass the token to verify the user securely on the server to prevent privilege escalation.
 */
export async function bootstrapSuperAdmin(idToken: string) {
  try {
    const ownerEmail =
      process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;

    if (!ownerEmail) {
      console.warn("ADMIN_EMAIL is not set in environment variables.");
      return { success: false, message: "Server misconfiguration." };
    }

    // Securely verify the token to extract the true email and uid of the caller
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { email, uid } = decodedToken;

    if (!email) {
      return { success: false, message: "Invalid token structure." };
    }

    if (email.toLowerCase() === ownerEmail.toLowerCase()) {
      // Add or update the owner in the admins collection
      await adminDb.collection("admins").doc(uid).set(
        {
          email: email,
          role: "superadmin",
          bootstrappedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      // Set custom user claim for role-based access control
      await adminAuth.setCustomUserClaims(uid, { admin: true });

      return {
        success: true,
        message: "Super admin bootstrapped successfully.",
      };
    }

    return { success: false, message: "Not a super admin." };
  } catch (error) {
    console.error("Error bootstrapping super admin:", error);
    return { success: false, error: "Internal server error or invalid token." };
  }
}

/**
 * Invites or grants admin access to a user based on their email.
 */
export async function grantAdminAccessByEmail(
  targetEmail: string,
  idToken: string,
) {
  try {
    // 1. Verify the caller is an admin
    const decodedToken = await adminAuth.verifyIdToken(idToken);

    // Check if caller is superadmin by env var or has the admin claim
    const ownerEmail =
      process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const isOwner =
      ownerEmail &&
      decodedToken.email &&
      decodedToken.email.toLowerCase() === ownerEmail.toLowerCase();
    const hasAdminClaim = decodedToken.admin === true;

    if (!isOwner && !hasAdminClaim) {
      // Double check firestore just in case custom claims haven't propagated
      const adminDoc = await adminDb
        .collection("admins")
        .doc(decodedToken.uid)
        .get();
      if (!adminDoc.exists) {
        return {
          success: false,
          message:
            "Unauthorized. You do not have permission to grant admin access.",
        };
      }
    }

    // 2. Look up or create the target user
    let targetUid = "";
    try {
      const userRecord = await adminAuth.getUserByEmail(targetEmail);
      targetUid = userRecord.uid;
    } catch (error: any) {
      // If user doesn't exist, create a shell account they can later log into via password reset or OAuth linking
      if (error.code === "auth/user-not-found") {
        const newUser = await adminAuth.createUser({
          email: targetEmail,
          emailVerified: false,
        });
        targetUid = newUser.uid;
      } else {
        throw error;
      }
    }

    // 3. Grant privileges
    await adminAuth.setCustomUserClaims(targetUid, { admin: true });

    await adminDb.collection("admins").doc(targetUid).set(
      {
        email: targetEmail,
        role: "admin",
        addedAt: new Date().toISOString(),
        addedBy: decodedToken.uid,
      },
      { merge: true },
    );

    return {
      success: true,
      message: `Successfully granted admin access to ${targetEmail}.`,
    };
  } catch (error: any) {
    console.error("Error granting admin access:", error);
    return {
      success: false,
      message: error.message || "An error occurred while granting access.",
    };
  }
}

/**
 * Revokes admin access from a user based on their email.
 * This can only be performed by the superadmin (owner).
 */
export async function revokeAdminAccessByEmail(
  targetEmail: string,
  idToken: string,
) {
  try {
    // 1. Verify the caller is the superadmin (owner)
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const ownerEmail =
      process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    const isOwner =
      ownerEmail &&
      decodedToken.email &&
      decodedToken.email.toLowerCase() === ownerEmail.toLowerCase();

    if (!isOwner) {
      return {
        success: false,
        message:
          "Unauthorized. Only the super administrator can revoke admin access.",
      };
    }

    // You cannot revoke your own access
    if (targetEmail.toLowerCase() === ownerEmail?.toLowerCase()) {
      return {
        success: false,
        message: "Cannot revoke super administrator access.",
      };
    }

    // 2. Look up the target user
    let targetUid = "";
    try {
      const userRecord = await adminAuth.getUserByEmail(targetEmail);
      targetUid = userRecord.uid;
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        return { success: false, message: "User not found." };
      }
      throw error;
    }

    // 3. Revoke privileges
    // Remove custom claim
    await adminAuth.setCustomUserClaims(targetUid, null);

    // Remove from admins collection
    await adminDb.collection("admins").doc(targetUid).delete();

    return {
      success: true,
      message: `Successfully revoked admin access for ${targetEmail}.`,
    };
  } catch (error: any) {
    console.error("Error revoking admin access:", error);
    return {
      success: false,
      message: error.message || "An error occurred while revoking access.",
    };
  }
}
