/*const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Using App Password instead of real password
    },
});

const sendEmail = async (to, subject, htmlContent) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            html: htmlContent,
        });
        console.log("Email sent to:", to);
    } catch (error) {
        console.error("Email sending error:", error);
    }
};

module.exports = sendEmail;*/

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // For Gmail, you might need these additional options:
  tls: {
    rejectUnauthorized: false
  }
});

/**
 * Send email with both text and HTML versions
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} content - Email content (will be used for both text and HTML)
 * @param {string} [from=process.env.EMAIL_FROM] - Sender address
 * @returns {Promise<void>}
 */
const sendEmail = async (to, subject, content, from = process.env.EMAIL_FROM || process.env.EMAIL_USER) => {
  try {
    const mailOptions = {
      from: `"Your App Name" <${from}>`,
      to,
      subject,
      text: content,
      html: `<div style="font-family: Arial, sans-serif; line-height: 1.6;">
              ${content.replace(/\n/g, '<br>')}
            </div>`
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

module.exports = sendEmail;