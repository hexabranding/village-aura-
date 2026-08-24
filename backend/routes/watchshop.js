import express from 'express';
import WatchShop from '../models/WatchShop.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/active', async (req, res) => {
  try {
    const items = await WatchShop.find({ active: true }).sort({ order: 1 });
    res.json(items);
  } catch (error) {
    console.error('Get active watch-shop error:', error);
    res.status(500).json({ error: 'Failed to fetch watch-shop items' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const items = await WatchShop.find().sort({ order: 1 });
    res.json(items);
  } catch (error) {
    console.error('Get watch-shop error:', error);
    res.status(500).json({ error: 'Failed to fetch watch-shop items' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = new WatchShop(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.error('Create watch-shop item error:', error);
    res.status(500).json({ error: 'Failed to create watch-shop item' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await WatchShop.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!item) {
      return res.status(404).json({ error: 'Watch-shop item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('Update watch-shop item error:', error);
    res.status(500).json({ error: 'Failed to update watch-shop item' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await WatchShop.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Watch-shop item not found' });
    }
    res.json({ message: 'Watch-shop item deleted successfully' });
  } catch (error) {
    console.error('Delete watch-shop item error:', error);
    res.status(500).json({ error: 'Failed to delete watch-shop item' });
  }
});

export default router;
