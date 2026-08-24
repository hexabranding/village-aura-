import type { Product } from '../data/products';

const API_BASE = '/api';

const getToken = () => localStorage.getItem('reshamAdminToken');

const headers = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: `Request failed (${res.status})` }));
    throw new Error(error.error || `Request failed (${res.status})`);
  }
  return res.json();
};

export interface Category {
  id: string;
  name: string;
  slug: string;
  subcategories: string[];
  image: string;
  description: string;
  active: boolean;
  createdAt: string;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  type: 'fixed' | 'carousel';
  position: 'homepage' | 'sidebar' | 'banner';
  offer: string;
  active: boolean;
  order: number;
  createdAt: string;
}

export interface GalleryImage {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  link: string;
  active: boolean;
  order: number;
  createdAt: string;
}

export interface WatchShopItem {
  id: string;
  name: string;
  price: string;
  poster: string;
  video: string;
  productId: string;
  active: boolean;
  order: number;
  createdAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  category: string;
  rating: number;
  quote: string;
  image: string;
  active: boolean;
  order: number;
  createdAt: string;
}

export interface OrderTracking {
  status: string;
  timestamp: string;
  message: string;
}

export interface Order {
  id: string;
  orderId: string;
  total: number;
  name: string;
  phone: string;
  email?: string;
  payment: string;
  date: string;
  items: { id: string; colorIndex: number; qty: number }[];
  status: 'Pending' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  tracking?: OrderTracking[];
  estimatedDelivery?: string;
  lastUpdated?: string;
  notes?: string;
}

