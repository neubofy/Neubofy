"use server";

import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

export async function verifyRecaptcha(token: string): Promise<boolean> {
  const projectID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!projectID || !recaptchaKey) {
    console.error("Project ID or Recaptcha Site Key is missing.");
    return false;
  }

  const client = new RecaptchaEnterpriseServiceClient();

  try {
    const projectPath = client.projectPath(projectID);
    const request = {
      assessment: {
        event: {
          token: token,
          siteKey: recaptchaKey,
        },
      },
      parent: projectPath,
    };

    const [response] = await client.createAssessment(request);

    if (!response.tokenProperties || !response.tokenProperties.valid) {
      console.error(`CreateAssessment failed: ${response.tokenProperties?.invalidReason}`);
      return false;
    }

    if (response.tokenProperties.action === "signup") {
      const score = response.riskAnalysis?.score ?? 0;
      console.log(`reCAPTCHA score: ${score}`);
      // Typically score >= 0.5 is considered a legitimate human.
      return score >= 0.5;
    } else {
      console.error("Action mismatch in reCAPTCHA verification.");
      return false;
    }
  } catch (error) {
    console.error("Error verifying reCAPTCHA Enterprise:", error);
    return false;
  } finally {
    // Avoid leaking clients / connections in serverless functions
    client.close();
  }
}
