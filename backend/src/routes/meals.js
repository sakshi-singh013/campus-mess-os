const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Meal start times in hours (24h, decimal minutes), used to enforce the
// "can't change your answer within 2 hours of the meal" rule server-side.
// This must stay in sync with MEALS in frontend/src/pages/StudentDashboard.jsx.
const MEAL_START_HOURS = {
  BREAKFAST: 7.5,
  LUNCH: 12.25,
  SNACKS: 17,
  DINNER: 19.25,
};
const CUTOFF_HOURS_BEFORE = 2;

function isPastCutoff(dateStr, mealType) {
  const startHour = MEAL_START_HOURS[mealType];
  if (startHour === undefined) return false;

  const now = new Date();
  const mealDate = new Date(`${dateStr}T00:00:00`);

  // If the meal's date isn't today, only block it if that date is already
  // in the past. Future dates are always open; today is checked by the clock.
  const todayStr = now.toISOString().split('T')[0];
  if (dateStr < todayStr) return true;
  if (dateStr > todayStr) return false;

  const cutoffHour = startHour - CUTOFF_HOURS_BEFORE;
  const nowHour = now.getHours() + now.getMinutes() / 60;
  return nowHour >= cutoffHour;
}

router.post('/confirm', authMiddleware, async (req, res) => {
  try {
    const { date, mealKey, response } = req.body;
    if (!date || !mealKey || typeof response !== 'boolean') {
      return res.status(400).json({ error: 'Missing fields' });
    }
    const mealType = mealKey.toUpperCase();

    if (isPastCutoff(date, mealType)) {
      return res.status(403).json({
        error: 'Too late to change this response — the cutoff for this meal has passed.',
      });
    }

    await prisma.mealResponse.upsert({
      where: { userId_date_mealType: { userId: req.user.id, date: new Date(date), mealType } },
      update: { response },
      create: { userId: req.user.id, date: new Date(date), mealType, response },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('CONFIRM ERROR:', err);
    res.status(500).json({ error: 'Confirm failed', detail: err.message });
  }
});

router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const { date } = req.query;
    const rows = await prisma.mealResponse.findMany({
      where: { userId: req.user.id, date: new Date(date) },
    });
    const result = {};
    rows.forEach((r) => { result[r.mealType.toLowerCase()] = r.response; });
    res.json(result);
  } catch (err) {
    console.error('MINE ERROR:', err);
    res.status(500).json({ error: 'Fetch failed', detail: err.message });
  }
});

router.get('/summary', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admins only' });
    const { date } = req.query;
    const rows = await prisma.mealResponse.findMany({ where: { date: new Date(date) } });
    const summary = {};
    rows.forEach((r) => {
      const key = r.mealType.toLowerCase();
      if (!summary[key]) summary[key] = { yes: 0, no: 0 };
      if (r.response) summary[key].yes++; else summary[key].no++;
    });
    res.json(summary);
  } catch (err) {
    console.error('SUMMARY ERROR:', err);
    res.status(500).json({ error: 'Summary failed', detail: err.message });
  }
});

// Personal history + stats for the "Meal history" page — how many meals a
// student has said yes/no to over the last N days, for fee reconciliation
// and their own tracking.
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days, 10) || 30, 180);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await prisma.mealResponse.findMany({
      where: { userId: req.user.id, date: { gte: since } },
      orderBy: { date: 'desc' },
    });

    const yes = rows.filter((r) => r.response).length;
    const no = rows.filter((r) => !r.response).length;

    const byDate = {};
    rows.forEach((r) => {
      const key = r.date.toISOString().split('T')[0];
      if (!byDate[key]) byDate[key] = {};
      byDate[key][r.mealType.toLowerCase()] = r.response;
    });

    res.json({
      totalResponded: rows.length,
      yes,
      no,
      days,
      byDate,
    });
  } catch (err) {
    console.error('HISTORY ERROR:', err);
    res.status(500).json({ error: 'History failed', detail: err.message });
  }
});

module.exports = router;
