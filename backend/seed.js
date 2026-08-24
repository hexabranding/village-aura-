import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for seeding');

    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    const hashedPassword = await bcrypt.hash('admin123', 10);
    await User.create({
      username: 'admin',
      password: hashedPassword,
      role: 'admin',
    });
    console.log('Default admin user created (admin / admin123)');

    const categories = await Category.insertMany([
      {
        name: 'Sarees',
        slug: 'sarees',
        subcategories: ['Kanchipuram Silk', 'Banarasi Silk', 'Chanderi Silk', 'Maheshwari Silk', 'Kota Doria', 'Ajrakh Cotton', 'Kota Cotton', 'Kalamkari'],
        description: 'Handwoven sarees from India\'s finest weaving traditions',
        active: true,
      },
      {
        name: 'Jewellery',
        slug: 'jewellery',
        subcategories: ['Necklaces', 'Earrings', 'Bangles', 'Hair Jewellery'],
        description: 'Temple kemp, kundan & antique gold jewellery',
        active: true,
      },
      {
        name: 'Bags',
        slug: 'bags',
        subcategories: ['Clutches', 'Totes', 'Potli'],
        description: 'Handwoven clutches, potlis & totes',
        active: true,
      },
      {
        name: 'Suits Sets',
        slug: 'suits-sets',
        subcategories: ['Anarkali', 'Straight Cut'],
        description: 'Anarkali & straight suit sets in handloom fabrics',
        active: true,
      },
      {
        name: 'Others',
        slug: 'others',
        subcategories: [],
        description: 'Other curated handloom finds',
        active: true,
      },
      {
        name: 'Gallery',
        slug: 'gallery',
        subcategories: [],
        description: 'Gallery collection',
        active: true,
      },
    ]);
    console.log(`${categories.length} categories created`);

    const products = await Product.insertMany([
      {
        _id: 'kanjivaram-maroon',
        name: 'Kanjivaram Silk — Temple Border',
        category: 'Sarees',
        fabric: 'Pure Mulberry Silk',
        price: 18500,
        mrp: 24000,
        description: 'Woven in Kanchipuram by third-generation weavers, this piece carries a temple-motif zari border and a contrast pallu in deep maroon and antique gold.',
        details: ['Handwoven pure silk, 6.3m with attached blouse piece', 'Zari border woven with genuine gold-toned thread', 'Temple motif pallu, contrast body', 'Comes with authenticity weave certificate'],
        care: ['Dry clean only', 'Store folded in muslin cloth', 'Avoid direct sunlight for long periods'],
        variants: [{ colorName: 'Deep Maroon', hex: '#6b1e23', images: [] }, { colorName: 'Emerald Teal', hex: '#1f4741', images: [] }],
        featured: true,
        isBestSeller: true,
      },
      {
        _id: 'banarasi-ivory-gold',
        name: 'Banarasi Zari Weave',
        category: 'Sarees',
        fabric: 'Banarasi Silk Brocade',
        price: 27500,
        mrp: 33000,
        description: 'A Banarasi heirloom piece, densely woven with a jaal of gold zari across an ivory field — built for a wedding day and the decades of occasions after it.',
        details: ['Handloom Banarasi brocade, 6.3m', 'Dense zari jaal work, unstitched blouse fabric included', 'Slight sheen finish, medium weight drape'],
        care: ['Dry clean only', 'First wear: air out 24 hours before draping', 'Store away from moisture'],
        variants: [{ colorName: 'Ivory Gold', hex: '#efe4d0', images: [] }, { colorName: 'Rose Dust', hex: '#e8c4c4', images: [] }],
        featured: true,
        isNew: true,
      },
      {
        _id: 'temple-kemp-necklace',
        name: 'Temple Kemp Necklace Set',
        category: 'Jewellery',
        subCategory: 'Necklaces',
        fabric: 'Gold-Polish Brass, Kemp Stones',
        price: 6400,
        mrp: 8200,
        description: 'A temple-work necklace set in kemp red and green, the pairing traditionally worn with silk. Comes with matching jhumka earrings.',
        details: ['Gold-polish brass base', 'Hand-set kemp stone work', 'Includes matching jhumka earrings', 'Adjustable thread closure'],
        care: ['Keep away from perfume and water', 'Store in a cloth pouch, away from air', 'Polish gently with a soft dry cloth'],
        variants: [{ colorName: 'Kemp Red-Green', hex: '#8a2c1f', images: [] }],
        featured: true,
      },
      {
        _id: 'brocade-potli-clutch',
        name: 'Brocade Potli Clutch',
        category: 'Bags',
        fabric: 'Zari Brocade',
        price: 2800,
        mrp: 3400,
        description: 'A drawstring potli in gold-shot zari brocade — the finishing touch that keeps up with a Banarasi on the days that matter.',
        details: ['Zari brocade weave, silk-lined', 'Drawstring closure with tassel', 'Interior slip pocket'],
        care: ['Store away from moisture', 'Keep from perfume contact', 'Wipe with dry cloth only'],
        variants: [{ colorName: 'Antique Gold', hex: '#c08a3e', images: [] }],
        isNew: true,
      },
      {
        _id: 'chanderi-anarkali-set',
        name: 'Chanderi Anarkali Suit Set',
        category: 'Suits Sets',
        fabric: 'Chanderi Silk-Cotton',
        price: 6200,
        mrp: 7500,
        description: 'An anarkali kurta, churidar and dupatta set in feather-light Chanderi — elegant, unconstructed and made for custom tailoring.',
        details: ['Chanderi silk-cotton, 3.5m with churidar & 2.5m dupatta', 'Thin zari border on kurta and dupatta', 'Unstitched, tailored to your fit'],
        care: ['Dry clean recommended', 'Iron on low heat', 'Store in muslin cloth'],
        variants: [{ colorName: 'Ivory Gold', hex: '#efe4d0', images: [] }, { colorName: 'Teal', hex: '#1f4741', images: [] }],
        featured: true,
        isBestSeller: true,
      },
    ]);
    console.log(`${products.length} products created`);

    console.log('\nSeeding complete!');
    console.log('Admin login: admin / admin123');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
