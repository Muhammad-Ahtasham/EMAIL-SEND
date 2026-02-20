const express = require('express');
const cors = require('cors');
const { Resend } = require('resend'); // New: Resend SDK for HTTP-based email
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
// Resend client initialization (HTTP API - no SMTP ports involved)
// Works on Render free tier since it uses HTTPS (port 443)
// ────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

// Optional: Log if API key is missing (helps debugging)
if (!process.env.RESEND_API_KEY) {
  console.error('Missing RESEND_API_KEY environment variable - email sending will fail');
}

// Email sending endpoint - now using Resend instead of Nodemailer/SMTP
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

    // Send email via Resend API
    const { data, error } = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>', // Use your verified sender or default test one
      to: ['ahtashamahsan988@gmail.com'], // Your receiving email
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
      `,
      // Optional: replyTo: email  // Lets you reply directly to the sender
    });

    if (error) {
      console.error('Resend API error:', error);
      throw new Error(error.message || 'Resend failed to send email');
    }

    console.log('Email sent via Resend → ID:', data.id);

    res.status(200).json({
      success: true,
      message: 'Message sent successfully!',
      messageId: data.id
    });

  } catch (error) {
    console.error('Error sending email:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.',
      error: error.message
    });
  }
});

// Health check endpoint
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