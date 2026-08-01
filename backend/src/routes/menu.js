const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const DAYS = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
const MEALS = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];

// Any logged-in user (student or admin) can view the weekly menu.
router.get('/week', authMiddleware, async (req, res) => {
  try {
    const rows = await prisma.menuItem.findMany();
    const byDay = {};
    DAYS.forEach((d) => {
      byDay[d] = {};
      MEALS.forEach((m) => { byDay[d][m.toLowerCase()] = ''; });
    });
    rows.forEach((r) => { byDay[r.day][r.mealType.toLowerCase()] = r.items; });
    res.json(byDay);
  } catch (err) {
    console.error('MENU WEEK ERROR:', err);
    res.status(500).json({ error: 'Fetch failed', detail: err.message });
  }
});

// Admin: replace the menu items for a single day (all 4 meals sent at once).
router.put('/:day', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const day = req.params.day.toUpperCase();
    if (!DAYS.includes(day)) return res.status(400).json({ error: 'Invalid day' });

    const { breakfast, lunch, snacks, dinner } = req.body;
    const entries = { BREAKFAST: breakfast, LUNCH: lunch, SNACKS: snacks, DINNER: dinner };

    const upserts = Object.entries(entries).map(([mealType, items]) =>
      prisma.menuItem.upsert({
        where: { day_mealType: { day, mealType } },
        update: { items: items || '' },
        create: { day, mealType, items: items || '' },
      })
    );
    await Promise.all(upserts);

    res.json({ success: true });
  } catch (err) {
    console.error('MENU UPDATE ERROR:', err);
    res.status(500).json({ error: 'Update failed', detail: err.message });
  }
});

module.exports = router;
