import { products as localProducts } from '../data/products';
import type { Product } from '../data/products';
import { api } from './api';

let allProducts: Product[] = [...localProducts];
let loaded = false;
let listeners: (() => void)[] = [];

export const subscribeProducts = (fn: () => void) => {
  listeners.push(fn);
  return () => { listeners = listeners.filter((l) => l !== fn); };
};

export const getAllProducts = () => allProducts;

export const getProduct = (id: string): Product | undefined => {
  return allProducts.find((p) => p.id === id);
};

export const loadProducts = async () => {
  if (loaded) return;
  try {
    const [apiProducts, cats] = await Promise.all([api.products.getAll(), api.categories.getAll()]);
    if (apiProducts.length > 0) {
      const validNames = new Set(cats.map((c) => c.name));
      const validSubMap: Record<string, boolean> = {};
      cats.forEach((c) => {
        c.subcategories.forEach((sub) => {
          validSubMap[`${c.name}::${sub}`] = true;
        });
      });
      const merged = localProducts.map((lp) => {
        const apiP = apiProducts.find((p) => p.id === lp.id);
        if (apiP && apiP.variants.some((v) => v.images.length > 0)) return apiP;
        return lp;
      });
      const newProducts = apiProducts.filter((p) => !localProducts.some((lp) => lp.id === p.id));
      const all = [...newProducts, ...merged];
      allProducts = all.filter((p) => {
        if (!validNames.has(p.category)) return false;
        if (p.subCategory && !validSubMap[`${p.category}::${p.subCategory}`]) return false;
        return true;
      });
    }
  } catch {
    // ignore
  }
  loaded = true;
  listeners.forEach((l) => l());
};
