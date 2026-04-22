const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, businessName, businessType, location, employees } = req.body || {};

  if (!name || !email || !phone || !businessName || !businessType || !location) {
    return res.status(400).json({ error: 'Please fill in all required fields.' });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtpout.secureserver.net',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const htmlBody = `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#ed4576;">New Pilot Program Interest</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px 12px;font-weight:bold;color:#374151;">Name</td><td style="padding:8px 12px;">${name}</td></tr>
        <tr style="background:#f9fafb;"><td style="padding:8px 12px;font-weight:bold;color:#374151;">Email</td><td style="padding:8px 12px;"><a href="mailto:${email}">${email}</a></td></tr>
        <tr><td style="padding:8px 12px;font-weight:bold;color:#374151;">Phone</td><td style="padding:8px 12px;">${phone}</td></tr>
        <tr style="background:#f9fafb;"><td style="padding:8px 12px;font-weight:bold;color:#374151;">Business Name</td><td style="padding:8px 12px;">${businessName}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:bold;color:#374151;">Business Type</td><td style="padding:8px 12px;">${businessType}</td></tr>
        <tr style="background:#f9fafb;"><td style="padding:8px 12px;font-weight:bold;color:#374151;">Location</td><td style="padding:8px 12px;">${location}</td></tr>
        <tr><td style="padding:8px 12px;font-weight:bold;color:#374151;">Employees</td><td style="padding:8px 12px;">${employees || 'Not specified'}</td></tr>
      </table>
      <hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb;" />
      <p style="color:#6b7280;font-size:13px;">Submitted from the Call Kudu website pilot signup form.</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"Call Kudu Website" <${process.env.SMTP_USER}>`,
      to: 'support@callkudu.co.za',
      subject: `Pilot Signup: ${businessName} (${name})`,
      html: htmlBody,
      replyTo: email,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('SMTP error:', err);
    return res.status(500).json({ error: 'Failed to send. Please try again later.' });
  }
};
