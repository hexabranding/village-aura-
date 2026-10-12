import express from 'express';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ order: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.put('/reorder', auth, async (req, res) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) {
      return res.status(400).json({ error: 'Order must be an array of { id, order } objects' });
    }
    const ops = order.map(({ id, order: o }) => ({
      updateOne: { filter: { _id: id }, update: { $set: { order: o } } },
    }));
    await Category.bulkWrite(ops);
    const categories = await Category.find().sort({ order: 1, name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Reorder categories error:', error);
    res.status(500).json({ error: 'Failed to reorder categories' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Category with this name already exists' });
    }
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const existing = await Category.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const oldName = existing.name;
    const oldSubcategories = existing.subcategories || [];

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // Keep existing products attached when a category is renamed,
    // otherwise they no longer match any category and disappear everywhere.
    if (category.name !== oldName) {
      await Product.updateMany({ category: oldName }, { $set: { category: category.name } });
    }
    // Products using a removed subcategory fall back to the parent category.
    const newSubs = new Set(category.subcategories || []);
    const removedSubs = oldSubcategories.filter((s) => !newSubs.has(s));
    if (removedSubs.length > 0) {
      await Product.updateMany(
        { category: category.name, subCategory: { $in: removedSubs } },
        { $set: { subCategory: '' } }
      );
    }

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

export default router;
