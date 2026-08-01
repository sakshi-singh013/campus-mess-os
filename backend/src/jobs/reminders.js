const cron = require('node-cron');
const nodemailer = require('nodemailer');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Must stay in sync with MEAL_START_HOURS in routes/meals.js and MEALS in
// frontend/src/pages/StudentDashboard.jsx.
const MEAL_START_HOURS = { BREAKFAST: 7.5, LUNCH: 12.25, SNACKS: 17, DINNER: 19.25 };
const CUTOFF_HOURS_BEFORE = 2;
const REMIND_MINUTES_BEFORE_CUTOFF = 30;

const EMAIL_CONFIGURED = !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
let transporter = null;
if (EMAIL_CONFIGURED) {
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

// Tracks which (date, mealType) reminder batches have already gone out, so
// the every-15-minutes cron tick doesn't spam the same student twice for the
// same meal. Cleared automatically once the meal's cutoff has passed.
const sentBatches = new Set();

async function sendReminder(toEmail, name, mealLabel, minutesLeft) {
  if (!transporter) return;
  await transporter.sendMail({
    from: `"Campus Mess OS" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: `${mealLabel} locks in ~${minutesLeft} min — confirm your response`,
    text: `Hi ${name}, you haven't confirmed ${mealLabel.toLowerCase()} yet. It locks in about ${minutesLeft} minutes. Log in to Campus Mess OS to say Yes or No.`,
    html: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
      <h2 style="margin-bottom: 8px;">${mealLabel} locks soon</h2>
      <p style="color:#555; line-height:1.5;">Hi ${name}, you haven't confirmed <b>${mealLabel.toLowerCase()}</b> yet.
      It locks in about ${minutesLeft} minutes and can't be changed after that.</p>
      <p style="color:#999; font-size:13px;">Log in to Campus Mess OS to respond.</p>
    </div>`,
  });
}

async function checkAndSendReminders() {
  if (!EMAIL_CONFIGURED) return;

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const nowHour = now.getHours() + now.getMinutes() / 60;

  for (const [mealType, startHour] of Object.entries(MEAL_START_HOURS)) {
    const cutoffHour = startHour - CUTOFF_HOURS_BEFORE;
    const remindAtHour = cutoffHour - REMIND_MINUTES_BEFORE_CUTOFF / 60;
    const batchKey = `${dateStr}-${mealType}`;

    const inWindow = nowHour >= remindAtHour && nowHour < cutoffHour;
    if (!inWindow || sentBatches.has(batchKey)) continue;

    sentBatches.add(batchKey);

    try {
      const students = await prisma.user.findMany({
        where: { role: 'STUDENT', remindersOn: true },
        select: { id: true, name: true, email: true },
      });
      const responded = await prisma.mealResponse.findMany({
        where: { date: new Date(dateStr), mealType },
        select: { userId: true },
      });
      const respondedIds = new Set(responded.map((r) => r.userId));
      const pending = students.filter((s) => !respondedIds.has(s.id));

      const minutesLeft = Math.max(0, Math.round((cutoffHour - nowHour) * 60));
      const mealLabel = mealType.charAt(0) + mealType.slice(1).toLowerCase();

      await Promise.all(
        pending.map((s) => sendReminder(s.email, s.name, mealLabel, minutesLeft).catch((e) => {
          console.error('REMINDER SEND ERROR:', e.message);
        }))
      );

      if (pending.length) {
        console.log(`[reminders] Sent ${pending.length} reminder(s) for ${mealLabel} on ${dateStr}`);
      }
    } catch (err) {
      console.error('REMINDER BATCH ERROR:', err);
    }
  }

  // Housekeeping: drop batch keys from previous days so the Set doesn't grow forever.
  for (const key of sentBatches) {
    if (!key.startsWith(dateStr)) sentBatches.delete(key);
  }
}

function startReminderJob() {
  if (!EMAIL_CONFIGURED) {
    console.log('[reminders] EMAIL_USER/EMAIL_PASS not set — meal reminder emails are disabled.');
    return;
  }
  cron.schedule('*/15 * * * *', checkAndSendReminders);
  console.log('[reminders] Meal cutoff reminder job scheduled (every 15 min).');
}

module.exports = { startReminderJob };
