import type { Product } from '../data/products';

const API_BASE = 'http://localhost:5000/api';

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
    const error = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
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
      const res = await fetch(`${API_BASE}/ads`);
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
};
