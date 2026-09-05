import express from 'express';
import Notification from '../models/Notification.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 }).limit(50);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

router.get('/unread', auth, async (req, res) => {
  try {
    const count = await Notification.countDocuments({ read: false });
    const notifications = await Notification.find({ read: false }).sort({ createdAt: -1 }).limit(20);
    res.json({ count, notifications });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch unread notifications' });
  }
});

router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ read: false }, { read: true });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

export default router;
