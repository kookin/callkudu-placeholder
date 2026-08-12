const { Resend } = require('resend');

const CONTACT_TO = process.env.MARKETING_CONTACT_EMAIL || 'support@callkudu.co.za';
const FROM = process.env.CONTACT_FROM_EMAIL || process.env.EMAIL_FROM || 'Call Kudu <noreply@callkudu.co.za>';

const MIN_DWELL_MS = 2500;
const MAX_DWELL_MS = 2 * 60 * 60 * 1000; // 2 hours
const RATE_WINDOW_MS = 15 * 60 * 1000;
const RATE_MAX = 5;
const ALLOWED_ORIGINS = [
  'https://callkudu.co.za',
  'https://www.callkudu.co.za',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const clamp = (value, max) => String(value ?? '').trim().slice(0, max);
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const countUrls = (text) => (String(text).match(/https?:\/\/|www\./gi) || []).length;

function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim().slice(0, 80);
  }
  return (req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown').toString().slice(0, 80);
}

function originAllowed(req) {
  const origin = String(req.headers.origin || '').trim();
  const referer = String(req.headers.referer || '').trim();
  if (origin && ALLOWED_ORIGINS.includes(origin)) return true;
  if (!origin && referer) {
    try {
      const host = new URL(referer).origin;
      if (ALLOWED_ORIGINS.includes(host)) return true;
    } catch {
      /* ignore */
    }
  }
  // Allow same-origin fetches that omit Origin (some browsers)
  if (!origin && !referer) return true;
  return false;
}

function rateLimited(ip) {
  const store = (globalThis.__contactRateLimit ||= new Map());
  const now = Date.now();
  const entry = store.get(ip) || { count: 0, resetAt: now + RATE_WINDOW_MS };
  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + RATE_WINDOW_MS;
  }
  entry.count += 1;
  store.set(ip, entry);
  // Cap map size so memory doesn't grow unbounded across warm instances
  if (store.size > 5000) {
    for (const [key, val] of store) {
      if (now > val.resetAt) store.delete(key);
    }
  }
  return entry.count > RATE_MAX;
}

/** Silent success — bots should think it worked. */
function botOk(res) {
  return res.status(200).json({ success: true });
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!originAllowed(req)) {
    return res.status(403).json({ error: 'Request blocked.' });
  }

  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many messages. Please try again in a few minutes.' });
  }

  const body = req.body || {};

  // Honeypots (company kept for older clients; website is the primary trap)
  if (clamp(body.company, 200) || clamp(body.website, 200)) {
    return botOk(res);
  }

  // JS proof — only set by the contact modal script
  if (clamp(body.jsToken, 40) !== 'ck-ok') {
    return botOk(res);
  }

  // Timing gate — reject instant / stale submissions
  const openedAt = Number(body.openedAt);
  const dwell = Date.now() - openedAt;
  if (!Number.isFinite(openedAt) || dwell < MIN_DWELL_MS || dwell > MAX_DWELL_MS) {
    return botOk(res);
  }

  const name = clamp(body.name, 120);
  const email = clamp(body.email, 254).toLowerCase();
  const phone = clamp(body.phone, 40);
  const message = clamp(body.message, 4000);

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'Please fill in your name, email, phone number, and message.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (phone.length < 7) {
    return res.status(400).json({ error: 'Please enter a valid phone number.' });
  }
  if (countUrls(message) > 3) {
    return botOk(res);
  }

  const apiKey = process.env.RESEND_API_KEY || process.env.RESEND_API_KEY_ZA;
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY missing');
    return res.status(503).json({
      error: 'Contact form is temporarily unavailable. Please email support@callkudu.co.za.',
    });
  }

  const resend = new Resend(apiKey);
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safePhone = escapeHtml(phone);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br />');

  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: CONTACT_TO,
      replyTo: email,
      subject: `Website contact: ${name}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1f2937;">
          <h2 style="color:#FF6B2C;margin:0 0 16px;">New website message</h2>
          <p style="margin:0 0 20px;color:#6b7280;font-size:14px;">Submitted via the Call Kudu marketing contact form.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr>
              <td style="padding:10px 12px;font-weight:bold;color:#374151;width:120px;border-bottom:1px solid #e5e7eb;">Name</td>
              <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding:10px 12px;font-weight:bold;color:#374151;border-bottom:1px solid #e5e7eb;">Email</td>
              <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;"><a href="mailto:${safeEmail}">${safeEmail}</a></td>
            </tr>
            <tr>
              <td style="padding:10px 12px;font-weight:bold;color:#374151;border-bottom:1px solid #e5e7eb;">Phone</td>
              <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;"><a href="tel:${safePhone}">${safePhone}</a></td>
            </tr>
          </table>
          <div style="margin-top:20px;padding:16px;background:#f9fafb;border-radius:8px;border-left:4px solid #FF6B2C;">
            <div style="font-size:12px;font-weight:bold;color:#6b7280;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:8px;">Message</div>
            <div style="font-size:14px;line-height:1.6;">${safeMessage}</div>
          </div>
        </div>
      `,
      text: `New website message from ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`,
    });

    if (error) {
      console.error('[contact] Resend error:', error);
      return res.status(500).json({
        error: 'Failed to send your message. Please try again or email support@callkudu.co.za.',
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[contact] unexpected error:', err);
    return res.status(500).json({
      error: 'Failed to send your message. Please try again later.',
    });
  }
};
