import { verifyRecaptcha } from "@/lib/verifyRecaptcha";
import type { NextApiRequest, NextApiResponse } from "next";

export type NextApiHandlerWithCaptcha = (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>;

/**
 * Middleware reCAPTCHA — protège une route API
 */
export function withRecaptcha(handler: NextApiHandlerWithCaptcha) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      const captcha = await verifyRecaptcha(req);

      if (!captcha.success || (captcha.score !== undefined && captcha.score < 0.5)) {
        return res.status(400).json({
          message: "reCAPTCHA verification failed",
          error: captcha.errorCodes || [],
        });
      }

      // ✅ continue vers la route
      await handler(req, res);
    } catch (error) {
      console.error("Error verifying reCAPTCHA:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  };
}
