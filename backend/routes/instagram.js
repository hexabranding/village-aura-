import express from 'express';
import Instagram from '../models/Instagram.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/active', async (req, res) => {
  try {
    const items = await Instagram.find({ active: true }).sort({ order: 1 });
    res.json(items);
  } catch (error) {
    console.error('Get active instagram error:', error);
    res.status(500).json({ error: 'Failed to fetch instagram images' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const items = await Instagram.find().sort({ order: 1 });
    res.json(items);
  } catch (error) {
    console.error('Get instagram error:', error);
    res.status(500).json({ error: 'Failed to fetch instagram images' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const item = new Instagram(req.body);
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.error('Create instagram error:', error);
    res.status(500).json({ error: 'Failed to create instagram item' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const item = await Instagram.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ error: 'Instagram item not found' });
    res.json(item);
  } catch (error) {
    console.error('Update instagram error:', error);
    res.status(500).json({ error: 'Failed to update instagram item' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await Instagram.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ error: 'Instagram item not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (error) {
    console.error('Delete instagram error:', error);
    res.status(500).json({ error: 'Failed to delete instagram item' });
  }
});

export default router;
