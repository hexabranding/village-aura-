import express from 'express';
import Review from '../models/Review.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/order/:orderId', async (req, res) => {
  try {
    const reviews = await Review.find({ orderId: req.params.orderId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews by order error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.get('/phone/:phone', async (req, res) => {
  try {
    const reviews = await Review.find({ phone: req.params.phone }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews by phone error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.post('/', async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }
    res.json({ message: 'Review deleted' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

export default router;
