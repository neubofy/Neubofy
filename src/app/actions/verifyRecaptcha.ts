"use server";

import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

export async function verifyRecaptcha(token: string): Promise<boolean> {
  const projectID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!projectID || !recaptchaKey) {
    console.error("projectId or NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not defined in environment variables");
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

    if (!response.tokenProperties?.valid) {
      console.log(`The CreateAssessment call failed because the token was: ${response.tokenProperties?.invalidReason}`);
      return false;
    }

    if (response.riskAnalysis?.score !== undefined && response.riskAnalysis?.score !== null) {
      console.log(`The reCAPTCHA score is: ${response.riskAnalysis.score}`);
      return response.riskAnalysis.score > 0.5;
    }

    return false;
  } catch (error) {
    console.error("Error verifying reCAPTCHA:", error);
    return false;
  } finally {
    // client.close is recommended to avoid leaks or dangling connections
    try {
      await client.close();
    } catch (err) {
      console.error("Error closing recaptcha client:", err);
    }
  }
}
