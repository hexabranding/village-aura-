import express from 'express';
import ReturnSettings from '../models/ReturnSettings.js';
import auth from '../middleware/auth.js';

const router = express.Router();

const defaultReasons = [
  'Product damaged','Product broken','Product defective/not working','Wrong product received',
  'Wrong size/colour/variant','Missing item','Missing accessories/parts','Product quality issue',
  'Product does not match description','Product looks different from images','Packaging damaged',
  'Expired product','Product received used/opened','Other'
];

router.get('/', async (req, res) => {
  try {
    let settings = await ReturnSettings.findOne();
    if (!settings) {
      settings = await ReturnSettings.create({ reasons: defaultReasons });
    }
    res.json(settings);
  } catch (e) { res.status(500).json({ error: 'Failed to fetch settings' }); }
});

router.get('/admin', auth, async (req, res) => {
  try {
    let settings = await ReturnSettings.findOne();
    if (!settings) settings = await ReturnSettings.create({ reasons: defaultReasons });
    res.json(settings);
  } catch (e) { res.status(500).json({ error: 'Failed' }); }
});

router.put('/', auth, async (req, res) => {
  try {
    let settings = await ReturnSettings.findOne();
    if (!settings) settings = new ReturnSettings(req.body);
    else Object.assign(settings, req.body);
    await settings.save();
    res.json(settings);
  } catch (e) { console.error(e); res.status(500).json({ error: 'Failed to update' }); }
});

export default router;
