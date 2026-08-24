import express from 'express';
import WeaverStory from '../models/WeaverStory.js';
import auth from '../middleware/auth.js';
const router = express.Router();
router.get('/', async (req,res)=>{ try{ let doc=await WeaverStory.findOne(); if(!doc){ doc=await WeaverStory.create({}); } res.json(doc);}catch(e){console.error(e); res.status(500).json({error:'Failed'});} });
router.put('/', auth, async (req,res)=>{ try{ let doc=await WeaverStory.findOne(); if(!doc) doc=new WeaverStory(req.body); else Object.assign(doc, req.body); await doc.save(); res.json(doc);}catch(e){console.error(e); res.status(500).json({error:'Failed'});} });
export default router;
