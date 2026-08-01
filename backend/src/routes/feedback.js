const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Student: rate a meal (1-5 stars) with an optional comment.
router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { date, mealKey, rating, comment } = req.body;
    const mealType = String(mealKey || '').toUpperCase();
    const ratingNum = Number(rating);

    if (!date || !mealType || !ratingNum || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'Date, meal, and a rating from 1-5 are required' });
    }

    const feedback = await prisma.mealFeedback.upsert({
      where: { userId_date_mealType: { userId: req.user.id, date: new Date(date), mealType } },
      update: { rating: ratingNum, comment: comment || null },
      create: { userId: req.user.id, date: new Date(date), mealType, rating: ratingNum, comment: comment || null },
    });

    res.json({ success: true, feedback });
  } catch (err) {
    console.error('FEEDBACK SUBMIT ERROR:', err);
    res.status(500).json({ error: 'Submit failed', detail: err.message });
  }
});

router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days, 10) || 14, 90);
    const since = new Date();
    since.setDate(since.getDate() - days);
    const rows = await prisma.mealFeedback.findMany({
      where: { userId: req.user.id, date: { gte: since } },
      orderBy: { date: 'desc' },
    });
    res.json(rows);
  } catch (err) {
    console.error('FEEDBACK MINE ERROR:', err);
    res.status(500).json({ error: 'Fetch failed', detail: err.message });
  }
});

// Admin: average rating per meal type + recent comments, for a date range.
router.get('/summary', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days, 10) || 7, 90);
    const since = new Date();
    since.setDate(since.getDate() - days);

    const rows = await prisma.mealFeedback.findMany({
      where: { date: { gte: since } },
      include: { user: { select: { name: true } } },
      orderBy: { date: 'desc' },
    });

    const byMeal = {};
    rows.forEach((r) => {
      const key = r.mealType.toLowerCase();
      if (!byMeal[key]) byMeal[key] = { count: 0, sum: 0 };
      byMeal[key].count += 1;
      byMeal[key].sum += r.rating;
    });
    const averages = {};
    Object.entries(byMeal).forEach(([key, v]) => {
      averages[key] = { average: Math.round((v.sum / v.count) * 10) / 10, count: v.count };
    });

    const comments = rows
      .filter((r) => r.comment)
      .map((r) => ({
        id: r.id,
        studentName: r.user.name,
        mealType: r.mealType.toLowerCase(),
        rating: r.rating,
        comment: r.comment,
        date: r.date,
      }));

    res.json({ averages, comments });
  } catch (err) {
    console.error('FEEDBACK SUMMARY ERROR:', err);
    res.status(500).json({ error: 'Summary failed', detail: err.message });
  }
});

module.exports = router;
