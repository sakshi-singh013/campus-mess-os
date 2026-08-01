const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.post('/submit', authMiddleware, async (req, res) => {
  try {
    const { subject, message } = req.body;
    if (!subject || !message) {
      return res.status(400).json({ error: 'Subject and message are required' });
    }
    const complaint = await prisma.complaint.create({
      data: { userId: req.user.id, subject, message },
    });
    res.json({ success: true, complaint });
  } catch (err) {
    console.error('COMPLAINT SUBMIT ERROR:', err);
    res.status(500).json({ error: 'Submit failed', detail: err.message });
  }
});

router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json(complaints);
  } catch (err) {
    console.error('COMPLAINT MINE ERROR:', err);
    res.status(500).json({ error: 'Fetch failed', detail: err.message });
  }
});

// Admin: view every complaint, optionally filtered by status.
router.get('/all', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const { status } = req.query;
    const where = status ? { status: status.toUpperCase() } : {};
    const complaints = await prisma.complaint.findMany({
      where,
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(complaints);
  } catch (err) {
    console.error('COMPLAINT ALL ERROR:', err);
    res.status(500).json({ error: 'Fetch failed', detail: err.message });
  }
});

// Admin: update status and/or reply to a complaint.
router.patch('/:id', authMiddleware, requireRole('ADMIN'), async (req, res) => {
  try {
    const { status, adminReply } = req.body;
    const data = {};
    if (status) data.status = status.toUpperCase();
    if (adminReply !== undefined) data.adminReply = adminReply;

    const complaint = await prisma.complaint.update({
      where: { id: req.params.id },
      data,
    });
    res.json({ success: true, complaint });
  } catch (err) {
    console.error('COMPLAINT UPDATE ERROR:', err);
    res.status(500).json({ error: 'Update failed', detail: err.message });
  }
});

module.exports = router;
