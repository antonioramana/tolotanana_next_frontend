import type { NextApiRequest } from "next";

export interface RecaptchaResult {
  success: boolean;
  score?: number;
  action?: string;
  errorCodes?: string[];
}

/**
 * Vérifie le token reCAPTCHA envoyé par le client
 */
export async function verifyRecaptcha(req: NextApiRequest): Promise<RecaptchaResult> {
  const token = req.body?.token || req.query?.token;


  if (!token) {
    return { success: false, errorCodes: ["missing-token"] };
  }

  if (!process.env.RECAPTCHA_SECRET_KEY) {
    return { success: false, errorCodes: ["missing-secret-key"] };
  }

  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`;
  
  const response = await fetch(verifyURL, { method: "POST" });
  const data = await response.json();


  return {
    success: data.success,
    score: data.score,
    action: data.action,
    errorCodes: data["error-codes"],
  };
}
