"use server";

import { PartnerStatus } from "@/lib/partner/types";
import { sendPartnerNotification } from "./sendPartnerEmail";

export interface UpdatePartnerStatusParams {
  partnerUid: string;
  partnerEmail: string;
  partnerName: string;
  category?: string;
  newStatus: PartnerStatus;
  notifyPartner?: boolean;
  bookingUrl?: string;
}

export async function processPartnerStatusChange({
  partnerUid,
  partnerEmail,
  partnerName,
  category,
  newStatus,
  notifyPartner = true,
  bookingUrl,
}: UpdatePartnerStatusParams) {
  try {
    let emailResult = null;

    if (notifyPartner && partnerEmail) {
      emailResult = await sendPartnerNotification({
        partnerEmail,
        partnerName,
        category,
        type: "status_change",
        newStatus,
        bookingUrl,
      });
    }

    return {
      success: true,
      emailSent: emailResult?.success ?? false,
      emailMessage: emailResult?.messageId,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Error processing status change";
    console.error("[processPartnerStatusChange Exception]", errorMsg);
    return { success: false, error: errorMsg };
  }
}
