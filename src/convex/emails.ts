"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = "VayuNetra <notifications@vayunetra.com>";

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

// ── Email templates ──────────────────────────────────────────────────────

function reportSubmitted(name: string, title: string, location?: string) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#F8F7F4;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="border:2px solid #1A1A1A;background:#FFD600;padding:16px 20px;margin-bottom:24px;">
      <h1 style="margin:0;font-size:18px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em;color:#1A1A1A;">
        VayuNetra
      </h1>
    </div>
    <div style="border:2px solid #1A1A1A;background:#FFFFFF;padding:24px;margin-bottom:16px;">
      <h2 style="margin:0 0 12px;font-size:16px;font-weight:700;text-transform:uppercase;color:#1A1A1A;">
        Report Submitted
      </h2>
      <p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.6;">
        Hi ${name || "there"}, your pollution report has been received and is now being reviewed by our AI assistant.
      </p>
      <div style="border:2px solid #1A1A1A;background:#F8F7F4;padding:12px 16px;margin-bottom:16px;">
        <p style="margin:0;font-size:13px;color:#1A1A1A;"><strong style="font-weight:700;">Report:</strong> ${title}</p>
        ${location ? `<p style="margin:4px 0 0;font-size:13px;color:#555;"><strong style="font-weight:700;">Location:</strong> ${location}</p>` : ""}
      </div>
      <p style="margin:0;font-size:13px;color:#888;line-height:1.5;">
        Gemini AI is verifying your report. If no admin reviews it within 2 hours, it will be automatically verified.
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#999;margin-top:24px;">
      VayuNetra — Your Eyes on the Air
    </p>
  </div>
</body>
</html>`;
}

function reportVerified(
  name: string,
  title: string,
  status: string,
  severity?: string,
  notes?: string
) {
  const isApproved = status === "ai_verified" || status === "admin_verified" || status === "auto_verified";
  const statusLabel = isApproved ? "Verified" : "Rejected";
  const accentColor = isApproved ? "#00E676" : "#FF1744";
  const borderColor = isApproved ? "#00C853" : "#D50000";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#F8F7F4;font-family:system-ui,-apple-system,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    <div style="border:2px solid #1A1A1A;background:#FFD600;padding:16px 20px;margin-bottom:24px;">
      <h1 style="margin:0;font-size:18px;font-weight:900;text-transform:uppercase;letter-spacing:0.05em;color:#1A1A1A;">
        VayuNetra
      </h1>
    </div>
    <div style="border:2px solid #1A1A1A;background:#FFFFFF;padding:24px;margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">
        <div style="width:12px;height:12px;background:${accentColor};border:2px solid ${borderColor};"></div>
        <h2 style="margin:0;font-size:16px;font-weight:700;text-transform:uppercase;color:#1A1A1A;">
          Report ${statusLabel}
        </h2>
      </div>
      <p style="margin:0 0 16px;font-size:14px;color:#555;line-height:1.6;">
        Hi ${name || "there"}, your pollution report has been <strong style="color:#1A1A1A;">${statusLabel.toLowerCase()}</strong>.
      </p>
      <div style="border:2px solid #1A1A1A;background:#F8F7F4;padding:12px 16px;margin-bottom:16px;">
        <p style="margin:0;font-size:13px;color:#1A1A1A;"><strong style="font-weight:700;">Report:</strong> ${title}</p>
        ${severity ? `<p style="margin:4px 0 0;font-size:13px;color:#555;"><strong style="font-weight:700;">Severity:</strong> ${severity.toUpperCase()}</p>` : ""}
      </div>
      ${notes ? `
      <div style="border:2px solid #1A1A1A;border-left:6px solid ${borderColor};padding:12px 16px;margin-bottom:16px;">
        <p style="margin:0;font-size:12px;color:#888;text-transform:uppercase;font-weight:700;margin-bottom:4px;">Notes</p>
        <p style="margin:0;font-size:13px;color:#555;line-height:1.5;">${notes}</p>
      </div>` : ""}
    </div>
    <p style="text-align:center;font-size:11px;color:#999;margin-top:24px;">
      VayuNetra — Your Eyes on the Air
    </p>
  </div>
</body>
</html>`;
}

// ── Actions ──────────────────────────────────────────────────────────────

export const sendReportSubmittedEmail = action({
  args: {
    userId: v.string(),
    userName: v.optional(v.string()),
    title: v.string(),
    locationName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!resend) {
      console.warn("Resend not configured — skipping email.");
      return;
    }

    // Look up user email from the database
    const user = await ctx.runQuery((await import("./_generated/api")).api.notifications.getUserEmail, { userId: args.userId }).catch(() => null);
    if (!user?.email) {
      console.warn(`No email found for user ${args.userId} — skipping notification.`);
      return;
    }

    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: `VayuNetra — Report Submitted: ${args.title}`,
      html: reportSubmitted(args.userName || user.name || "Citizen", args.title, args.locationName),
    });
  },
});

export const sendReportVerifiedEmail = action({
  args: {
    userId: v.string(),
    userName: v.optional(v.string()),
    title: v.string(),
    status: v.union(
      v.literal("ai_verified"),
      v.literal("admin_verified"),
      v.literal("auto_verified"),
      v.literal("rejected")
    ),
    severity: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!resend) {
      console.warn("Resend not configured — skipping email.");
      return;
    }

    const user = await ctx.runQuery((await import("./_generated/api")).api.notifications.getUserEmail, { userId: args.userId }).catch(() => null);
    if (!user?.email) {
      console.warn(`No email found for user ${args.userId} — skipping notification.`);
      return;
    }

    const statusLabel =
      args.status === "rejected" ? "Rejected" : "Verified";

    await resend.emails.send({
      from: FROM_EMAIL,
      to: user.email,
      subject: `VayuNetra — Report ${statusLabel}: ${args.title}`,
      html: reportVerified(
        args.userName || user.name || "Citizen",
        args.title,
        args.status,
        args.severity,
        args.notes
      ),
    });
  },
});
