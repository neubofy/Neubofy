"use server";

export async function verifyRecaptcha(token: string): Promise<boolean> {
  const projectID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  const apiKey = process.env.apiKey || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  if (!projectID || !recaptchaKey || !apiKey) {
    console.error("Project ID, Recaptcha Site Key, or API Key is missing.");
    return false;
  }

  try {
    const url = `https://recaptchaenterprise.googleapis.com/v1/projects/${projectID}/assessments?key=${apiKey}`;
    const payload = {
      event: {
        token: token,
        siteKey: recaptchaKey,
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`reCAPTCHA API request failed with status: ${response.status}`);
      return false;
    }

    const data = await response.json();

    if (!data.tokenProperties || !data.tokenProperties.valid) {
      console.error(`CreateAssessment failed: ${data.tokenProperties?.invalidReason}`);
      return false;
    }

    if (data.tokenProperties.action === "signup") {
      const score = data.riskAnalysis?.score ?? 0;
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
  }
}
