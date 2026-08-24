import express from 'express';
import Gallery from '../models/Gallery.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/active', async (req, res) => {
  try {
    const images = await Gallery.find({ active: true }).sort({ order: 1 });
    res.json(images);
  } catch (error) {
    console.error('Get active gallery error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery images' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const images = await Gallery.find().sort({ order: 1 });
    res.json(images);
  } catch (error) {
    console.error('Get gallery error:', error);
    res.status(500).json({ error: 'Failed to fetch gallery images' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const image = new Gallery(req.body);
    await image.save();
    res.status(201).json(image);
  } catch (error) {
    console.error('Create gallery image error:', error);
    res.status(500).json({ error: 'Failed to create gallery image' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const image = await Gallery.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!image) {
      return res.status(404).json({ error: 'Gallery image not found' });
    }
    res.json(image);
  } catch (error) {
    console.error('Update gallery image error:', error);
    res.status(500).json({ error: 'Failed to update gallery image' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const image = await Gallery.findByIdAndDelete(req.params.id);
    if (!image) {
      return res.status(404).json({ error: 'Gallery image not found' });
    }
    res.json({ message: 'Gallery image deleted successfully' });
  } catch (error) {
    console.error('Delete gallery image error:', error);
    res.status(500).json({ error: 'Failed to delete gallery image' });
  }
});

export default router;
