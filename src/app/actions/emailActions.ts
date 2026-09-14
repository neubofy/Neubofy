'use server';

import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export async function sendOnboardingEmail({ email, name }: { email: string, name: string }) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set. Simulating onboarding email for:", email);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: 'Neubofy <onboarding@updates.neubofy.in>',
      replyTo: 'partners@neubofy.in',
      to: email,
      subject: 'Welcome to the Neubofy Partner Network',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #000;">Welcome, ${name}!</h2>
          <p>Thank you for joining the Neubofy Partner Network. Your profile is currently under review (Pending).</p>
          <p>We will review your application and get back to you soon.</p>
          <p>In the meantime, make sure your profile is complete and up to date by logging in to the partner portal.</p>
          <br />
          <p>Best regards,</p>
          <p><strong>The Neubofy Team</strong></p>
          <img src="https://neubofy.in/neubofylogo.png" alt="Neubofy Logo" style="width: 150px; margin-top: 20px;" />
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error sending onboarding email:", error);
    return { success: false, error };
  }
}

export async function sendStatusUpdateEmail({ email, name, status }: { email: string, name: string, status: string }) {
  if (!resend) {
    console.warn("RESEND_API_KEY is not set. Simulating status update email for:", email);
    return { success: true, simulated: true };
  }

  try {
    const data = await resend.emails.send({
      from: 'Neubofy Screening <screening@updates.neubofy.in>',
      replyTo: 'support@neubofy.in',
      to: email,
      subject: `Your Neubofy Partner Status Update: ${status}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #000;">Hello ${name},</h2>
          <p>Your Neubofy Partner status has been updated to: <strong style="text-transform: capitalize;">${status}</strong>.</p>
          <p>If you have any questions or need further clarification, please reply to this email or contact support.</p>
          <br />
          <p>Best regards,</p>
          <p><strong>The Neubofy Team</strong></p>
          <img src="https://neubofy.in/neubofylogo.png" alt="Neubofy Logo" style="width: 150px; margin-top: 20px;" />
        </div>
      `,
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error sending status update email:", error);
    return { success: false, error };
  }
}
