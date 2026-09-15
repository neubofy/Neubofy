// Neubofy Branded Email Templates
// Specialist Network & Career Recruitment Operations

export interface EmailTemplateResult {
  subject: string;
  html: string;
  text: string;
}

export interface InterviewMeetingDetails {
  meetingUrl?: string;
  scheduledAt?: string;
  timezone?: string;
  interviewerName?: string;
  agendaNotes?: string;
  preparationTips?: string;
  customNote?: string;
}

export interface ScreeningEmailDetails {
  category?: string;
  requestDocs?: boolean;
  docChecklist?: string;
  customNote?: string;
  reviewerEmail?: string;
}

const BRAND_LOGO_URL = "https://neubofy.in/neubofylogo.png";
const WEBSITE_URL = "https://neubofy.in";

const getBaseEmailLayout = (contentHtml: string, previewText: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Neubofy Specialist Network</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #07080c;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    .wrapper {
      width: 100%;
      background-color: #07080c;
      padding: 40px 16px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #10121a;
      border: 1px solid #1f2433;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
    }
    .header {
      padding: 30px 32px 22px;
      text-align: center;
      border-bottom: 1px solid #1a1e2d;
      background: linear-gradient(180deg, #141724 0%, #10121a 100%);
    }
    .logo-img {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: inline-block;
      vertical-align: middle;
      border: 1px solid rgba(0, 240, 255, 0.3);
    }
    .brand-name {
      color: #ffffff;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.3px;
      margin-top: 10px;
      display: block;
    }
    .tagline {
      color: #64748b;
      font-size: 11px;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .body {
      padding: 32px;
      color: #cbd5e1;
      font-size: 15px;
      line-height: 1.65;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      background-color: rgba(0, 240, 255, 0.1);
      color: #00f0ff;
      border: 1px solid rgba(0, 240, 255, 0.25);
      margin-bottom: 16px;
    }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #00f0ff 0%, #0099ff 100%);
      color: #000000 !important;
      font-weight: 600;
      font-size: 15px;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 9999px;
      text-align: center;
      margin: 16px 0;
      box-shadow: 0 4px 20px rgba(0, 240, 255, 0.25);
    }
    .meeting-box {
      background: #0b0d14;
      border: 1px solid #00f0ff40;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }
    .card {
      background-color: #0b0d14;
      border: 1px solid #1a1e2d;
      border-radius: 12px;
      padding: 16px 20px;
      margin: 20px 0;
    }
    .note-box {
      background-color: rgba(0, 240, 255, 0.04);
      border-left: 3px solid #00f0ff;
      padding: 12px 16px;
      margin: 16px 0;
      border-radius: 0 8px 8px 0;
      font-size: 14px;
      color: #e2e8f0;
    }
    .timeline-steps {
      display: flex;
      justify-content: space-between;
      margin: 20px 0;
      padding: 14px;
      background: #0b0d14;
      border-radius: 12px;
      border: 1px solid #1a1e2d;
    }
    .step-item {
      text-align: center;
      font-size: 11px;
      color: #64748b;
    }
    .step-item.active {
      color: #00f0ff;
      font-weight: 600;
    }
    .step-item.completed {
      color: #34d399;
    }
    .footer {
      padding: 24px 32px;
      background-color: #0a0b10;
      border-top: 1px solid #161925;
      font-size: 12px;
      color: #64748b;
      text-align: center;
      line-height: 1.6;
    }
    .footer a {
      color: #00f0ff;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0;">
    ${previewText}
  </div>

  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="${BRAND_LOGO_URL}" alt="Neubofy" class="logo-img" />
        <span class="brand-name">NEUBOFY</span>
        <span class="tagline">Engineering & Specialist Talent Network</span>
      </div>

      <div class="body">
        ${contentHtml}
      </div>

      <div class="footer">
        <p style="margin: 0 0 6px;">
          This message was sent from the Neubofy Talent Operations Desk.<br>
          <a href="${WEBSITE_URL}" target="_blank">neubofy.in</a> • Technology Operations
        </p>
        <p style="margin: 0; font-size: 11px; color: #475569;">
          Replies to this email are routed directly to the reviewing engineering coordinator.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export function getApplicationReceivedTemplate(name: string, category: string, customNote?: string): EmailTemplateResult {
  const subject = `Application Received: ${category} — Neubofy Specialist Network`;
  const preview = `We have safely received your application for ${category} at Neubofy.`;
  const content = `
    <div class="badge">Application Received</div>
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Hi ${name},</h2>
    <p>Thank you for submitting your profile to join the <strong>Neubofy Specialist Network</strong> for <strong>${category}</strong>.</p>
    
    <p>Our senior engineers review your submitted code repositories, portfolio samples, and technical capabilities directly rather than using automated resume filters.</p>

    ${customNote ? `
      <div class="note-box">
        <strong>Message from Recruitment Desk:</strong><br>${customNote.replace(/\n/g, '<br>')}
      </div>
    ` : ''}

    <div class="card">
      <h4 style="margin: 0 0 8px; color: #00f0ff; font-size: 14px;">Next Steps in Review</h4>
      <p style="margin: 0 0 6px; font-size: 13px; color: #cbd5e1;">1. <strong>Portfolio & Code Review:</strong> Verification of past architecture and code samples.</p>
      <p style="margin: 0 0 6px; font-size: 13px; color: #cbd5e1;">2. <strong>Technical Alignment:</strong> Video interview with an engineering coordinator.</p>
      <p style="margin: 0; font-size: 13px; color: #cbd5e1;">3. <strong>Network Activation:</strong> Project matching and milestone delivery.</p>
    </div>

    <div style="text-align: center;">
      <a href="${WEBSITE_URL}/career/profile" class="btn">View Application Profile</a>
    </div>

    <p style="margin-top: 24px; font-size: 13px; color: #94a3b8;">
      Best regards,<br>
      <strong style="color: #ffffff;">Neubofy Talent Operations</strong>
    </p>
  `;

  return {
    subject,
    html: getBaseEmailLayout(content, preview),
    text: `Hi ${name},\n\nWe have received your application for ${category} at Neubofy. Track your status at ${WEBSITE_URL}/career/profile.\n\nBest regards,\nNeubofy Talent Operations`,
  };
}

export function getScreeningTemplate(name: string, details?: ScreeningEmailDetails): EmailTemplateResult {
  const category = details?.category || "Technology Specialist";
  const requestDocs = details?.requestDocs ?? true;
  const docChecklist = details?.docChecklist || "GitHub repositories, system architecture diagrams, live web app/API deployments, or code audit reports.";
  const customNote = details?.customNote || "";

  const subject = `Technical Screening Active: ${category} — Neubofy Specialist Network`;
  const preview = `Your profile is under active technical review. Additional documentation can be submitted.`;
  const content = `
    <div class="badge" style="background-color: rgba(99, 102, 241, 0.1); color: #818cf8; border-color: rgba(99, 102, 241, 0.25);">Under Technical Screening</div>
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Hi ${name},</h2>
    <p>Your application for <strong>${category}</strong> has advanced to active <strong>Technical Screening & Verification</strong>.</p>
    
    <p>Our engineering coordinators are currently evaluating your portfolio, architecture depth, and stated framework proficiencies.</p>

    ${customNote ? `
      <div class="note-box">
        <strong>Reviewer Note:</strong><br>${customNote.replace(/\n/g, '<br>')}
      </div>
    ` : ''}

    ${requestDocs ? `
      <div class="card" style="border-left: 3px solid #818cf8;">
        <h4 style="margin: 0 0 8px; color: #818cf8; font-size: 14px;">📂 Submit Additional Technical Artifacts (Optional)</h4>
        <p style="margin: 0 0 8px; font-size: 13px; color: #cbd5e1;">
          To help expedite technical validation, you may reply directly to this email with any verified materials:
        </p>
        <p style="margin: 0; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
          • ${docChecklist}
        </p>
        <p style="margin: 8px 0 0; font-size: 12px; color: #94a3b8;">
          💡 If sharing Google Drive or private GitHub repository invites, please share with the coordinator email or reply directly.
        </p>
      </div>
    ` : ''}

    <div style="text-align: center;">
      <a href="${WEBSITE_URL}/career/profile" class="btn">Check Profile Status</a>
    </div>

    <p style="margin-top: 24px; font-size: 13px; color: #94a3b8;">
      Best regards,<br>
      <strong style="color: #ffffff;">Neubofy Technical Review Team</strong>
    </p>
  `;

  return {
    subject,
    html: getBaseEmailLayout(content, preview),
    text: `Hi ${name},\n\nYour profile has advanced to active Technical Screening at Neubofy for ${category}.\n\nIf you have code repositories, diagrams, or links to share, you can reply directly to this email.\n\nBest regards,\nNeubofy Technical Review Team`,
  };
}

export function getInterviewInvitationTemplate(
  name: string, 
  meetingDetails?: InterviewMeetingDetails
): EmailTemplateResult {
  const meetingUrl = meetingDetails?.meetingUrl || "";
  const scheduledAt = meetingDetails?.scheduledAt || "To be confirmed upon your reply";
  const timezone = meetingDetails?.timezone || "IST";
  const interviewer = meetingDetails?.interviewerName || "Engineering Coordinator";
  const agendaNotes = meetingDetails?.agendaNotes || "Technical background review, past architectural work, and project delivery coordination.";
  const preparationTips = meetingDetails?.preparationTips || "Be ready to walk through 1-2 representative code repositories or system design decisions you have authored.";
  const customNote = meetingDetails?.customNote || "";

  const subject = `Technical Interview Call: Neubofy Specialist Network`;
  const preview = `You have been shortlisted for a technical interview call with Neubofy!`;
  
  const content = `
    <div class="badge" style="background-color: rgba(168, 85, 247, 0.1); color: #c084fc; border-color: rgba(168, 85, 247, 0.25);">Technical Interview</div>
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Hi ${name},</h2>
    <p>Your technical qualifications and submitted capabilities have been shortlisted. We would like to invite you to a 30-minute technical interview call.</p>

    ${customNote ? `
      <div class="note-box">
        <strong>Interviewer Note:</strong><br>${customNote.replace(/\n/g, '<br>')}
      </div>
    ` : ''}

    <div class="meeting-box">
      <h3 style="margin: 0 0 12px; color: #00f0ff; font-size: 16px;">
        📅 Interview Schedule & Meeting Details
      </h3>
      <table style="width: 100%; font-size: 14px; color: #cbd5e1; line-height: 1.8;">
        <tr>
          <td style="width: 120px; color: #64748b; font-weight: 600;">Time / Date:</td>
          <td style="color: #ffffff; font-weight: 600;">${scheduledAt} (${timezone})</td>
        </tr>
        <tr>
          <td style="color: #64748b; font-weight: 600;">Interviewer:</td>
          <td>${interviewer}</td>
        </tr>
        <tr>
          <td style="color: #64748b; font-weight: 600;">Format:</td>
          <td>Video Call (Google Meet / Zoom) — 30 minutes</td>
        </tr>
        <tr>
          <td style="color: #64748b; font-weight: 600; vertical-align: top;">Agenda:</td>
          <td>${agendaNotes}</td>
        </tr>
      </table>

      ${meetingUrl ? `
        <div style="text-align: center; margin-top: 18px;">
          <a href="${meetingUrl}" class="btn" style="padding: 12px 32px;">Join Video Meeting Call</a>
          <p style="font-size: 12px; color: #64748b; margin: 8px 0 0;">Link: <a href="${meetingUrl}" style="color: #00f0ff;">${meetingUrl}</a></p>
        </div>
      ` : `
        <p style="font-size: 13px; color: #94a3b8; margin-top: 14px; padding-top: 10px; border-top: 1px solid #1a1e2d;">
          Please reply directly to this email with your preferred time slot or meeting link to confirm.
        </p>
      `}
    </div>

    <div class="card">
      <h4 style="margin: 0 0 6px; color: #c084fc; font-size: 13px;">💡 Preparation Notes</h4>
      <p style="margin: 0; font-size: 13px; color: #cbd5e1;">${preparationTips}</p>
    </div>

    <p style="font-size: 13px; color: #94a3b8;">
      <strong>Need to Reschedule?</strong> If the proposed time conflicts with your schedule, simply reply directly to this email with 2-3 alternate time slots.
    </p>

    <div style="margin-top: 20px; padding: 12px 16px; background: #0b0d14; border: 1px solid #1f2433; border-radius: 10px; font-size: 12px; color: #64748b; text-align: center;">
      ⭐ <strong>Candidate Experience:</strong> We respect your time. Let us know your thoughts or feedback on our recruitment process by replying directly.
    </div>

    <p style="margin-top: 24px; font-size: 13px; color: #94a3b8;">
      Looking forward to our discussion,<br>
      <strong style="color: #ffffff;">${interviewer}</strong><br>
      Neubofy Engineering Team
    </p>
  `;

  return {
    subject,
    html: getBaseEmailLayout(content, preview),
    text: `Hi ${name},\n\nYou have been shortlisted for a technical interview call with Neubofy!\n\nSchedule: ${scheduledAt} (${timezone})\nInterviewer: ${interviewer}\nMeeting Link: ${meetingUrl || 'To be confirmed upon reply'}\n\nIf this time doesn't work, reply directly with 2-3 alternate slots.\n\nBest regards,\n${interviewer}\nNeubofy Engineering Team`,
  };
}

export function getVerifiedWelcomeTemplate(name: string, category: string, customNote?: string): EmailTemplateResult {
  const subject = `Welcome to the Neubofy Specialist Network — Verified Specialist`;
  const preview = `Your profile has been verified as an official Neubofy Network Specialist!`;
  const content = `
    <div class="badge" style="background-color: rgba(16, 185, 129, 0.1); color: #34d399; border-color: rgba(16, 185, 129, 0.25);">Verified Specialist</div>
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Welcome to Neubofy, ${name}!</h2>
    <p>Following our technical evaluation, we are pleased to confirm your verification as an active <strong>Verified Specialist</strong> for <strong>${category}</strong>.</p>

    ${customNote ? `
      <div class="note-box" style="border-left-color: #34d399;">
        <strong>Welcome Message:</strong><br>${customNote.replace(/\n/g, '<br>')}
      </div>
    ` : ''}

    <div class="card">
      <h4 style="margin: 0 0 10px; color: #34d399; font-size: 15px;">Network Standards & Collaboration</h4>
      <p style="margin: 0 0 8px; font-size: 14px; color: #e2e8f0;">✓ <strong>Clear Project Scopes:</strong> You receive concrete technical specifications with unambiguous acceptance criteria.</p>
      <p style="margin: 0 0 8px; font-size: 14px; color: #e2e8f0;">✓ <strong>Autonomous Execution:</strong> Direct milestone accountability with no unnecessary meetings.</p>
      <p style="margin: 0; font-size: 14px; color: #e2e8f0;">✓ <strong>Priority Allocation:</strong> As new client engagements open up in ${category}, verified specialists are matched first.</p>
    </div>

    <p>Please keep your capability tags and repository links updated in your profile dashboard.</p>
    
    <div style="text-align: center;">
      <a href="${WEBSITE_URL}/career/profile" class="btn">Open Specialist Dashboard</a>
    </div>

    <p style="margin-top: 24px; font-size: 13px; color: #94a3b8;">
      Warm regards,<br>
      <strong style="color: #ffffff;">Neubofy Talent Operations</strong>
    </p>
  `;

  return {
    subject,
    html: getBaseEmailLayout(content, preview),
    text: `Welcome ${name}!\n\nYou are now a Verified Specialist at Neubofy for ${category}. Access your dashboard at ${WEBSITE_URL}/career/profile.\n\nBest regards,\nNeubofy Talent Operations`,
  };
}

export const getPartnerVerifiedTemplate = getVerifiedWelcomeTemplate;

export function getApplicationUpdateTemplate(name: string, feedbackNote?: string): EmailTemplateResult {
  const subject = `Update regarding your application — Neubofy Specialist Network`;
  const preview = `Status update on your application to the Neubofy Specialist Network.`;
  const content = `
    <div class="badge" style="background-color: rgba(148, 163, 184, 0.1); color: #94a3b8; border-color: rgba(148, 163, 184, 0.25);">Application Status</div>
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Hi ${name},</h2>
    <p>Thank you for taking the time to share your background and technical capabilities with Neubofy.</p>
    
    <p>At present, our active client engagements do not have an open requirement that directly aligns with your current focus. As a result, we are unable to advance your application to active matching at this time.</p>
    
    ${feedbackNote ? `
      <div class="card" style="border-left: 3px solid #94a3b8;">
        <h4 style="margin: 0 0 6px; color: #e2e8f0; font-size: 13px;">Reviewer Notes</h4>
        <p style="margin: 0; font-size: 13px; color: #cbd5e1;">${feedbackNote.replace(/\n/g, '<br>')}</p>
      </div>
    ` : ''}

    <p>We have archived your profile in our talent repository. Should a scoped engagement matching your specialization become available, our coordination team will reach out directly.</p>
    
    <p>We sincerely appreciate your interest and wish you the very best in your engineering endeavors.</p>
    
    <p style="margin-top: 24px; color: #94a3b8; font-size: 13px;">
      Warm regards,<br>
      <strong style="color: #ffffff;">Neubofy Talent Operations</strong>
    </p>
  `;

  return {
    subject,
    html: getBaseEmailLayout(content, preview),
    text: `Hi ${name},\n\nThank you for sharing your background with Neubofy. At present, we do not have an engagement matching your focus. We have retained your profile for future opportunities.\n\nWarm regards,\nNeubofy Talent Operations`,
  };
}

export function getCustomMessageTemplate(name: string, subject: string, message: string): EmailTemplateResult {
  const formattedMessage = message.replace(/\n/g, '<br/>');
  const preview = message.slice(0, 100);
  const content = `
    <div class="badge">Direct Message</div>
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Hi ${name},</h2>
    <div style="font-size: 15px; line-height: 1.7; color: #cbd5e1; margin: 20px 0;">
      ${formattedMessage}
    </div>
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e2232; font-size: 13px; color: #94a3b8;">
      You can reply directly to this email to continue the conversation.
    </div>
  `;

  return {
    subject: `${subject} — Neubofy`,
    html: getBaseEmailLayout(content, preview),
    text: `Hi ${name},\n\n${message}\n\nNeubofy Talent Operations`,
  };
}

export function getRawHtmlTemplate(htmlContent: string, subject: string): EmailTemplateResult {
  const isCompleteDoc = htmlContent.includes("<html") || htmlContent.includes("<!DOCTYPE");
  const finalHtml = isCompleteDoc ? htmlContent : getBaseEmailLayout(htmlContent, subject);
  const plainText = htmlContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

  return {
    subject,
    html: finalHtml,
    text: plainText || subject,
  };
}