export const api = {
  auth: {
    login: async (username: string, password: string) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await handleResponse(res);
      if (data.token) {
        localStorage.setItem('reshamAdminToken', data.token);
      }
      return data;
    },
    verify: async () => {
      const res = await fetch(`${API_BASE}/auth/verify`, {
        method: 'POST',
        headers: headers(),
      });
      return handleResponse(res);
    },
    logout: () => {
      localStorage.removeItem('reshamAdminToken');
    },
  },

  categories: {
    getAll: async (): Promise<Category[]> => {
      const res = await fetch(`${API_BASE}/categories`);
      return handleResponse(res);
    },
    getOne: async (id: string): Promise<Category> => {
      const res = await fetch(`${API_BASE}/categories/${id}`);
      return handleResponse(res);
    },
    create: async (category: Omit<Category, 'id' | 'createdAt'>) => {
      const res = await fetch(`${API_BASE}/categories`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(category),
      });
      return handleResponse(res);
    },
    update: async (id: string, updates: Partial<Category>) => {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(updates),
      });
      return handleResponse(res);
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/categories/${id}`, {
        method: 'DELETE',
        headers: headers(),
      });
      return handleResponse(res);
    },
  },

  products: {
    getAll: async (): Promise<Product[]> => {
      const res = await fetch(`${API_BASE}/products`);
      return handleResponse(res);
    },
    getOne: async (id: string): Promise<Product> => {
      const res = await fetch(`${API_BASE}/products/${id}`);
      return handleResponse(res);
    },
    create: async (product: Product) => {
      const res = await fetch(`${API_BASE}/products`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(product),
      });
      return handleResponse(res);
    },
    update: async (id: string, updates: Partial<Product>) => {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(updates),
      });
      return handleResponse(res);
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: headers(),
      });
      return handleResponse(res);
    },
  },

  orders: {
    getAll: async (): Promise<Order[]> => {
      const res = await fetch(`${API_BASE}/orders`, { headers: headers() });
      return handleResponse(res);
    },
    getOne: async (id: string): Promise<Order> => {
      const res = await fetch(`${API_BASE}/orders/${id}`, { headers: headers() });
      return handleResponse(res);
    },
    track: async (orderId: string) => {
      const res = await fetch(`${API_BASE}/orders/track/${orderId}`);
      return handleResponse(res);
    },
    create: async (order: { total: number; name: string; phone: string; email?: string; payment: string; items: { id: string; colorIndex: number; qty: number }[]; address?: string; city?: string; state?: string; pincode?: string }) => {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      return handleResponse(res);
    },
    updateStatus: async (id: string, data: { status: string; message?: string; estimatedDelivery?: string; notes?: string }) => {
      const res = await fetch(`${API_BASE}/orders/${id}/status`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(data),
      });
      return handleResponse(res);
    },
    update: async (id: string, updates: Partial<Order>) => {
      const res = await fetch(`${API_BASE}/orders/${id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(updates),
      });
      return handleResponse(res);
    },
  },

  ads: {
    getAll: async (): Promise<Ad[]> => {
      const res = await fetch(`${API_BASE}/ads`, { headers: headers() });
      return handleResponse(res);
    },
    getActive: async (): Promise<Ad[]> => {
      const res = await fetch(`${API_BASE}/ads/active`);
      return handleResponse(res);
    },
    getActiveByType: async (type: string): Promise<Ad[]> => {
      const res = await fetch(`${API_BASE}/ads/active/${type}`);
      return handleResponse(res);
    },
    create: async (ad: Omit<Ad, 'id' | 'createdAt'>) => {
      const res = await fetch(`${API_BASE}/ads`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(ad),
      });
      return handleResponse(res);
    },
    update: async (id: string, updates: Partial<Ad>) => {
      const res = await fetch(`${API_BASE}/ads/${id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(updates),
      });
      return handleResponse(res);
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/ads/${id}`, {
        method: 'DELETE',
        headers: headers(),
      });
      return handleResponse(res);
    },
  },

  dashboard: {
    getStats: async () => {
      const res = await fetch(`${API_BASE}/dashboard/stats`, { headers: headers() });
      return handleResponse(res);
    },
    getSales: async (category?: string) => {
      const url = category ? `${API_BASE}/dashboard/sales?category=${category}` : `${API_BASE}/dashboard/sales`;
      const res = await fetch(url, { headers: headers() });
      return handleResponse(res);
    },
  },

  upload: {
    images: async (files: FileList): Promise<string[]> => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('images', file);
      });
      const token = getToken();
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });
      const data = await handleResponse(res);
      return data.urls;
    },
  },

  gallery: {
    getAll: async (): Promise<GalleryImage[]> => {
      const res = await fetch(`${API_BASE}/gallery`, { headers: headers() });
      return handleResponse(res);
    },
    getActive: async (): Promise<GalleryImage[]> => {
      const res = await fetch(`${API_BASE}/gallery/active`);
      return handleResponse(res);
    },
    create: async (image: Omit<GalleryImage, 'id' | 'createdAt'>) => {
      const res = await fetch(`${API_BASE}/gallery`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(image),
      });
      return handleResponse(res);
    },
    update: async (id: string, updates: Partial<GalleryImage>) => {
      const res = await fetch(`${API_BASE}/gallery/${id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(updates),
      });
      return handleResponse(res);
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/gallery/${id}`, {
        method: 'DELETE',
        headers: headers(),
      });
      return handleResponse(res);
    },
  },

  watchshop: {
    getAll: async (): Promise<WatchShopItem[]> => {
      const res = await fetch(`${API_BASE}/watchshop`, { headers: headers() });
      return handleResponse(res);
    },
    getActive: async (): Promise<WatchShopItem[]> => {
      const res = await fetch(`${API_BASE}/watchshop/active`);
      return handleResponse(res);
    },
    create: async (item: Omit<WatchShopItem, 'id' | 'createdAt'>) => {
      const res = await fetch(`${API_BASE}/watchshop`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(item),
      });
      return handleResponse(res);
    },
    update: async (id: string, updates: Partial<WatchShopItem>) => {
      const res = await fetch(`${API_BASE}/watchshop/${id}`, {
        method: 'PUT',
        headers: headers(),
        body: JSON.stringify(updates),
      });
      return handleResponse(res);
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/watchshop/${id}`, {
        method: 'DELETE',
        headers: headers(),
      });
      return handleResponse(res);
    },
  },

  testimonials: {
    getAll: async (): Promise<Testimonial[]> => {
      const res = await fetch(`${API_BASE}/testimonials`, { headers: headers() });
      return handleResponse(res);
    },
    getActive: async (): Promise<Testimonial[]> => {
      const res = await fetch(`${API_BASE}/testimonials/active`);
      return handleResponse(res);
    },
    create: async (item: Omit<Testimonial, 'id' | 'createdAt'>) => {
      const res = await fetch(`${API_BASE}/testimonials`, { method: 'POST', headers: headers(), body: JSON.stringify(item) });
      return handleResponse(res);
    },
    update: async (id: string, updates: Partial<Testimonial>) => {
      const res = await fetch(`${API_BASE}/testimonials/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(updates) });
      return handleResponse(res);
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/testimonials/${id}`, { method: 'DELETE', headers: headers() });
      return handleResponse(res);
    },
  },

  weaverStory: {
    get: async () => {
      const res = await fetch(`${API_BASE}/weaver-story`);
      return handleResponse(res);
    },
    update: async (data: any) => {
      const res = await fetch(`${API_BASE}/weaver-story`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) });
      return handleResponse(res);
    },
  },

  curatedEdits: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/curated-edits/all`, { headers: headers() });
      const data = await res.json().catch(() => []);
      if (res.ok) return data;
      const r2 = await fetch(`${API_BASE}/curated-edits/active`);
      return handleResponse(r2);
    },
    getActive: async () => {
      const res = await fetch(`${API_BASE}/curated-edits/active`);
      return handleResponse(res);
    },
    create: async (item: any) => {
      const res = await fetch(`${API_BASE}/curated-edits`, { method: 'POST', headers: headers(), body: JSON.stringify(item) });
      return handleResponse(res);
    },
    update: async (id: string, updates: any) => {
      const res = await fetch(`${API_BASE}/curated-edits/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(updates) });
      return handleResponse(res);
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/curated-edits/${id}`, { method: 'DELETE', headers: headers() });
      return handleResponse(res);
    },
  },

  heroSlides: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/hero-slides/all`, { headers: headers() });
      const data = await res.json().catch(() => []);
      if (res.ok) return data;
      const r2 = await fetch(`${API_BASE}/hero-slides/active`);
      return handleResponse(r2);
    },
    getActive: async () => {
      const res = await fetch(`${API_BASE}/hero-slides/active`);
      return handleResponse(res);
    },
    create: async (item: any) => {
      const res = await fetch(`${API_BASE}/hero-slides`, { method: 'POST', headers: headers(), body: JSON.stringify(item) });
      return handleResponse(res);
    },
    update: async (id: string, updates: any) => {
      const res = await fetch(`${API_BASE}/hero-slides/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(updates) });
      return handleResponse(res);
    },
    delete: async (id: string) => {
      const res = await fetch(`${API_BASE}/hero-slides/${id}`, { method: 'DELETE', headers: headers() });
      return handleResponse(res);
    },
  },
};
