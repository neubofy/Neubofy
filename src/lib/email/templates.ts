// Neubofy Branded Email Templates

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
  <title>Neubofy</title>
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
      transition: color 0.2s ease;
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
        <div class="tagline">Technology Department as a Service</div>
      </div>
      <div class="body">
        ${contentHtml}
      </div>
      <div class="footer">
        <p style="margin: 0 0 12px;">© ${new Date().getFullYear()} Neubofy Technologies. All rights reserved.</p>
        <p style="margin: 0 0 12px;">Orchestrating qualified independent technology specialists for businesses worldwide.</p>
        <div class="social-links">
          <a href="https://twitter.com/neubofy" target="_blank">Twitter / X</a> •
          <a href="https://t.me/neubofy" target="_blank">Telegram</a> •
          <a href="https://linkedin.com/company/neubofy" target="_blank">LinkedIn</a> •
          <a href="https://instagram.com/neubofy" target="_blank">Instagram</a> •
          <a href="${WEBSITE_URL}" target="_blank">neubofy.in</a>
        </div>
        <p style="margin: 12px 0 0; color: #475569; font-size: 11px;">
          Replies to this email are routed to Neubofy Partner Operations (<a href="mailto:partner@neubofy.in" style="color: #64748b;">partner@neubofy.in</a>).
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

export function getApplicationReceivedTemplate(name: string, category: string): EmailTemplateResult {
  const subject = `Welcome to Neubofy Partner Network — Application Received, ${name}`;
  const preview = `Your application for ${category} at Neubofy has been received.`;
  const content = `
    <div class="badge">Application Received</div>
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Welcome to Neubofy, ${name}!</h2>
    <p>Thank you for submitting your partner profile. We have officially received your onboarding details for the <strong>${category}</strong> specialization.</p>
    
    <div class="card">
      <h4 style="margin: 0 0 8px; color: #00f0ff; font-size: 14px; text-transform: uppercase;">What Happens Next</h4>
      <ol style="margin: 0; padding-left: 20px; color: #94a3b8; font-size: 14px;">
        <li style="margin-bottom: 8px;"><strong style="color: #ffffff;">Specialist Screening:</strong> Our technical review committee evaluates your stated capabilities, portfolio, and experience against active client project requirements.</li>
        <li style="margin-bottom: 8px;"><strong style="color: #ffffff;">Technical Verification:</strong> We conduct a short alignment discussion to verify code quality standards and execution timelines.</li>
        <li><strong style="color: #ffffff;">Project Orchestration:</strong> Once verified, you receive high-value, pre-scoped project briefs matching your capabilities without needing to handle sales.</li>
      </ol>
    </div>

    <p>You can update your portfolio, links, and contact information at any time from your partner profile.</p>
    <div style="text-align: center;">
      <a href="${WEBSITE_URL}/partner/profile" class="btn">Manage Partner Profile</a>
    </div>
  `;

  return {
    subject,
    html: getBaseEmailLayout(content, preview),
    text: `Welcome to Neubofy Partner Network, ${name}!\n\nYour application for ${category} has been received and is being evaluated by our team. You can view or update your profile at ${WEBSITE_URL}/partner/profile.`,
  };
}

export function getScreeningTemplate(name: string): EmailTemplateResult {
  const subject = `Update on your Neubofy Partner Application — In Screening`;
  const preview = `Your profile is now under active screening by Neubofy technical coordinators.`;
  const content = `
    <div class="badge" style="background-color: rgba(99, 102, 241, 0.1); color: #818cf8; border-color: rgba(99, 102, 241, 0.25);">Under Screening</div>
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Hi ${name},</h2>
    <p>Good news! Your partner profile has been moved to our active <strong>Screening & Assessment</strong> stage.</p>
    
    <p>Our team is currently reviewing your portfolio, code repositories, and technical capabilities to match you with upcoming projects in our pipeline.</p>

    <div class="card">
      <p style="margin: 0; color: #cbd5e1; font-size: 14px;">
        💡 <strong>Tip:</strong> If your CV/Resume is hosted on Google Drive, ensure link sharing permissions are set to public or granted to <code style="color: #00f0ff;">partners@neubofy.in</code>.
      </p>
    </div>

    <p>If our reviewers have any questions or require additional repository samples, we will reach out directly through this channel.</p>
    <div style="text-align: center;">
      <a href="${WEBSITE_URL}/partner/profile" class="btn">Check Profile Status</a>
    </div>
  `;

  return {
    subject,
    html: getBaseEmailLayout(content, preview),
    text: `Hi ${name},\n\nYour partner profile has advanced to the Screening stage at Neubofy. We are reviewing your technical background. Check status at ${WEBSITE_URL}/partner/profile.`,
  };
}

