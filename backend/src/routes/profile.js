const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const DIET_TAGS = ['NONE', 'VEGETARIAN', 'VEGAN', 'EGGETARIAN', 'ALLERGY'];

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true,
        dietTag: true, dietNote: true, remindersOn: true, createdAt: true,
      },
    });
    res.json(user);
  } catch (err) {
    console.error('PROFILE GET ERROR:', err);
    res.status(500).json({ error: 'Fetch failed', detail: err.message });
  }
});

router.patch('/me', authMiddleware, async (req, res) => {
  try {
    const { dietTag, dietNote, remindersOn } = req.body;
    const data = {};
    if (dietTag !== undefined) {
      if (!DIET_TAGS.includes(dietTag)) return res.status(400).json({ error: 'Invalid diet tag' });
      data.dietTag = dietTag;
    }
    if (dietNote !== undefined) data.dietNote = dietNote || null;
    if (remindersOn !== undefined) data.remindersOn = !!remindersOn;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: { id: true, name: true, email: true, dietTag: true, dietNote: true, remindersOn: true },
    });
    res.json({ success: true, user });
  } catch (err) {
    console.error('PROFILE UPDATE ERROR:', err);
    res.status(500).json({ error: 'Update failed', detail: err.message });
  }
});

// Admin: dietary breakdown across all students, for catering headcounts.
router.get('/diet-summary', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Admins only' });
    const users = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { dietTag: true },
    });
    const summary = {};
    users.forEach((u) => { summary[u.dietTag] = (summary[u.dietTag] || 0) + 1; });
    res.json(summary);
  } catch (err) {
    console.error('DIET SUMMARY ERROR:', err);
    res.status(500).json({ error: 'Fetch failed', detail: err.message });
  }
});

module.exports = router;
