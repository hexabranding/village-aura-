export interface ProductVariant {
  colorName: string;
  hex: string;
  images: string[];
}

export interface CartItem {
  id: string;
  colorIndex: number;
  qty: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  subCategory?: string;
  fabric: string;
  price: number;
  mrp?: number;
  description: string;
  details: string[];
  care: string[];
  variants: ProductVariant[];
  featured?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
}

const sareeImages = [
  'https://images.pexels.com/photos/1229414/pexels-photo-1229414.jpeg',
  'https://images.pexels.com/photos/1446161/pexels-photo-1446161.jpeg',
  'https://images.pexels.com/photos/1162983/pexels-photo-1162983.jpeg',
  'https://images.pexels.com/photos/3594582/pexels-photo-3594582.jpeg',
  'https://images.pexels.com/photos/12707148/pexels-photo-12707148.jpeg',
  'https://images.pexels.com/photos/27155550/pexels-photo-27155550.jpeg',
  'https://images.pexels.com/photos/27155540/pexels-photo-27155540.jpeg',
  'https://images.pexels.com/photos/27155545/pexels-photo-27155545.jpeg',
  'https://images.pexels.com/photos/8489649/pexels-photo-8489649.jpeg',
  'https://images.pexels.com/photos/30249392/pexels-photo-30249392.jpeg',
  'https://images.pexels.com/photos/5585346/pexels-photo-5585346.jpeg',
  'https://images.pexels.com/photos/2723623/pexels-photo-2723623.jpeg',
  'https://images.pexels.com/photos/27139278/pexels-photo-27139278.jpeg',
  'https://images.pexels.com/photos/11822308/pexels-photo-11822308.jpeg',
  'https://images.pexels.com/photos/11819173/pexels-photo-11819173.jpeg',
  'https://images.pexels.com/photos/2965095/pexels-photo-2965095.jpeg',
  'https://images.pexels.com/photos/2150622/pexels-photo-2150622.jpeg',
  'https://images.pexels.com/photos/31660114/pexels-photo-31660114.jpeg',
  'https://images.pexels.com/photos/27155546/pexels-photo-27155546.jpeg',
  'https://images.pexels.com/photos/27103969/pexels-photo-27103969.jpeg',
];

const jewelleryImages = [
  'https://images.pexels.com/photos/32780784/pexels-photo-32780784.jpeg',
  'https://images.pexels.com/photos/13079571/pexels-photo-13079571.jpeg',
  'https://images.pexels.com/photos/33154729/pexels-photo-33154729.jpeg',
  'https://images.pexels.com/photos/29245554/pexels-photo-29245554.jpeg',
  'https://images.pexels.com/photos/29038003/pexels-photo-29038003.jpeg',
  'https://images.pexels.com/photos/7632901/pexels-photo-7632901.jpeg',
  'https://images.pexels.com/photos/35059564/pexels-photo-35059564.jpeg',
  'https://images.pexels.com/photos/25389117/pexels-photo-25389117.jpeg',
  'https://images.pexels.com/photos/6011769/pexels-photo-6011769.jpeg',
  'https://images.pexels.com/photos/27155549/pexels-photo-27155549.jpeg',
  'https://images.pexels.com/photos/27155552/pexels-photo-27155552.jpeg',
  'https://images.pexels.com/photos/27155541/pexels-photo-27155541.jpeg',
];

const bagImages = [
  'https://images.pexels.com/photos/1152077/pexels-photo-1152077.jpeg',
  'https://images.pexels.com/photos/10477070/pexels-photo-10477070.jpeg',
  'https://images.pexels.com/photos/2442893/pexels-photo-2442893.jpeg',
  'https://images.pexels.com/photos/1038000/pexels-photo-1038000.jpeg',
  'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg',
  'https://images.pexels.com/photos/1251198/pexels-photo-1251198.jpeg',
  'https://images.pexels.com/photos/2081169/pexels-photo-2081169.jpeg',
  'https://images.pexels.com/photos/1038002/pexels-photo-1038002.jpeg',
  'https://images.pexels.com/photos/1152076/pexels-photo-1152076.jpeg',
  'https://images.pexels.com/photos/934069/pexels-photo-934069.jpeg',
];

