# Resham Store - Backend Setup

## Quick Start

### Step 1: Seed the Database (First Time Only)
Double-click `seed.bat` or run:
```
cd backend
node seed.js
```
This creates:
- Admin user: **admin / admin123**
- 4 categories (Sarees, Jewellery, Bags, Suit Sets)
- 5 sample products

### Step 2: Start the Backend
Double-click `start.bat` or run:
```
cd backend
npm run dev
```
Server runs at `http://localhost:5000`

### Step 3: Start the Frontend
In a separate terminal:
```
npm run dev
```
Frontend runs at `http://localhost:5173`

### Step 4: Login to Admin Panel
1. Go to `http://localhost:5173/admin/login`
2. Username: `admin`
3. Password: `admin123`

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Login, returns JWT |
| POST | `/api/auth/verify` | Yes | Verify token |
| GET | `/api/products` | No | List all products |
| POST | `/api/products` | Yes | Create product |
| PUT | `/api/products/:id` | Yes | Update product |
| DELETE | `/api/products/:id` | Yes | Delete product |
| GET | `/api/categories` | No | List all categories |
| POST | `/api/categories` | Yes | Create category |
| PUT | `/api/categories/:id` | Yes | Update category |
| DELETE | `/api/categories/:id` | Yes | Delete category |
| GET | `/api/orders` | Yes | List all orders |
| POST | `/api/orders` | No | Create order |
| PUT | `/api/orders/:id/status` | Yes | Update order status |
| GET | `/api/ads` | Yes | List all ads |
| GET | `/api/ads/active` | No | List active ads |
| POST | `/api/ads` | Yes | Create ad |
| PUT | `/api/ads/:id` | Yes | Update ad |
| DELETE | `/api/ads/:id` | Yes | Delete ad |
| GET | `/api/dashboard/stats` | Yes | Dashboard statistics |
| GET | `/api/dashboard/sales` | Yes | Sales analytics |

## Category & Subcategory Management

Categories are managed from Admin Panel > Categories.

Each category has:
- **Name** (required) - e.g., "Sarees"
- **Slug** (auto-generated) - e.g., "sarees"
- **Subcategories** - comma-separated list, e.g., "Kanchipuram Silk, Banarasi Silk"
- **Description** - short text
- **Image URL** - category banner image
- **Active** toggle - show/hide on store

## Troubleshooting

### "Invalid username or password"
Run `node seed.js` first to create the admin user.

### Backend won't start
Make sure MongoDB is running:
```
net start MongoDB
```

### Port already in use
Change PORT in `.env` file, e.g., `PORT=5001`
