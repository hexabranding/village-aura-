import express from 'express';
import Testimonial from '../models/Testimonial.js';
import auth from '../middleware/auth.js';
const router = express.Router();

router.get('/active', async (req, res) => {
  try {
    const data = await Testimonial.find({ active: true }).sort({ order: 1 });
    res.json(data);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to fetch testimonials' }); }
});

router.get('/', auth, async (req, res) => {
  try {
    const data = await Testimonial.find().sort({ order: 1 });
    res.json(data);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to fetch testimonials' }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const doc = new Testimonial(req.body);
    await doc.save();
    res.status(201).json(doc);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to create testimonial' }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const doc = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to update' }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const doc = await Testimonial.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to delete' }); }
});

export default router;
