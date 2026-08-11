export interface ProductVariant {
  colorName: string;
  hex: string;
  images: string[];
}

export interface Product {
  id: string;
  name: string;
  category: string;
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
  'https://images.pexels.com/photos/10483857/pexels-photo-10483857.jpeg',
  'https://images.pexels.com/photos/28428053/pexels-photo-28428053.jpeg',
  'https://images.pexels.com/photos/37054317/pexels-photo-37054317.jpeg',
  'https://images.pexels.com/photos/37054321/pexels-photo-37054321.jpeg',
  'https://images.pexels.com/photos/30244535/pexels-photo-30244535.jpeg',
  'https://images.pexels.com/photos/37054325/pexels-photo-37054325.jpeg',
  'https://images.pexels.com/photos/28428060/pexels-photo-28428060.jpeg',
  'https://images.pexels.com/photos/19567892/pexels-photo-19567892.jpeg',
  'https://images.pexels.com/photos/31660114/pexels-photo-31660114.jpeg',
  'https://images.pexels.com/photos/27155546/pexels-photo-27155546.jpeg',
  'https://images.pexels.com/photos/30677843/pexels-photo-30677843.jpeg',
  'https://images.pexels.com/photos/27103969/pexels-photo-27103969.jpeg',
];

const img = (seed: string, w = 900, h = 1150) => {
  const index = Math.abs(seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % sareeImages.length;
  return `${sareeImages[index]}?w=${w}&h=${h}&fit=crop`;
};

export const products: Product[] = [
  {
    id: 'kanjivaram-maroon',
    name: 'Kanjivaram Silk — Temple Border',
    category: 'Silk Sarees',
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
      { colorName: 'Deep Maroon', hex: '#6b1e23', images: [img('kanj-maroon-1'), img('kanj-maroon-2'), img('kanj-maroon-3'), img('kanj-maroon-4')] },
      { colorName: 'Emerald Teal', hex: '#1f4741', images: [img('kanj-teal-1'), img('kanj-teal-2'), img('kanj-teal-3')] },
    ],
    featured: true,
    isBestSeller: true,
  },
  {
    id: 'banarasi-ivory-gold',
    name: 'Banarasi Zari Weave',
    category: 'Bridal',
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
      { colorName: 'Ivory Gold', hex: '#efe4d0', images: [img('ban-ivory-1'), img('ban-ivory-2'), img('ban-ivory-3'), img('ban-ivory-4')] },
      { colorName: 'Rose Dust', hex: '#e8c4c4', images: [img('ban-rose-1'), img('ban-rose-2'), img('ban-rose-3')] },
    ],
    featured: true,
    isNew: true,
  },
  {
    id: 'chanderi-cotton-teal',
    name: 'Chanderi Cotton — Everyday Weave',
    category: 'Cotton Sarees',
    fabric: 'Chanderi Cotton-Silk',
    price: 4200,
    description:
      'Light as a Tuesday afternoon. A Chanderi cotton-silk blend with a thin gold line border, made for the days you still want to feel dressed.',
    details: ['Chanderi cotton-silk blend, 5.8m', 'Lightweight, breathable weave', 'Thin zari line border'],
    care: ['Gentle hand wash separately', 'Line dry in shade', 'Iron on medium heat'],
    variants: [
      { colorName: 'Deep Teal', hex: '#1f4741', images: [img('chan-teal-1'), img('chan-teal-2'), img('chan-teal-3')] },
      { colorName: 'Sun Ochre', hex: '#c08a3e', images: [img('chan-ochre-1'), img('chan-ochre-2'), img('chan-ochre-3')] },
    ],
    featured: true,
    isBestSeller: true,
  },
  {
    id: 'tant-white-red',
    name: 'Tant Cotton — Red Paar',
    category: 'Handwoven',
    fabric: 'Bengal Tant Cotton',
    price: 3100,
    description:
      'A classic Bengal tant, crisp white body with a red paar border — the saree that shows up in every good memory from home.',
    details: ['Traditional Bengal handloom tant cotton, 5.5m', 'Crisp starch finish', 'Red woven border and pallu'],
    care: ['Hand wash cold', 'Starch lightly after wash', 'Iron while slightly damp'],
    variants: [
      { colorName: 'Classic Red', hex: '#6b1e23', images: [img('tant-red-1'), img('tant-red-2'), img('tant-red-3')] },
    ],
    featured: true,
  },
  {
    id: 'jamdani-blue',
    name: 'Jamdani — Hand-Loomed Motif',
    category: 'Handwoven',
    fabric: 'Jamdani Muslin',
    price: 9800,
    mrp: 12500,
    description:
      'Motifs laid in by hand during the weave itself, not printed after — the defining trait of a true Jamdani. Soft, sheer, unmistakably handmade.',
    details: ['Hand-loomed Jamdani muslin, 5.8m', 'Motifs woven in during construction', 'Sheer, soft drape'],
    care: ['Dry clean recommended', 'If hand washing, use cold water only', 'Never wring — press dry'],
    variants: [
      { colorName: 'Indigo', hex: '#243b53', images: [img('jam-blue-1'), img('jam-blue-2'), img('jam-blue-3')] },
      { colorName: 'Ivory', hex: '#f7f1e6', images: [img('jam-ivory-1'), img('jam-ivory-2'), img('jam-ivory-3')] },
    ],
    isNew: true,
  },
  {
    id: 'organza-blush',
    name: 'Organza Silk — Floral Buti',
    category: 'Silk Sarees',
    fabric: 'Pure Organza Silk',
    price: 8600,
    description:
      'Sheer organza scattered with a fine floral buti, finished with a delicate scalloped gold border. Light enough for a summer wedding, formal enough for one too.',
    details: ['Pure silk organza, 5.7m', 'Scalloped zari border', 'Fine all-over floral buti weave'],
    care: ['Dry clean only', 'Store flat or loosely folded', 'Keep away from sharp jewellery when storing'],
    variants: [
      { colorName: 'Blush Rose', hex: '#e8c4c4', images: [img('org-blush-1'), img('org-blush-2'), img('org-blush-3')] },
      { colorName: 'Gold Ochre', hex: '#d9b678', images: [img('org-gold-1'), img('org-gold-2'), img('org-gold-3')] },
    ],
    isBestSeller: true,
  },
  {
    id: 'temple-kemp-necklace',
    name: 'Temple Kemp Necklace Set',
    category: 'Ornaments',
    fabric: 'Gold-Polish Brass, Kemp Stones',
    price: 6400,
    mrp: 8200,
    description:
      'A temple-work necklace set in kemp red and green, the pairing traditionally worn with silk. Comes with matching jhumka earrings.',
    details: ['Gold-polish brass base', 'Hand-set kemp stone work', 'Includes matching jhumka earrings', 'Adjustable thread closure'],
    care: ['Keep away from perfume and water', 'Store in a cloth pouch, away from air', 'Polish gently with a soft dry cloth'],
    variants: [
      { colorName: 'Kemp Red-Green', hex: '#8a2c1f', images: [img('orn-temple-1'), img('orn-temple-2'), img('orn-temple-3')] },
    ],
    featured: true,
  },
  {
    id: 'jhumka-gold-polish',
    name: 'Gold-Polish Jhumka Earrings',
    category: 'Ornaments',
    fabric: 'Gold-Polish Brass, Pearl Drops',
    price: 1850,
    description:
      'The everyday jhumka — a bell-shaped drop with fine filigree work and a row of pearl beads, light enough to wear from morning to a dinner out.',
    details: ['Gold-polish brass filigree', 'Freshwater pearl drops', 'Push-back closure'],
    care: ['Remove before bathing or sleeping', 'Store flat to protect the shape', 'Avoid contact with perfume'],
    variants: [
      { colorName: 'Antique Gold', hex: '#c08a3e', images: [img('orn-jhumka-1'), img('orn-jhumka-2'), img('orn-jhumka-3')] },
      { colorName: 'Antique Silver', hex: '#b9b4ab', images: [img('orn-jhumka-s1'), img('orn-jhumka-s2'), img('orn-jhumka-s3')] },
    ],
  },
  {
    id: 'kundan-maang-tikka',
    name: 'Kundan Maang Tikka',
    category: 'Ornaments',
    fabric: 'Kundan & Polki Stones',
    price: 2950,
    description:
      'A single kundan pendant on a fine gold-tone chain, sitting right at the parting — the piece that finishes a bridal look.',
    details: ['Kundan and polki stone setting', 'Adjustable hook chain', 'Lightweight brass base'],
    care: ['Handle the stones gently — avoid pulling at the setting', 'Store separately to prevent scratching', 'Keep dry'],
    variants: [
      { colorName: 'Ivory Kundan', hex: '#efe4d0', images: [img('orn-tikka-1'), img('orn-tikka-2'), img('orn-tikka-3')] },
    ],
    isNew: true,
  },
  {
    id: 'antique-bangles-set',
    name: 'Antique Matte Bangles — Set of 6',
    category: 'Ornaments',
    fabric: 'Antique Matte Gold Finish',
    price: 3200,
    mrp: 3900,
    description:
      'Six bangles in a matte antique finish with a fine floral etch, sized to stack — the sound they make is half the point.',
    details: ['Set of 6 bangles', 'Antique matte gold finish', 'Etched floral pattern', 'Available in three size ranges'],
    care: ['Wipe with a dry cloth after wear', 'Avoid water and lotion contact', 'Store in individual pouches to prevent scratching'],
    variants: [
      { colorName: 'Antique Gold', hex: '#c08a3e', images: [img('orn-bangle-1'), img('orn-bangle-2'), img('orn-bangle-3')] },
    ],
    isBestSeller: true,
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
  { category: 'Silk Sarees', title: 'Silk Sarees', tagline: 'Kanjivaram & organza, woven for occasion', image: img('coll-silk', 700, 850) },
  { category: 'Bridal', title: 'Bridal Edit', tagline: 'Banarasi brocade for the big day', image: img('coll-bridal', 700, 850) },
  { category: 'Handwoven', title: 'Handwoven', tagline: 'Jamdani & tant, motifs laid in by hand', image: img('coll-handwoven', 700, 850) },
  { category: 'Cotton Sarees', title: 'Cotton Sarees', tagline: 'Chanderi weaves for every day', image: img('coll-cotton', 700, 850) },
  { category: 'Ornaments', title: 'Ornaments', tagline: 'Temple kemp, kundan & antique gold', image: img('coll-ornaments', 700, 850) },
];

export const getProduct = (id: string) => products.find((p) => p.id === id);
