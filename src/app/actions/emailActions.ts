'use server';

import { Resend } from 'resend';
import { adminAuth, adminDb } from '@/lib/firebase/firebaseAdmin';

const resend = new Resend(process.env.RESEND_API_KEY);

const BRAND_NAME = 'Neubofy';
const LOGO_URL = 'https://neubofy.in/neubofylogo.png';
const SUPPORT_EMAIL = 'support@neubofy.in';
const PARTNER_EMAIL = 'partners@neubofy.in';

// Helper to authenticate requests
async function authenticateRequest(idToken: string) {
  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    return null;
  }
}

export async function sendOnboardingEmail({ email, name, idToken }: { email: string; name: string, idToken: string }) {
  const user = await authenticateRequest(idToken);
  if (!user || user.email !== email) {
      throw new Error("Unauthorized");
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `Neubofy <onboarding@updates.neubofy.in>`,
      to: email,
      subject: 'Welcome to the Neubofy Partner Network',
      replyTo: PARTNER_EMAIL,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="${LOGO_URL}" alt="${BRAND_NAME}" style="max-height: 50px; margin-bottom: 20px;" />
          <h2>Welcome aboard, ${name}!</h2>
          <p>Thank you for submitting your profile to join the ${BRAND_NAME} Partner Network.</p>
          <p>Our team is currently reviewing your application. You will receive an update once your screening is complete.</p>
          <p>If you have any questions, feel free to reply to this email at ${PARTNER_EMAIL}.</p>
          <br />
          <p>Best regards,<br/>The ${BRAND_NAME} Team</p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Server error sending email:', error);
    return { success: false, error };
  }
}

export async function sendStatusUpdateEmail({ email, name, status, idToken }: { email: string; name: string; status: string, idToken: string }) {
  const user = await authenticateRequest(idToken);
  if (!user) {
      throw new Error("Unauthorized");
  }

  const ownerEmail = process.env.ADMIN_EMAIL || process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  if (user.email?.toLowerCase() !== ownerEmail?.toLowerCase()) {
      // It's not the owner, check admins collection
      const adminDoc = await adminDb.collection('admins').doc(user.uid).get();
      if (!adminDoc.exists) {
          throw new Error("Unauthorized: Only admins can send status updates.");
      }
  }

  let subject = `Update on your ${BRAND_NAME} Partner Application`;
  let message = `Your partner application status has been updated to: <strong>${status.toUpperCase()}</strong>.`;
  let fromEmail = `screening@updates.neubofy.in`;

  if (status === 'approved') {
    subject = `Congratulations! Welcome to the ${BRAND_NAME} Network`;
    message = `We are thrilled to let you know that your application has been approved. You are now officially a part of the ${BRAND_NAME} Partner Network!`;
    fromEmail = `onboarding@updates.neubofy.in`;
  } else if (status === 'screening') {
    subject = `${BRAND_NAME} Application Update: Screening Phase`;
    message = `We are currently actively screening your profile and will be in touch shortly with next steps.`;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `Neubofy <${fromEmail}>`,
      to: email,
      subject: subject,
      replyTo: PARTNER_EMAIL,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <img src="${LOGO_URL}" alt="${BRAND_NAME}" style="max-height: 50px; margin-bottom: 20px;" />
          <h2>Hello ${name},</h2>
          <p>${message}</p>
          <p>If you have any questions, you can reach out to us at ${PARTNER_EMAIL} or ${SUPPORT_EMAIL}.</p>
          <br />
          <p>Best regards,<br/>The ${BRAND_NAME} Team</p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending status email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Server error sending status email:', error);
    return { success: false, error };
  }
}
