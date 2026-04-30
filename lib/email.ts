import nodemailer, { type Transporter } from "nodemailer";
import { Resend } from "resend";
import { env } from "@/lib/env";

let smtpCached: Transporter | null = null;
let resendCached: Resend | null = null;

function smtp(): Transporter | null {
  if (smtpCached) return smtpCached;
  if (!env.SMTP_HOST) return null;
  smtpCached = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: (env.SMTP_PORT ?? 587) === 465,
    auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
  });
  return smtpCached;
}

function resend(): Resend | null {
  if (resendCached) return resendCached;
  if (!env.RESEND_API_KEY) return null;
  resendCached = new Resend(env.RESEND_API_KEY);
  return resendCached;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const from = env.SMTP_FROM ?? "Vellum Health <onboarding@resend.dev>";

  const r = resend();
  if (r) {
    try {
      const { error } = await r.emails.send({
        from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      });
      if (error) console.error("[email:resend] send failed", error);
    } catch (err) {
      console.error("[email:resend] threw", err);
    }
    return;
  }

  const t = smtp();
  if (!t) {
    console.info("[email:dev]", { from, ...opts });
    return;
  }
  await t.sendMail({ from, ...opts });
}
