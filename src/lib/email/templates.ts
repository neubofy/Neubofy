// Neubofy Branded Email Templates
// Specialist Network & Career Onboarding

export interface EmailTemplateResult {
  subject: string;
  html: string;
  text: string;
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
      background-color: #090a0f;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    table {
      border-collapse: collapse;
    }
    .wrapper {
      width: 100%;
      background-color: #090a0f;
      padding: 40px 16px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #12141c;
      border: 1px solid #232738;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
    }
    .header {
      padding: 32px 32px 24px;
      text-align: center;
      border-bottom: 1px solid #1e2232;
      background: linear-gradient(180deg, #161925 0%, #12141c 100%);
    }
    .logo-img {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: inline-block;
      vertical-align: middle;
      border: 1px solid #00f0ff33;
    }
    .brand-name {
      color: #ffffff;
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.5px;
      margin-top: 12px;
      display: block;
    }
    .tagline {
      color: #717e94;
      font-size: 12px;
      letter-spacing: 0.5px;
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
      margin: 24px 0 8px;
      text-align: center;
      box-shadow: 0 4px 15px rgba(0, 240, 255, 0.3);
    }
    .footer {
      padding: 24px 32px 32px;
      text-align: center;
      border-top: 1px solid #1e2232;
      background-color: #0d0f17;
      color: #64748b;
      font-size: 12px;
    }
    .social-links {
      margin: 16px 0;
    }
    .social-links a {
      color: #94a3b8;
      text-decoration: none;
      margin: 0 8px;
      font-size: 12px;
    }
    .social-links a:hover {
      color: #00f0ff;
    }
    .card {
      background-color: #171a25;
      border: 1px solid #282d40;
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#333333;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText}
  </div>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="${BRAND_LOGO_URL}" alt="Neubofy Logo" class="logo-img" width="48" height="48" />
        <span class="brand-name">Neubofy™</span>
        <div class="tagline">Specialist Network & Technology Department</div>
      </div>
      <div class="body">
        ${contentHtml}
      </div>
      <div class="footer">
        <p style="margin: 0 0 12px;">© ${new Date().getFullYear()} Neubofy Technologies. All rights reserved.</p>
        <p style="margin: 0 0 12px;">Connecting qualified independent technology specialists with orchestrated enterprise projects.</p>
        <div class="social-links">
          <a href="https://twitter.com/neubofy" target="_blank">Twitter / X</a> •
          <a href="https://t.me/neubofy" target="_blank">Telegram</a> •
          <a href="https://linkedin.com/company/neubofy" target="_blank">LinkedIn</a> •
          <a href="https://instagram.com/neubofy" target="_blank">Instagram</a> •
          <a href="${WEBSITE_URL}" target="_blank">neubofy.in</a>
        </div>
        <p style="margin: 12px 0 0; color: #475569; font-size: 11px;">
          Replies to this email are routed to Neubofy Talent Operations (<a href="mailto:careers@neubofy.in" style="color: #64748b;">careers@neubofy.in</a>).
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export function getApplicationReceivedTemplate(name: string, category: string): EmailTemplateResult {
  const subject = `Welcome to Neubofy Specialist Network — Application Received, ${name}`;
  const preview = `Your specialist onboarding for ${category} at Neubofy has been received.`;
  const content = `
    <div class="badge">Application Received</div>
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Welcome to Neubofy, ${name}!</h2>
    <p>Thank you for registering your profile with the Neubofy Specialist Network for the <strong>${category}</strong> focus area.</p>
    
    <div class="card">
      <h4 style="margin: 0 0 8px; color: #00f0ff; font-size: 14px; text-transform: uppercase;">Next Steps in Orchestration</h4>
      <ol style="margin: 0; padding-left: 20px; color: #94a3b8; font-size: 14px;">
        <li style="margin-bottom: 8px;"><strong style="color: #ffffff;">Capability Assessment:</strong> Our technical coordinators evaluate your portfolio, stated deliverables, and experience against upcoming enterprise client requirements.</li>
        <li style="margin-bottom: 8px;"><strong style="color: #ffffff;">Technical Verification:</strong> We conduct a focused alignment call to verify engineering standards and code delivery workflows.</li>
        <li><strong style="color: #ffffff;">Project Routing:</strong> Once verified, you receive qualified project briefs matching your capabilities without bidding or marketing.</li>
      </ol>
    </div>

    <p>You can update your stated capabilities, portfolio, and contact details at any time from your profile.</p>
    <div style="text-align: center;">
      <a href="${WEBSITE_URL}/career/profile" class="btn">View Specialist Profile</a>
    </div>
  `;

  return {
    subject,
    html: getBaseEmailLayout(content, preview),
    text: `Welcome to Neubofy Specialist Network, ${name}!\n\nYour application for ${category} has been received. You can view or update your profile at ${WEBSITE_URL}/career/profile.`,
  };
}

export function getScreeningTemplate(name: string): EmailTemplateResult {
  const subject = `Update on your Neubofy Specialist Application — Under Screening`;
  const preview = `Your profile is now under active screening by Neubofy technical coordinators.`;
  const content = `
    <div class="badge" style="background-color: rgba(99, 102, 241, 0.1); color: #818cf8; border-color: rgba(99, 102, 241, 0.25);">Under Screening</div>
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Hi ${name},</h2>
    <p>Your profile has advanced to our active <strong>Screening & Assessment</strong> pipeline.</p>
    
    <p>Our engineering coordinators are currently assessing your portfolio, code repositories, and specialized capabilities to match you with active and upcoming client requirements.</p>

    <div class="card">
      <p style="margin: 0; color: #cbd5e1; font-size: 14px;">
        💡 <strong>Note:</strong> If your CV or portfolio is hosted on Google Drive, make sure public viewing is enabled or shared with <code style="color: #00f0ff;">careers@neubofy.in</code>.
      </p>
    </div>

    <p>If our team requires additional repository walk-throughs or verified code samples, we will contact you directly.</p>
    <div style="text-align: center;">
      <a href="${WEBSITE_URL}/career/profile" class="btn">Check Profile Status</a>
    </div>
  `;

  return {
    subject,
    html: getBaseEmailLayout(content, preview),
    text: `Hi ${name},\n\nYour specialist application has advanced to the Screening stage at Neubofy. Check status at ${WEBSITE_URL}/career/profile.`,
  };
}

export function getInterviewInvitationTemplate(name: string, bookingUrl?: string): EmailTemplateResult {
  const consultationUrl = bookingUrl || "https://booking.neubofy.in";
  const subject = `Invitation: Technical Alignment & Screening with Neubofy`;
  const preview = `You have been shortlisted! Schedule your technical alignment call with Neubofy.`;
  const content = `
    <div class="badge" style="background-color: rgba(168, 85, 247, 0.1); color: #c084fc; border-color: rgba(168, 85, 247, 0.25);">Shortlisted for Screening</div>
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Great News, ${name}!</h2>
    <p>Your technical qualifications and submitted capabilities have caught our review team's attention. We would like to invite you to an alignment call.</p>

    <div class="card">
      <h4 style="margin: 0 0 8px; color: #00f0ff; font-size: 15px;">Discussion Agenda</h4>
      <p style="margin: 0 0 6px; font-size: 14px; color: #cbd5e1;">• Deep-dive into past architectural work and code repositories</p>
      <p style="margin: 0 0 6px; font-size: 14px; color: #cbd5e1;">• Alignment on Neubofy project delivery & accountability standards</p>
      <p style="margin: 0; font-size: 14px; color: #cbd5e1;">• Upcoming client projects matching your specializations</p>
    </div>

    <p>Please select a convenient time on our consultation calendar using the link below:</p>
    <div style="text-align: center;">
      <a href="${consultationUrl}" class="btn">Schedule Alignment Call</a>
    </div>
    <p style="font-size: 12px; color: #64748b; text-align: center; margin-top: 12px;">Link: ${consultationUrl}</p>
  `;

  return {
    subject,
    html: getBaseEmailLayout(content, preview),
    text: `Hi ${name},\n\nYou have been shortlisted for an alignment call at Neubofy! Schedule your slot at: ${consultationUrl}`,
  };
}

export function getVerifiedWelcomeTemplate(name: string, category: string): EmailTemplateResult {
  const subject = `Welcome to the Neubofy Specialist Network — Verified Specialist`;
  const preview = `Your profile has been verified as an official Neubofy Network Specialist!`;
  const content = `
    <div class="badge" style="background-color: rgba(16, 185, 129, 0.1); color: #34d399; border-color: rgba(16, 185, 129, 0.25);">Verified Specialist</div>
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Official Welcome, ${name}!</h2>
    <p>We are pleased to formally welcome you as a <strong>Verified Specialist</strong> in the Neubofy Network for <strong>${category}</strong>.</p>

    <div class="card">
      <h4 style="margin: 0 0 10px; color: #34d399; font-size: 15px;">Your Network Benefits</h4>
      <p style="margin: 0 0 8px; font-size: 14px; color: #e2e8f0;">✓ <strong>Pre-Scoped Requirements:</strong> Clients interface with Neubofy. You receive concrete technical specs and unambiguous acceptance criteria.</p>
      <p style="margin: 0 0 8px; font-size: 14px; color: #e2e8f0;">✓ <strong>Independent Execution:</strong> Work autonomously with milestone accountability.</p>
      <p style="margin: 0; font-size: 14px; color: #e2e8f0;">✓ <strong>Direct Coordination:</strong> Dedicated communication channels with our project orchestrators.</p>
    </div>

    <p>Keep your profile details and capability tags current so we can route matched opportunities as soon as they are scoped.</p>
    <div style="text-align: center;">
      <a href="${WEBSITE_URL}/career/profile" class="btn">View Specialist Dashboard</a>
    </div>
  `;

  return {
    subject,
    html: getBaseEmailLayout(content, preview),
    text: `Welcome ${name}!\n\nYou are now a Verified Specialist at Neubofy for ${category}. Access your dashboard at ${WEBSITE_URL}/career/profile.`,
  };
}

export const getPartnerVerifiedTemplate = getVerifiedWelcomeTemplate;

export function getApplicationUpdateTemplate(name: string): EmailTemplateResult {
  const subject = `Update regarding your Neubofy Specialist Application`;
  const preview = `Status update on your application to the Neubofy Specialist Network.`;
  const content = `
    <div class="badge" style="background-color: rgba(148, 163, 184, 0.1); color: #94a3b8; border-color: rgba(148, 163, 184, 0.25);">Application Status</div>
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Hello ${name},</h2>
    <p>Thank you for your interest in joining the Neubofy Specialist Network and for sharing your background with our team.</p>
    <p>At present, our active client pipelines do not have an engagement that aligns with your specific technical stack focus. We have retained your profile in our talent repository.</p>
    <p>When an opportunity matching your capabilities opens up, our orchestration leads will reach back out to you directly.</p>
    <p>We appreciate your time and wish you continued success.</p>
    <p style="margin-top: 24px; color: #94a3b8; font-size: 14px;">Warm regards,<br><strong style="color: #ffffff;">Neubofy Talent Operations</strong></p>
  `;

  return {
    subject,
    html: getBaseEmailLayout(content, preview),
    text: `Hello ${name},\n\nThank you for sharing your background with Neubofy. At present, we do not have an engagement matching your focus. We have retained your profile for future opportunities.`,
  };
}

export function getCustomMessageTemplate(name: string, subject: string, message: string): EmailTemplateResult {
  const formattedMessage = message.replace(/\n/g, '<br/>');
  const preview = message.slice(0, 100);
  const content = `
    <div class="badge">Neubofy Specialist Communication</div>
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Hi ${name},</h2>
    <div style="font-size: 15px; line-height: 1.7; color: #cbd5e1; margin: 20px 0;">
      ${formattedMessage}
    </div>
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e2232; font-size: 13px; color: #94a3b8;">
      You can reply directly to this email or reach us at <a href="mailto:careers@neubofy.in" style="color: #00f0ff;">careers@neubofy.in</a>.
    </div>
  `;

  return {
    subject: `${subject} — Neubofy`,
    html: getBaseEmailLayout(content, preview),
    text: `Hi ${name},\n\n${message}\n\nNeubofy Talent Operations (careers@neubofy.in)`,
  };
}
