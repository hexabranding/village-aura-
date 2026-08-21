import express from 'express';
import Ad from '../models/Ad.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/active', async (req, res) => {
  try {
    const ads = await Ad.find({ active: true }).sort({ order: 1 });
    res.json(ads);
  } catch (error) {
    console.error('Get active ads error:', error);
    res.status(500).json({ error: 'Failed to fetch active ads' });
  }
});

router.get('/active/:type', async (req, res) => {
  try {
    const ads = await Ad.find({ active: true, type: req.params.type }).sort({ order: 1 });
    res.json(ads);
  } catch (error) {
    console.error('Get active ads by type error:', error);
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const ads = await Ad.find().sort({ order: 1 });
    res.json(ads);
  } catch (error) {
    console.error('Get ads error:', error);
    res.status(500).json({ error: 'Failed to fetch ads' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const ad = new Ad(req.body);
    await ad.save();
    res.status(201).json(ad);
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(500).json({ error: 'Failed to create advertisement' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const ad = await Ad.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!ad) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }
    res.json(ad);
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({ error: 'Failed to update advertisement' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const ad = await Ad.findByIdAndDelete(req.params.id);
    if (!ad) {
      return res.status(404).json({ error: 'Advertisement not found' });
    }
    res.json({ message: 'Advertisement deleted successfully' });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({ error: 'Failed to delete advertisement' });
  }
});

export default router;
