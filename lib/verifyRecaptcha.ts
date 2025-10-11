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

  console.log('🔍 verifyRecaptcha - Debug info:');
  console.log('📝 Token:', token ? `${token.substring(0, 20)}...` : 'undefined');
  console.log('📝 Secret key defined:', !!process.env.RECAPTCHA_SECRET_KEY);
  console.log('📝 Secret key length:', process.env.RECAPTCHA_SECRET_KEY?.length);

  if (!token) {
    console.log('❌ No token provided');
    return { success: false, errorCodes: ["missing-token"] };
  }

  if (!process.env.RECAPTCHA_SECRET_KEY) {
    console.log('❌ RECAPTCHA_SECRET_KEY not defined');
    return { success: false, errorCodes: ["missing-secret-key"] };
  }

  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`;
  console.log('📝 Verifying with Google reCAPTCHA...');
  
  const response = await fetch(verifyURL, { method: "POST" });
  const data = await response.json();

  console.log('📝 Google reCAPTCHA response:', {
    success: data.success,
    score: data.score,
    action: data.action,
    errorCodes: data["error-codes"]
  });

  return {
    success: data.success,
    score: data.score,
    action: data.action,
    errorCodes: data["error-codes"],
  };
}
