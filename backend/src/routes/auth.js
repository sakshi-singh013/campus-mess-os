const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();
const ADMIN_ACCESS_CODE = process.env.ADMIN_ACCESS_CODE || 'MESS2026';
const RESET_TOKEN_TTL_MINUTES = 30;

const EMAIL_CONFIGURED = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);

let transporter = null;
if (EMAIL_CONFIGURED) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

// Sends a real email if EMAIL_USER/EMAIL_PASS are set in .env. If they're
// not set yet, this quietly does nothing and the caller falls back to
// showing the link on screen instead (see the /forgot-password route below).
async function sendPasswordResetEmail(toEmail, resetUrl) {
  if (!EMAIL_CONFIGURED) return false;

  await transporter.sendMail({
    from: `"Campus Mess OS" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Reset your Campus Mess OS password',
    text: `We received a request to reset your password. This link expires in ${RESET_TOKEN_TTL_MINUTES} minutes:\n\n${resetUrl}\n\nIf you didn't request this, you can ignore this email.`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h2 style="margin-bottom: 8px;">Reset your password</h2>
        <p style="color: #555; line-height: 1.5;">
          We received a request to reset your Campus Mess OS password.
          This link expires in ${RESET_TOKEN_TTL_MINUTES} minutes.
        </p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background:#E8A33D;color:#0B0A08;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">
            Reset password
          </a>
        </p>
        <p style="color: #999; font-size: 13px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
  return true;
}

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, role, accessCode } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const normalizedRole = String(role).toUpperCase() === 'ADMIN' ? 'ADMIN' : 'STUDENT';
    if (normalizedRole === 'ADMIN' && accessCode !== ADMIN_ACCESS_CODE) {
      return res.status(403).json({ error: 'Invalid admin access code' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: normalizedRole },
    });

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.json({ token, name: user.name, role: user.role.toLowerCase() });
  } catch (err) {
    console.error('SIGNUP ERROR:', err);
    res.status(500).json({ error: 'Signup failed', detail: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const valid = bcrypt.compareSync(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, name: user.name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.json({ token, name: user.name, role: user.role.toLowerCase() });
  } catch (err) {
    console.error('LOGIN ERROR:', err);
    res.status(500).json({ error: 'Login failed', detail: err.message });
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond the same way whether or not the email exists,
    // so this endpoint can't be used to find out who has an account.
    const genericResponse = {
      message: 'If an account exists for that email, a reset link has been sent.',
    };

    if (!user) {
      return res.json(genericResponse);
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    });

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    let emailSent = false;
    try {
      emailSent = await sendPasswordResetEmail(user.email, resetUrl);
    } catch (emailErr) {
      console.error('EMAIL SEND ERROR:', emailErr);
      emailSent = false;
    }

    if (emailSent) {
      return res.json(genericResponse);
    }

    // Email isn't configured (or failed to send) — fall back to returning
    // the link directly so you can still test the flow. Once EMAIL_USER
    // and EMAIL_PASS are set in .env, this branch stops being used.
    console.log(`\n[password reset — email not configured] Link for ${user.email}: ${resetUrl}\n`);
    res.json({ ...genericResponse, devResetUrl: resetUrl });
  } catch (err) {
    console.error('FORGOT PASSWORD ERROR:', err);
    res.status(500).json({ error: 'Request failed', detail: err.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and new password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!resetToken) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }
    if (resetToken.usedAt) {
      return res.status(400).json({ error: 'This reset link has already been used' });
    }
    if (resetToken.expiresAt < new Date()) {
      return res.status(400).json({ error: 'This reset link has expired' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    res.json({ message: 'Password updated. You can now sign in with your new password.' });
  } catch (err) {
    console.error('RESET PASSWORD ERROR:', err);
    res.status(500).json({ error: 'Reset failed', detail: err.message });
  }
});

module.exports = router;
