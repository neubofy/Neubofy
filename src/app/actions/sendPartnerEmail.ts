"use server";

import { sendEmail, EmailSenderType, ReplyToType } from "@/lib/email/resend";
import {
  getApplicationReceivedTemplate,
  getScreeningTemplate,
  getInterviewInvitationTemplate,
  getPartnerVerifiedTemplate,
  getApplicationUpdateTemplate,
  getCustomMessageTemplate,
  getRawHtmlTemplate,
  InterviewMeetingDetails,
  ScreeningEmailDetails,
} from "@/lib/email/templates";
import { PartnerStatus } from "@/lib/partner/types";

export interface SendPartnerNotificationParams {
  partnerEmail: string;
  partnerName: string;
  category?: string;
  type: 'welcome' | 'status_change' | 'custom' | 'raw_html';
  newStatus?: PartnerStatus;
  meetingDetails?: InterviewMeetingDetails;
  screeningDetails?: ScreeningEmailDetails;
  customNote?: string;
  bookingUrl?: string; // Legacy fallback
  customSubject?: string;
  customMessage?: string;
  customHtml?: string;
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
  meetingDetails,
  screeningDetails,
  customNote,
  bookingUrl,
  customSubject,
  customMessage,
  customHtml,
  replyTo = "careers@neubofy.in",
}: SendPartnerNotificationParams): Promise<SendPartnerNotificationResult> {
  if (!partnerEmail) {
    return { success: false, error: "Recipient email is required" };
  }

  try {
    let template;
    let sender: EmailSenderType = "careers";

    if (type === "welcome") {
      template = getApplicationReceivedTemplate(partnerName, category, customNote);
      sender = "careers";
    } else if (type === "status_change") {
      switch (newStatus) {
        case "screening":
          template = getScreeningTemplate(partnerName, {
            category,
            requestDocs: screeningDetails?.requestDocs ?? true,
            docChecklist: screeningDetails?.docChecklist,
            customNote: screeningDetails?.customNote || customNote,
          });
          sender = "careers";
          break;
        case "shortlisted":
        case "interview":
          template = getInterviewInvitationTemplate(
            partnerName, 
            meetingDetails ? { ...meetingDetails, customNote: meetingDetails.customNote || customNote } : (bookingUrl ? { meetingUrl: bookingUrl } : undefined)
          );
          sender = "specialists";
          break;
        case "onboarded":
          template = getPartnerVerifiedTemplate(partnerName, category, customNote);
          sender = "onboarding";
          break;
        case "archived":
          template = getApplicationUpdateTemplate(partnerName, customNote);
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
    } else if (type === "raw_html") {
      if (!customSubject || !customHtml) {
        return { success: false, error: "Subject and HTML content are required for raw HTML emails" };
      }
      template = getRawHtmlTemplate(customHtml, customSubject);
      sender = "specialists";
    }

    if (!template) {
      return { success: false, error: "Invalid template requested" };
    }

    const result = await sendEmail({
      to: partnerEmail,
      subject: customSubject || template.subject,
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
