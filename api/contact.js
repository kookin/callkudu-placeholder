const { Resend } = require('resend');

const CONTACT_TO = process.env.MARKETING_CONTACT_EMAIL || 'support@callkudu.co.za';
const FROM = process.env.CONTACT_FROM_EMAIL || process.env.EMAIL_FROM || 'Call Kudu <noreply@callkudu.co.za>';

const escapeHtml = (value) =>
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const clamp = (value, max) => String(value ?? '').trim().slice(0, max);
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Honeypot
  if (clamp(req.body?.company, 200)) {
    return res.status(200).json({ success: true });
  }

  const name = clamp(req.body?.name, 120);
  const email = clamp(req.body?.email, 254).toLowerCase();
  const phone = clamp(req.body?.phone, 40);
  const message = clamp(req.body?.message, 4000);

  if (!name || !email || !phone || !message) {
    return res.status(400).json({ error: 'Please fill in your name, email, phone number, and message.' });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (phone.length < 7) {
    return res.status(400).json({ error: 'Please enter a valid phone number.' });
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
