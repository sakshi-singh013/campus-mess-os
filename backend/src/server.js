require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const mealRoutes = require('./routes/meals');
const leaveRoutes = require('./routes/leave');
const menuRoutes = require('./routes/menu');
const feedbackRoutes = require('./routes/feedback');
const complaintRoutes = require('./routes/complaints');
const profileRoutes = require('./routes/profile');
const { startReminderJob } = require('./jobs/reminders');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/profile', profileRoutes);

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startReminderJob();
});