const suitImages = [
  'https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg',
  'https://images.pexels.com/photos/2747446/pexels-photo-2747446.jpeg',
  'https://images.pexels.com/photos/2747448/pexels-photo-2747448.jpeg',
  'https://images.pexels.com/photos/3641056/pexels-photo-3641056.jpeg',
  'https://images.pexels.com/photos/3641110/pexels-photo-3641110.jpeg',
  'https://images.pexels.com/photos/3641069/pexels-photo-3641069.jpeg',
  'https://images.pexels.com/photos/2747447/pexels-photo-2747447.jpeg',
  'https://images.pexels.com/photos/3641055/pexels-photo-3641055.jpeg',
  'https://images.pexels.com/photos/3641104/pexels-photo-3641104.jpeg',
  'https://images.pexels.com/photos/3641364/pexels-photo-3641364.jpeg',
];

const imgPool = (pool: string[], seed: string, w = 900, h = 1150) => {
  const index = Math.abs(seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % pool.length;
  return `${pool[index]}?w=${w}&h=${h}&fit=crop`;
};

const saree = (seed: string, w = 900, h = 1150) => imgPool(sareeImages, seed, w, h);
const jewellery = (seed: string, w = 900, h = 1150) => imgPool(jewelleryImages, seed, w, h);
const bag = (seed: string, w = 900, h = 1150) => imgPool(bagImages, seed, w, h);
const suit = (seed: string, w = 900, h = 1150) => imgPool(suitImages, seed, w, h);

export const products: Product[] = [
  {
    id: 'kanjivaram-maroon',
    name: 'Kanjivaram Silk — Temple Border',
    category: 'Sarees',
    fabric: 'Pure Mulberry Silk',
    price: 18500,
    mrp: 24000,
    description:
      'Woven in Kanchipuram by third-generation weavers, this piece carries a temple-motif zari border and a contrast pallu in deep maroon and antique gold.',
    details: [
      'Handwoven pure silk, 6.3m with attached blouse piece',
      'Zari border woven with genuine gold-toned thread',
      'Temple motif pallu, contrast body',
      'Comes with authenticity weave certificate',
    ],
    care: ['Dry clean only', 'Store folded in muslin cloth', 'Avoid direct sunlight for long periods'],
    variants: [
      { colorName: 'Deep Maroon', hex: '#6b1e23', images: [saree('kanj-maroon-1'), saree('kanj-maroon-2'), saree('kanj-maroon-3'), saree('kanj-maroon-4')] },
      { colorName: 'Emerald Teal', hex: '#1f4741', images: [saree('kanj-teal-1'), saree('kanj-teal-2'), saree('kanj-teal-3')] },
    ],
    featured: true,
    isBestSeller: true,
  },
  {
    id: 'banarasi-ivory-gold',
    name: 'Banarasi Zari Weave',
    category: 'Sarees',
    fabric: 'Banarasi Silk Brocade',
    price: 27500,
    mrp: 33000,
    description:
      'A Banarasi heirloom piece, densely woven with a jaal of gold zari across an ivory field — built for a wedding day and the decades of occasions after it.',
    details: [
      'Handloom Banarasi brocade, 6.3m',
      'Dense zari jaal work, unstitched blouse fabric included',
      'Slight sheen finish, medium weight drape',
    ],
    care: ['Dry clean only', 'First wear: air out 24 hours before draping', 'Store away from moisture'],
    variants: [
      { colorName: 'Ivory Gold', hex: '#efe4d0', images: [saree('ban-ivory-1'), saree('ban-ivory-2'), saree('ban-ivory-3'), saree('ban-ivory-4')] },
      { colorName: 'Rose Dust', hex: '#e8c4c4', images: [saree('ban-rose-1'), saree('ban-rose-2'), saree('ban-rose-3')] },
    ],
    featured: true,
    isNew: true,
  },
  {
    id: 'chanderi-cotton-teal',
    name: 'Chanderi Cotton — Everyday Weave',
    category: 'Sarees',
    subCategory: 'Chanderi Silk',
    fabric: 'Chanderi Cotton-Silk',
    price: 4200,
    description:
      'Light as a Tuesday afternoon. A Chanderi cotton-silk blend with a thin gold line border, made for the days you still want to feel dressed.',
    details: ['Chanderi cotton-silk blend, 5.8m', 'Lightweight, breathable weave', 'Thin zari line border'],
    care: ['Gentle hand wash separately', 'Line dry in shade', 'Iron on medium heat'],
    variants: [
      { colorName: 'Deep Teal', hex: '#1f4741', images: [saree('chan-teal-1'), saree('chan-teal-2'), saree('chan-teal-3')] },
      { colorName: 'Sun Ochre', hex: '#c08a3e', images: [saree('chan-ochre-1'), saree('chan-ochre-2'), saree('chan-ochre-3')] },
    ],
    featured: true,
    isBestSeller: true,
  },
  {
    id: 'tant-white-red',
    name: 'Tant Cotton — Red Paar',
    category: 'Sarees',
    fabric: 'Bengal Tant Cotton',
    price: 3100,
    description:
      'A classic Bengal tant, crisp white body with a red paar border — the saree that shows up in every good memory from home.',
    details: ['Traditional Bengal handloom tant cotton, 5.5m', 'Crisp starch finish', 'Red woven border and pallu'],
    care: ['Hand wash cold', 'Starch lightly after wash', 'Iron while slightly damp'],
    variants: [
      { colorName: 'Classic Red', hex: '#6b1e23', images: [saree('tant-red-1'), saree('tant-red-2'), saree('tant-red-3')] },
    ],
    featured: true,
  },
  {
    id: 'jamdani-blue',
    name: 'Jamdani — Hand-Loomed Motif',
    category: 'Sarees',
    fabric: 'Jamdani Muslin',
    price: 9800,
    mrp: 12500,
    description:
      'Motifs laid in by hand during the weave itself, not printed after — the defining trait of a true Jamdani. Soft, sheer, unmistakably handmade.',
    details: ['Hand-loomed Jamdani muslin, 5.8m', 'Motifs woven in during construction', 'Sheer, soft drape'],
    care: ['Dry clean recommended', 'If hand washing, use cold water only', 'Never wring — press dry'],
    variants: [
      { colorName: 'Indigo', hex: '#243b53', images: [saree('jam-blue-1'), saree('jam-blue-2'), saree('jam-blue-3')] },
      { colorName: 'Ivory', hex: '#f7f1e6', images: [saree('jam-ivory-1'), saree('jam-ivory-2'), saree('jam-ivory-3')] },
    ],
    isNew: true,
  },
  {
    id: 'organza-blush',
    name: 'Organza Silk — Floral Buti',
    category: 'Sarees',
    fabric: 'Pure Organza Silk',
    price: 8600,
    description:
      'Sheer organza scattered with a fine floral buti, finished with a delicate scalloped gold border. Light enough for a summer wedding, formal enough for one too.',
    details: ['Pure silk organza, 5.7m', 'Scalloped zari border', 'Fine all-over floral buti weave'],
    care: ['Dry clean only', 'Store flat or loosely folded', 'Keep away from sharp jewellery when storing'],
    variants: [
      { colorName: 'Blush Rose', hex: '#e8c4c4', images: [saree('org-blush-1'), saree('org-blush-2'), saree('org-blush-3')] },
      { colorName: 'Gold Ochre', hex: '#d9b678', images: [saree('org-gold-1'), saree('org-gold-2'), saree('org-gold-3')] },
    ],
    isBestSeller: true,
  },
  {
    id: 'temple-kemp-necklace',
    name: 'Temple Kemp Necklace Set',
    category: 'Jewellery',
    subCategory: 'Necklaces',
    fabric: 'Gold-Polish Brass, Kemp Stones',
    price: 6400,
    mrp: 8200,
    description:
      'A temple-work necklace set in kemp red and green, the pairing traditionally worn with silk. Comes with matching jhumka earrings.',
    details: ['Gold-polish brass base', 'Hand-set kemp stone work', 'Includes matching jhumka earrings', 'Adjustable thread closure'],
    care: ['Keep away from perfume and water', 'Store in a cloth pouch, away from air', 'Polish gently with a soft dry cloth'],
    variants: [
      { colorName: 'Kemp Red-Green', hex: '#8a2c1f', images: [jewellery('orn-temple-1'), jewellery('orn-temple-2'), jewellery('orn-temple-3')] },
    ],
    featured: true,
  },
  {
    id: 'jhumka-gold-polish',
    name: 'Gold-Polish Jhumka Earrings',
    category: 'Jewellery',
    subCategory: 'Earrings',
    fabric: 'Gold-Polish Brass, Pearl Drops',
    price: 1850,
    description:
      'The everyday jhumka — a bell-shaped drop with fine filigree work and a row of pearl beads, light enough to wear from morning to a dinner out.',
    details: ['Gold-polish brass filigree', 'Freshwater pearl drops', 'Push-back closure'],
    care: ['Remove before bathing or sleeping', 'Store flat to protect the shape', 'Avoid contact with perfume'],
    variants: [
      { colorName: 'Antique Gold', hex: '#c08a3e', images: [jewellery('orn-jhumka-1'), jewellery('orn-jhumka-2'), jewellery('orn-jhumka-3')] },
      { colorName: 'Antique Silver', hex: '#b9b4ab', images: [jewellery('orn-jhumka-s1'), jewellery('orn-jhumka-s2'), jewellery('orn-jhumka-s3')] },
    ],
  },
  {
    id: 'kundan-maang-tikka',
    name: 'Kundan Maang Tikka',
    category: 'Jewellery',
    subCategory: 'Hair Jewellery',
    fabric: 'Kundan & Polki Stones',
    price: 2950,
    description:
      'A single kundan pendant on a fine gold-tone chain, sitting right at the parting — the piece that finishes a bridal look.',
    details: ['Kundan and polki stone setting', 'Adjustable hook chain', 'Lightweight brass base'],
    care: ['Handle the stones gently — avoid pulling at the setting', 'Store separately to prevent scratching', 'Keep dry'],
    variants: [
      { colorName: 'Ivory Kundan', hex: '#efe4d0', images: [jewellery('orn-tikka-1'), jewellery('orn-tikka-2'), jewellery('orn-tikka-3')] },
    ],
    isNew: true,
  },
  {
    id: 'antique-bangles-set',
    name: 'Antique Matte Bangles — Set of 6',
    category: 'Jewellery',
    subCategory: 'Bangles',
    fabric: 'Antique Matte Gold Finish',
    price: 3200,
    mrp: 3900,
    description:
      'Six bangles in a matte antique finish with a fine floral etch, sized to stack — the sound they make is half the point.',
    details: ['Set of 6 bangles', 'Antique matte gold finish', 'Etched floral pattern', 'Available in three size ranges'],
    care: ['Wipe with a dry cloth after wear', 'Avoid water and lotion contact', 'Store in individual pouches to prevent scratching'],
    variants: [
      { colorName: 'Antique Gold', hex: '#c08a3e', images: [jewellery('orn-bangle-1'), jewellery('orn-bangle-2'), jewellery('orn-bangle-3')] },
    ],
    isBestSeller: true,
  },
  {
    id: 'kanjivaram-peacock-teal',
    name: 'Kanjivaram Silk — Peacock Motif',
    category: 'Sarees',
    fabric: 'Pure Mulberry Silk',
    price: 22000,
    mrp: 28000,
    description:
      'A deep teal Kanjivaram with a hand-woven peacock-motif border and a contrast temple pallu in antique gold — made for the celebrations that deserve a little drama.',
    details: [
      'Handwoven pure silk, 6.3m with attached blouse piece',
      'Peacock motif zari border in gold-toned thread',
      'Contrast temple motif pallu',
      'Comes with authenticity weave certificate',
    ],
    care: ['Dry clean only', 'Store folded in muslin cloth', 'Keep away from sharp jewellery when storing'],
    variants: [
      { colorName: 'Deep Teal', hex: '#1f4741', images: [saree('kanj-teal-1'), saree('kanj-teal-2'), saree('kanj-teal-3')] },
      { colorName: 'Royal Purple', hex: '#4b2a5e', images: [saree('kanj-purple-1'), saree('kanj-purple-2'), saree('kanj-purple-3')] },
    ],
    featured: true,
    isBestSeller: true,
  },
  {
    id: 'maheshwari-geometric',
    name: 'Maheshwari Silk — Geometric Border',
    category: 'Sarees',
    subCategory: 'Maheshwari Silk',
    fabric: 'Maheshwari Silk',
    price: 6800,
    mrp: 8400,
    description:
      'A Maheshwari with a geometric hand-woven border and a subtle two-tone body — feather-light silk that drapes as easily at work as at a wedding.',
    details: ['Handwoven Maheshwari silk, 6.1m', 'Geometric border in contrasting zari', 'Lightweight, easy-drape finish'],
    care: ['Dry clean or gentle hand wash', 'Iron on low heat while damp', 'Store away from direct sunlight'],
    variants: [
      { colorName: 'Dust Rose', hex: '#e8c4c4', images: [saree('mah-rose-1'), saree('mah-rose-2'), saree('mah-rose-3')] },
      { colorName: 'Sage Green', hex: '#8a9a7b', images: [saree('mah-sage-1'), saree('mah-sage-2'), saree('mah-sage-3')] },
    ],
    featured: true,
    isNew: true,
  },
  {
    id: 'pochampally-ikat-cotton',
    name: 'Pochampally Ikat — Handwoven',
    category: 'Sarees',
    fabric: 'Pochampally Cotton-Silk',
    price: 5400,
    description:
      'Ikat dyed on the yarn before it ever reaches the loom — a soft geometric grid in faded blues and creams, from the weavers of Bhoodan Pochampally.',
    details: ['Yarn-dyed ikat, 5.9m', 'Soft cotton-silk blend', 'Hand-finished ends'],
    care: ['Gentle hand wash separately', 'Dry in shade', 'Iron on medium heat'],
    variants: [
      { colorName: 'Indigo Cream', hex: '#243b53', images: [saree('poch-indigo-1'), saree('poch-indigo-2'), saree('poch-indigo-3')] },
      { colorName: 'Burnt Orange', hex: '#c05a2e', images: [saree('poch-orange-1'), saree('poch-orange-2'), saree('poch-orange-3')] },
    ],
    isBestSeller: true,
  },
  {
    id: 'kota-doria-check',
    name: 'Kota Doria — Fine Check',
    category: 'Sarees',
    subCategory: 'Kota Doria',
    fabric: 'Kota Doria Cotton',
    price: 3600,
    mrp: 4500,
    description:
      'The whisper-light cotton from Kota, woven in its signature fine square checks with a thin zari edge — breezy, elegant and endlessly wearable.',
    details: ['Genuine Kota Doria, 5.8m', 'Fine square check weave', 'Thin zari border line'],
    care: ['Hand wash cold', 'Starch lightly', 'Iron while slightly damp'],
    variants: [
      { colorName: 'Sky Blue', hex: '#9fc5d8', images: [saree('kota-blue-1'), saree('kota-blue-2'), saree('kota-blue-3')] },
      { colorName: 'Peach', hex: '#f2c9b3', images: [saree('kota-peach-1'), saree('kota-peach-2'), saree('kota-peach-3')] },
    ],
    featured: true,
    isNew: true,
  },
  {
    id: 'linen-natural-flax',
    name: 'Linen Saree — Natural Flax',
    category: 'Sarees',
    fabric: 'Pure Linen',
    price: 4800,
    description:
      'Raw natural linen with a slubbed texture and a hand-finished edge — the no-fuss saree for long days and longer conversations.',
    details: ['Pure linen, 6m', 'Natural slub texture', 'Relaxed all-day drape'],
    care: ['Machine wash gentle cycle', 'Dry flat', 'Iron while damp on high heat'],
    variants: [
      { colorName: 'Natural Flax', hex: '#e5dcc8', images: [saree('lin-flax-1'), saree('lin-flax-2'), saree('lin-flax-3')] },
      { colorName: 'Charcoal', hex: '#3a3a3a', images: [saree('lin-charcoal-1'), saree('lin-charcoal-2'), saree('lin-charcoal-3')] },
    ],
    featured: true,
  },
  {
    id: 'banarasi-silk-dupatta',
    name: 'Banarasi Silk Dupatta',
    category: 'Sarees',
    fabric: 'Banarasi Silk',
    price: 4200,
    mrp: 5200,
    description:
      'A Banarasi dupatta in gold shot weave — gives any kurta or indo-western look an immediate touch of occasion.',
    details: ['Banarasi silk weave, 2.25m', 'Gold zari edge on both borders', 'Slight sheen finish'],
    care: ['Dry clean only', 'Store folded in muslin', 'Avoid contact with perfume'],
    variants: [
      { colorName: 'Rose Gold', hex: '#d9a566', images: [saree('dup-gold-1'), saree('dup-gold-2'), saree('dup-gold-3')] },
      { colorName: 'Emerald', hex: '#1f4741', images: [saree('dup-green-1'), saree('dup-green-2'), saree('dup-green-3')] },
    ],
    isNew: true,
  },
  {
    id: 'meenakari-necklace',
    name: 'Meenakari Temple Necklace',
    category: 'Jewellery',
    subCategory: 'Necklaces',
    fabric: 'Meenakari & Polki Brass',
    price: 5200,
    mrp: 6400,
    description:
      'A grander statement for big occasions — meenakari enamel panels strung on textured gold-tone beads, finished with a peacock pendant drop.',
    details: ['Meenakari enamel work', 'Gold-tone brass chain', 'Peacock pendant drop', 'Lobster-claw closure'],
    care: ['Keep away from water and perfume', 'Store in a cloth pouch', 'Polish gently with a soft dry cloth'],
    variants: [
      { colorName: 'Teal Meenakari', hex: '#1f4741', images: [jewellery('orn-meena-1'), jewellery('orn-meena-2'), jewellery('orn-meena-3')] },
    ],
    isBestSeller: true,
  },
  {
    id: 'chandbali-earrings',
    name: 'Chandbali Earrings — Moon & Pearl',
    category: 'Jewellery',
    subCategory: 'Earrings',
    fabric: 'Gold-Polish Brass, Pearl Drops',
    price: 2400,
    description:
      'Crescent-moon chandbalis strung with teardrop pearls — temple jewellery silhouettes sized down for everyday wear.',
    details: ['Crescent chandbali shape', 'Teardrop pearl drops', 'Push-back closure'],
    care: ['Remove before bathing', 'Store flat to protect shape', 'Wipe with dry cloth after wear'],
    variants: [
      { colorName: 'Antique Gold', hex: '#c08a3e', images: [jewellery('orn-chandbali-1'), jewellery('orn-chandbali-2'), jewellery('orn-chandbali-3')] },
    ],
    featured: true,
    isNew: true,
  },
  {
    id: 'brocade-potli-clutch',
    name: 'Brocade Potli Clutch',
    category: 'Bags',
    fabric: 'Zari Brocade',
    price: 2800,
    mrp: 3400,
    description:
      'A drawstring potli in gold-shot zari brocade — the finishing touch that keeps up with a Banarasi on the days that matter.',
    details: ['Zari brocade weave, silk-lined', 'Drawstring closure with tassel', 'Interior slip pocket'],
    care: ['Store away from moisture', 'Keep from perfume contact', 'Wipe with dry cloth only'],
    variants: [
      { colorName: 'Antique Gold', hex: '#c08a3e', images: [bag('bag-potli-1'), bag('bag-potli-2'), bag('bag-potli-3')] },
    ],
    isNew: true,
  },
  {
    id: 'jamdani-cotton-tote',
    name: 'Jamdani Cotton Tote',
    category: 'Bags',
    fabric: 'Jamdani Cotton',
    price: 1900,
    description:
      'A generous everyday tote woven in cotton jamdani — roomy enough for the market run, pretty enough to be noticed doing it.',
    details: ['Handwoven cotton jamdani', 'Two interior pockets + zip pouch', 'Soft cotton shoulder straps'],
    care: ['Hand wash cold', 'Dry flat', 'Iron on medium heat'],
    variants: [
      { colorName: 'Ivory Indigo', hex: '#243b53', images: [bag('bag-tote-1'), bag('bag-tote-2'), bag('bag-tote-3')] },
      { colorName: 'Blush', hex: '#e8c4c4', images: [bag('bag-tote-rose-1'), bag('bag-tote-rose-2'), bag('bag-tote-rose-3')] },
    ],
    isBestSeller: true,
  },
  {
    id: 'banarasi-evening-clutch',
    name: 'Banarasi Silk Evening Clutch',
    category: 'Bags',
    fabric: 'Banarasi Silk',
    price: 3500,
    mrp: 4200,
    description:
      'A hard-shell clutch wrapped in gold Banarasi silk — slips in a phone, a lipstick and a small measure of confidence.',
    details: ['Banarasi silk exterior', 'Magnetic flap closure', 'Satin interior with card slots'],
    care: ['Spot clean only', 'Store in the dust bag provided', 'Keep away from water'],
    variants: [
      { colorName: 'Gold', hex: '#d9b678', images: [bag('bag-clutch-1'), bag('bag-clutch-2'), bag('bag-clutch-3')] },
      { colorName: 'Deep Maroon', hex: '#6b1e23', images: [bag('bag-clutch-maroon-1'), bag('bag-clutch-maroon-2'), bag('bag-clutch-maroon-3')] },
    ],
    featured: true,
  },
  {
    id: 'chanderi-anarkali-set',
    name: 'Chanderi Anarkali Suit Set',
    category: 'Unstitched Suit Sets',
    fabric: 'Chanderi Silk-Cotton',
    price: 6200,
    mrp: 7500,
    description:
      'An anarkali kurta, churidar and dupatta set in feather-light Chanderi — elegant, unconstructed and made for custom tailoring.',
    details: ['Chanderi silk-cotton, 3.5m with churidar & 2.5m dupatta', 'Thin zari border on kurta and dupatta', 'Unstitched, tailored to your fit'],
    care: ['Dry clean recommended', 'Iron on low heat', 'Store in muslin cloth'],
    variants: [
      { colorName: 'Ivory Gold', hex: '#efe4d0', images: [suit('suit-ana-1'), suit('suit-ana-2'), suit('suit-ana-3')] },
      { colorName: 'Teal', hex: '#1f4741', images: [suit('suit-ana-teal-1'), suit('suit-ana-teal-2'), suit('suit-ana-teal-3')] },
    ],
    featured: true,
    isBestSeller: true,
  },
  {
    id: 'kota-straight-suit-set',
    name: 'Kota Doria Straight Set',
    category: 'Unstitched Suit Sets',
    fabric: 'Kota Doria Cotton',
    price: 3800,
    description:
      'A straight-cut kurta set in Kota Doria — the fine-check cotton that drapes like air, finished with a hand-rolled dupatta edge.',
    details: ['Kota Doria cotton, 3m with churidar & 2.5m dupatta', 'Fine square check weave', 'Unstitched, tailored to your fit'],
    care: ['Gentle hand wash', 'Starch lightly', 'Iron while slightly damp'],
    variants: [
      { colorName: 'Mint Check', hex: '#b8d6c0', images: [suit('suit-kota-1'), suit('suit-kota-2'), suit('suit-kota-3')] },
      { colorName: 'Dusty Pink', hex: '#e0b8b0', images: [suit('suit-kota-pink-1'), suit('suit-kota-pink-2'), suit('suit-kota-pink-3')] },
    ],
    isNew: true,
  },
  {
    id: 'banarasi-wedding-suit-set',
    name: 'Banarasi Suit Set — Wedding Edit',
    category: 'Unstitched Suit Sets',
    fabric: 'Banarasi Silk',
    price: 9800,
    mrp: 12000,
    description:
      'A dense gold-zari Banarasi ensemble — sleeveless kurta, palazzo and heavy dupatta sized to be stitched for the wedding day.',
    details: ['Banarasi silk, 3.5m with palazzo & 2.5m dupatta', 'Dense zari jaal work', 'Unstitched, tailored to your fit'],
    care: ['Dry clean only', 'Air out 24 hours before first wear', 'Store away from moisture'],
    variants: [
      { colorName: 'Gold Jiang', hex: '#c9a96e', images: [suit('suit-ban-1'), suit('suit-ban-2'), suit('suit-ban-3')] },
      { colorName: 'Rose Dust', hex: '#e8c4c4', images: [suit('suit-ban-rose-1'), suit('suit-ban-rose-2'), suit('suit-ban-rose-3')] },
    ],
    isBestSeller: true,
  },
  {
    id: 'ajrakh-cotton-saree',
    name: 'Ajrakh Cotton — Hand Block Print',
    category: 'Sarees',
    subCategory: 'Ajrakh Cotton',
    fabric: 'Ajrakh Block-Printed Cotton',
    price: 2900,
    description:
      'A piece of desert craft — Ajrakh printed in deep indigo, madder red and jet black, hand-blocked layer by layer in the traditional sixteen-step process.',
    details: ['Hand block printed Ajrakh cotton, 5.5m', 'Natural dyes with indigo and madder', 'Slightly crisp, breathable weave'],
    care: ['Dry clean first wash', 'Butterfly print does not run — wash in cold water with salt', 'Dry in shade'],
    variants: [
      { colorName: 'Indigo Ajrakh', hex: '#243b53', images: [saree('ajrakh-1'), saree('ajrakh-2'), saree('ajrakh-3')] },
      { colorName: 'Madder Red', hex: '#8a2c1f', images: [saree('ajrakh-red-1'), saree('ajrakh-red-2'), saree('ajrakh-red-3')] },
    ],
    isNew: true,
  },
  {
    id: 'kota-cotton-saree',
    name: 'Kota Cotton — Plain Doria',
    category: 'Sarees',
    subCategory: 'Kota Cotton',
    fabric: 'Kota Cotton',
    price: 2400,
    description:
      'The featherweight plain-doria Kota — barely-there cotton for hot afternoons, finished with a softly contrasting border.',
    details: ['Genuine Kota cotton, 5.8m', 'Plain doria weave', 'Fine woven border'],
    care: ['Hand wash cold', 'Starch lightly', 'Line dry in shade'],
    variants: [
      { colorName: 'Powder Blue', hex: '#9fc5d8', images: [saree('kotac-blue-1'), saree('kotac-blue-2'), saree('kotac-blue-3')] },
      { colorName: 'Pearl White', hex: '#f4efdf', images: [saree('kotac-white-1'), saree('kotac-white-2'), saree('kotac-white-3')] },
    ],
    isBestSeller: true,
  },
  {
    id: 'kalamkari-saree',
    name: 'Kalamkari — Temple Field',
    category: 'Sarees',
    subCategory: 'Kalamkari',
    fabric: 'Hand-Painted Kalamkari Cotton',
    price: 3600,
    mrp: 4300,
    description:
      'Temple and paisley motifs painted in natural pigment with a bamboo kalam — every stroke a decision, every saree one of a kind.',
    details: ['Kalamkari painted with bamboo kalam', 'Natural earthy pigments, 5.5m', 'Hand-drawn — no two pieces alike'],
    care: ['Dry clean only', 'Do not machine wash', 'Keep away from direct sunlight for long periods'],
    variants: [
      { colorName: 'Earth Chai', hex: '#b08968', images: [saree('kalam-1'), saree('kalam-2'), saree('kalam-3')] },
      { colorName: 'Mud Green', hex: '#6e7f5e', images: [saree('kalam-green-1'), saree('kalam-green-2'), saree('kalam-green-3')] },
    ],
    featured: true,
    isNew: true,
  },
];

export const categories = Array.from(new Set(products.map((p) => p.category)));

export interface Collection {
  category: string;
  title: string;
  tagline: string;
  image: string;
}

export const collections: Collection[] = [
  { category: 'Sarees', title: 'Sarees', tagline: 'Kanjivaram, Banarasi & organza — six yards for every moment', image: imgPool(sareeImages, 'coll-silk', 700, 850) },
  { category: 'Jewellery', title: 'Jewellery', tagline: 'Temple kemp, kundan & antique gold', image: imgPool(jewelleryImages, 'coll-ornaments', 700, 850) },
  { category: 'Bags', title: 'Bags', tagline: 'Handwoven clutches, potlis & totes', image: imgPool(bagImages, 'coll-bags', 700, 850) },
  { category: 'Unstitched Suit Sets', title: 'Suit Sets', tagline: 'Anarkali & straight sets in handloom', image: imgPool(suitImages, 'coll-suits', 700, 850) },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
