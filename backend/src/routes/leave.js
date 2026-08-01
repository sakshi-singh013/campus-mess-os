const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

const MEAL_TYPES = ['BREAKFAST', 'LUNCH', 'SNACKS', 'DINNER'];

function eachDate(startStr, endStr) {
  const dates = [];
  const cur = new Date(`${startStr}T00:00:00`);
  const end = new Date(`${endStr}T00:00:00`);
  while (cur <= end) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

// Create a leave and auto-mark every meal in that range as "No", so the
// student doesn't have to toggle each meal individually.
router.post('/request', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start and end date are required' });
    }
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ error: 'End date must be on or after the start date' });
    }

    const leave = await prisma.leave.create({
      data: {
        userId: req.user.id,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason: reason || null,
      },
    });

    const dates = eachDate(startDate, endDate);
    const upserts = [];
    for (const date of dates) {
      for (const mealType of MEAL_TYPES) {
        upserts.push(
          prisma.mealResponse.upsert({
            where: { userId_date_mealType: { userId: req.user.id, date: new Date(date), mealType } },
            update: { response: false },
            create: { userId: req.user.id, date: new Date(date), mealType, response: false },
          })
        );
      }
    }
    await Promise.all(upserts);

    res.json({ success: true, leave, mealsMarkedNo: dates.length * MEAL_TYPES.length });
  } catch (err) {
    console.error('LEAVE REQUEST ERROR:', err);
    res.status(500).json({ error: 'Leave request failed', detail: err.message });
  }
});

router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const leaves = await prisma.leave.findMany({
      where: { userId: req.user.id },
      orderBy: { startDate: 'desc' },
    });
    res.json(leaves);
  } catch (err) {
    console.error('LEAVE LIST ERROR:', err);
    res.status(500).json({ error: 'Fetch failed', detail: err.message });
  }
});

// Cancel an upcoming leave — does not retroactively restore past meals.
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const leave = await prisma.leave.findUnique({ where: { id: req.params.id } });
    if (!leave || leave.userId !== req.user.id) {
      return res.status(404).json({ error: 'Leave not found' });
    }
    await prisma.leave.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) {
    console.error('LEAVE DELETE ERROR:', err);
    res.status(500).json({ error: 'Cancel failed', detail: err.message });
  }
});

module.exports = router;
