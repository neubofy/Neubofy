"use server";

import { sendEmail, EmailSenderType, ReplyToType } from "@/lib/email/resend";
import {
  getApplicationReceivedTemplate,
  getScreeningTemplate,
  getInterviewInvitationTemplate,
  getPartnerVerifiedTemplate,
  getApplicationUpdateTemplate,
  getCustomMessageTemplate,
} from "@/lib/email/templates";
import { PartnerStatus } from "@/lib/partner/types";

export interface SendPartnerNotificationParams {
  partnerEmail: string;
  partnerName: string;
  category?: string;
  type: 'welcome' | 'status_change' | 'custom';
  newStatus?: PartnerStatus;
  bookingUrl?: string;
  customSubject?: string;
  customMessage?: string;
  replyTo?: ReplyToType;
}

export interface SendPartnerNotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  simulated?: boolean;
  skipped?: boolean;
}

export async function sendPartnerNotification({
  partnerEmail,
  partnerName,
  category = "Technology Specialist",
  type,
  newStatus,
  bookingUrl,
  customSubject,
  customMessage,
  replyTo = "careers@neubofy.in",
}: SendPartnerNotificationParams): Promise<SendPartnerNotificationResult> {
  if (!partnerEmail) {
    return { success: false, error: "Recipient email is required" };
  }

  try {
    let template;
    let sender: EmailSenderType = "careers";

    if (type === "welcome") {
      template = getApplicationReceivedTemplate(partnerName, category);
      sender = "careers";
    } else if (type === "status_change") {
      switch (newStatus) {
        case "screening":
          template = getScreeningTemplate(partnerName);
          sender = "careers";
          break;
        case "shortlisted":
        case "interview":
          template = getInterviewInvitationTemplate(partnerName, bookingUrl);
          sender = "specialists";
          break;
        case "onboarded":
          template = getPartnerVerifiedTemplate(partnerName, category);
          sender = "onboarding";
          break;
        case "archived":
          template = getApplicationUpdateTemplate(partnerName);
          sender = "careers";
          break;
        default:
          return { success: true, skipped: true };
      }
    } else if (type === "custom") {
      if (!customSubject || !customMessage) {
        return { success: false, error: "Subject and message are required for custom emails" };
      }
      template = getCustomMessageTemplate(partnerName, customSubject, customMessage);
      sender = "specialists";
    }

    if (!template) {
      return { success: false, error: "Invalid template requested" };
    }

    const result = await sendEmail({
      to: partnerEmail,
      subject: template.subject,
      html: template.html,
      text: template.text,
      sender,
      replyTo,
    });

    return result;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to send notification";
    console.error("[sendPartnerNotification Exception]", errorMsg);
    return { success: false, error: errorMsg };
  }
}
