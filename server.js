const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for CORS and body parsing
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ────────────────────────────────────────────────
// Transporter config: Explicit SMTP settings for Gmail (STARTTLS on 587)
// Note: On Render FREE tier, outbound port 587 (and 465) is BLOCKED since Sep 2025
// → This will timeout on free instances. Upgrade to paid plan OR switch to API-based email service
// ────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,                  // false = use STARTTLS (not implicit TLS)
  requireTLS: true,               // Force STARTTLS upgrade
  tls: {
    // In some container envs, helps with cert issues (safe for known Gmail host)
    rejectUnauthorized: false,
  },
  auth: {
    user: process.env.EMAIL_USER,     // your@gmail.com
    pass: process.env.EMAIL_PASS      // App Password (NOT regular password if 2FA on)
  },
  // Timeouts tuned for cloud env (Render can be slower on cold starts)
  connectionTimeout: 30000,   // 30 seconds
  greetingTimeout: 30000,
  socketTimeout: 60000,
  // Enable detailed logging for troubleshooting
  debug: true,
  logger: true,
});

// Verify transporter on startup (logs helpful info / errors)
transporter.verify((error, success) => {
  if (error) {
    console.error('Transporter verification failed (likely due to Render free tier SMTP block):', error);
  } else {
    console.log('Transporter ready (SMTP config looks good locally)');
  }
});

// ────────────────────────────────────────────────
// POST /api/send-email endpoint
// ────────────────────────────────────────────────
app.post('/api/send-email', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: name, email, subject, message'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Mail options
    const mailOptions = {
      from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
      to: 'ahtashamahsan988@gmail.com',
      subject: `Portfolio Contact: ${subject}`,
      text: `
New message from your portfolio website:

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}

---
Sent via portfolio contact form.
      `,
      html: `
        <h2>New Portfolio Contact Message</h2>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; font-family: Arial, sans-serif;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p><strong>Message:</strong></p>
          <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #007bff; white-space: pre-wrap;">${message}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">This message was sent through your portfolio contact form.</p>
        </div>
      `
    };

    // Attempt to send
    const info = await transporter.sendMail(mailOptions);

    console.log('Email sent → Message ID:', info.messageId);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully!',
      messageId: info.messageId
    });

  } catch (error) {
    console.error('Error sending email:', error);

    // Render-specific hint in response for easier debugging
    const errorMessage = error.code === 'ETIMEDOUT' && error.command === 'CONN'
      ? 'Connection timeout - likely Render free tier blocking SMTP port 587. Upgrade plan or switch to email API (Resend/SendGrid/Brevo).'
      : error.message;

    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
      error: errorMessage
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'Portfolio Email API is running'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: /api/health`);
  console.log(`Email endpoint: /api/send-email`);
});

module.exports = app;