export function getInterviewInvitationTemplate(name: string, bookingUrl?: string): EmailTemplateResult {
  const consultationUrl = bookingUrl || "https://booking.neubofy.in";
  const subject = `Invitation: Technical Alignment & Screening with Neubofy`;
  const preview = `You have been shortlisted! Schedule your technical alignment call with Neubofy.`;
  const content = `
    <div class="badge" style="background-color: rgba(168, 85, 247, 0.1); color: #c084fc; border-color: rgba(168, 85, 247, 0.25);">Shortlisted for Interview</div>
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Congratulations ${name}!</h2>
    <p>We were very impressed by your profile and stated capabilities. We would like to invite you for a <strong>Technical Alignment & Capability Verification</strong> session.</p>

    <p>This is a 20-30 minute focused conversation with our orchestration leads to discuss:</p>
    <ul style="color: #94a3b8; font-size: 14px; margin: 12px 0 20px; padding-left: 20px;">
      <li>Your core strengths, preferred tech stack, and delivery cadence</li>
      <li>How Neubofy orchestrates requirements, milestones, and verified deliveries</li>
      <li>Upcoming project engagements that match your capabilities</li>
    </ul>

    <div style="text-align: center; margin: 28px 0;">
      <a href="${consultationUrl}" class="btn" target="_blank">Schedule Your Alignment Call</a>
    </div>

    <p style="font-size: 13px; color: #94a3b8; text-align: center;">
      Can't find a time that works? Reply directly to this email at <a href="mailto:partner@neubofy.in" style="color: #00f0ff;">partner@neubofy.in</a>.
    </p>
  `;

  return {
    subject,
    html: getBaseEmailLayout(content, preview),
    text: `Congratulations ${name}!\n\nYou have been shortlisted for a Technical Alignment session with Neubofy. Please select a time slot at: ${consultationUrl}`,
  };
}

export function getPartnerVerifiedTemplate(name: string, category: string): EmailTemplateResult {
  const subject = `Welcome to the Neubofy Orchestration Network — Verified Partner`;
  const preview = `Your profile has been verified as an official Neubofy Partner!`;
  const content = `
    <div class="badge" style="background-color: rgba(16, 185, 129, 0.1); color: #34d399; border-color: rgba(16, 185, 129, 0.25);">Verified Partner</div>
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Official Welcome, ${name}!</h2>
    <p>We are thrilled to officially welcome you as a <strong>Verified Partner</strong> in the Neubofy Orchestration Network for <strong>${category}</strong>.</p>

    <div class="card">
      <h4 style="margin: 0 0 10px; color: #34d399; font-size: 15px;">Your Partner Privileges</h4>
      <p style="margin: 0 0 8px; font-size: 14px; color: #e2e8f0;">✓ <strong>Pre-Scoped Requirements:</strong> Clients deal with Neubofy. You receive clear technical specs and acceptance criteria.</p>
      <p style="margin: 0 0 8px; font-size: 14px; color: #e2e8f0;">✓ <strong>Independent Execution:</strong> Work flexibly and autonomously with clear milestone accountability.</p>
      <p style="margin: 0; font-size: 14px; color: #e2e8f0;">✓ <strong>Direct Communication:</strong> Priority access to our project leads and engineering team.</p>
    </div>

    <p>Keep your profile details up-to-date so we can route the best matching briefs to you as soon as they are scoped.</p>
    <div style="text-align: center;">
      <a href="${WEBSITE_URL}/partner/profile" class="btn">View Partner Dashboard</a>
    </div>
  `;

  return {
    subject,
    html: getBaseEmailLayout(content, preview),
    text: `Welcome ${name}!\n\nYou are now an official Verified Partner at Neubofy for ${category}. Access your dashboard at ${WEBSITE_URL}/partner/profile.`,
  };
}

export function getApplicationUpdateTemplate(name: string): EmailTemplateResult {
  const subject = `Update on your Neubofy Partner Application`;
  const preview = `Status update regarding your Neubofy Partner profile.`;
  const content = `
    <div class="badge" style="background-color: rgba(148, 163, 184, 0.1); color: #94a3b8; border-color: rgba(148, 163, 184, 0.25);">Application Update</div>
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Hello ${name},</h2>
    <p>Thank you for your interest in joining the Neubofy Partner Network and for sharing your background with us.</p>
    <p>At this time, we do not have an active client engagement that specifically matches your current profile and tech stack focus. As our orchestration projects evolve rapidly, we have archived your details in our talent database.</p>
    <p>Should an opportunity arise that aligns with your specific expertise, our orchestration team will proactively reach back out to you.</p>
    <p>We wish you continued success with your engineering endeavors.</p>
    <p style="margin-top: 24px; color: #94a3b8; font-size: 14px;">Warm regards,<br><strong style="color: #ffffff;">Neubofy Partner Operations</strong></p>
  `;

  return {
    subject,
    html: getBaseEmailLayout(content, preview),
    text: `Hello ${name},\n\nThank you for sharing your background with Neubofy. At this time, we do not have an active project matching your focus. We will keep your details on file for future opportunities.`,
  };
}

export function getCustomMessageTemplate(name: string, subject: string, message: string): EmailTemplateResult {
  const formattedMessage = message.replace(/\n/g, '<br/>');
  const preview = message.slice(0, 100);
  const content = `
    <div class="badge">Neubofy Partner Communication</div>
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px;">Hi ${name},</h2>
    <div style="font-size: 15px; line-height: 1.7; color: #cbd5e1; margin: 20px 0;">
      ${formattedMessage}
    </div>
    <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e2232; font-size: 13px; color: #94a3b8;">
      You can reply directly to this email or reach us at <a href="mailto:partner@neubofy.in" style="color: #00f0ff;">partner@neubofy.in</a>.
    </div>
  `;

  return {
    subject: `${subject} — Neubofy`,
    html: getBaseEmailLayout(content, preview),
    text: `Hi ${name},\n\n${message}\n\nNeubofy Partner Operations (partner@neubofy.in)`,
  };
}
