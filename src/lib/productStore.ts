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
    const apiProducts = await api.products.getAll();
    if (apiProducts.length > 0) {
      const merged = localProducts.map((lp) => {
        const apiP = apiProducts.find((p) => p.id === lp.id);
        if (apiP && apiP.variants.some((v) => v.images.length > 0)) return apiP;
        return lp;
      });
      const newProducts = apiProducts.filter((p) => !localProducts.some((lp) => lp.id === p.id));
      allProducts = [...newProducts, ...merged];
    }
  } catch {
    // ignore
  }
  loaded = true;
  listeners.forEach((l) => l());
};
