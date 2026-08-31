import express from 'express';
import Return from '../models/Return.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/phone/:phone', async (req, res) => {
  try {
    const returns = await Return.find({ phone: req.params.phone }).sort({ createdAt: -1 });
    res.json(returns);
  } catch (error) {
    console.error('Get returns by phone error:', error);
    res.status(500).json({ error: 'Failed to fetch returns' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const returns = await Return.find().sort({ createdAt: -1 });
    res.json(returns);
  } catch (error) {
    console.error('Get all returns error:', error);
    res.status(500).json({ error: 'Failed to fetch returns' });
  }
});

router.post('/', async (req, res) => {
  try {
    const returnReq = new Return(req.body);
    await returnReq.save();
    res.status(201).json(returnReq);
  } catch (error) {
    console.error('Create return error:', error);
    res.status(500).json({ error: 'Failed to create return request' });
  }
});

router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const returnReq = await Return.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!returnReq) {
      return res.status(404).json({ error: 'Return request not found' });
    }
    res.json(returnReq);
  } catch (error) {
    console.error('Update return status error:', error);
    res.status(500).json({ error: 'Failed to update return status' });
  }
});

export default router;
