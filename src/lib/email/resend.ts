// Resend Email Dispatcher for Neubofy Specialist Network & Careers
// Powered by Resend REST API

export type EmailSenderType = 
  | 'careers'       // careers@updates.neubofy.in
  | 'specialists'   // specialists@updates.neubofy.in
  | 'onboarding'    // onboarding@updates.neubofy.in
  | 'security'      // security@updates.neubofy.in
  | 'notifications';// notifications@updates.neubofy.in

export type ReplyToType = 
  | 'careers@neubofy.in'
  | 'contact@neubofy.in' 
  | 'support@neubofy.in';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  sender?: EmailSenderType;
  replyTo?: ReplyToType;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
}

const SENDER_MAP: Record<EmailSenderType, string> = {
  careers: "Neubofy Careers <careers@updates.neubofy.in>",
  specialists: "Neubofy Specialist Network <specialists@updates.neubofy.in>",
  onboarding: "Neubofy Onboarding <onboarding@updates.neubofy.in>",
  security: "Neubofy Security <security@updates.neubofy.in>",
  notifications: "Neubofy Updates <notifications@updates.neubofy.in>",
};

export async function sendEmail({
  to,
  subject,
  html,
  text,
  sender = 'careers',
  replyTo = 'careers@neubofy.in',
}: SendEmailOptions): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY || process.env.RESEND_KEY;

  const recipients = Array.isArray(to) ? to : [to];
  const fromAddress = SENDER_MAP[sender] || SENDER_MAP.careers;

  if (!apiKey) {
    console.warn(
      `[Resend Simulated] RESEND_API_KEY not configured. Simulated dispatch to: ${recipients.join(", ")} | From: ${fromAddress} | Subject: "${subject}"`
    );
    return {
      success: true,
      messageId: `sim_${Date.now()}`,
      simulated: true,
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress,
        to: recipients,
        reply_to: replyTo,
        subject: subject,
        html: html,
        text: text,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Resend API Error]", data);
      return {
        success: false,
        error: data.message || `Resend API failed with status ${response.status}`,
      };
    }

    return {
      success: true,
      messageId: data.id,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error sending email";
    console.error("[Resend Exception]", message);
    return {
      success: false,
      error: message,
    };
  }
}
