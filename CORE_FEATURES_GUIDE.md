# 🎯 XPIANO CORE FEATURES - IMPLEMENTATION GUIDE

## ✅ Đã Hoàn Thành (Phase 1)

### 1. Piano Detail Page + Favorites ⭐
- ✅ Piano Detail Page with full info
- ✅ Favorite/Unfavorite button (thả tim)
- ✅ Beautiful UI with image, rating, features
- ✅ Buy/Rent modal integration
- ✅ Price calculation and display
- ✅ Click ProductCard → Navigate to detail

### 2. Buy & Rent System 💰
- ✅ Buy Piano functionality
- ✅ Rent Piano with date selection
- ✅ Price calculation (with discounts for long-term rent)
- ✅ Order creation
- ✅ Order status tracking (pending, approved, rejected)

### 3. Database Schema 🗄️
- ✅ `favorites` table
- ✅ `orders` table (buy + rent)
- ✅ `rentals` table (active rentals)
- ✅ RLS Policies
- ✅ Triggers (auto-create rental, auto-update timestamps)
- ✅ Helper views

### 4. Frontend Services 🔧
- ✅ `favoriteService.ts` - Favorite management
- ✅ `orderService.ts` - Buy/Rent orders
- ✅ Price calculation logic

---

## 🚀 Setup Instructions

### STEP 1: Run Database Migration

**QUAN TRỌNG:** Chạy SQL script để tạo tables!

```bash
# Mở Supabase SQL Editor
https://supabase.com/dashboard/project/pjgjusdmzxrhgiptfvbg/sql

# Copy content từ:
XpianoServer/sql/core-features-schema.sql

# Paste và Run
```

**Tables sẽ được tạo:**
- `favorites` - Danh sách yêu thích
- `orders` - Đơn hàng (mua/mượn)
- `rentals` - Đàn đang được mượn

### STEP 2: Verify Setup

```sql
-- Check tables created
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('favorites', 'orders', 'rentals');

-- Check RLS enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('favorites', 'orders', 'rentals');
```

### STEP 3: Test Features

1. **Start Dev Server:**
```bash
cd d:\Xproject\Xpiano
npm run dev
```

2. **Test Piano Detail:**
   - Mở http://localhost:5173
   - Click vào bất kỳ ProductCard nào
   - ✅ Xem detail page
   - ✅ Click nút ❤️ để thêm favorite
   - ✅ Click "Mượn đàn" hoặc "Mua đàn"

3. **Test Order Flow:**
   - Login trước (cần có account)
   - Chọn piano → Click "Mua đàn"
   - ✅ Giá hiển thị đúng
   - ✅ Xác nhận đặt hàng
   - ✅ Redirect về profile (sẽ implement tiếp)

---

## 📊 Database Schema Details

### Favorites Table
```sql
CREATE TABLE favorites (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  piano_id INTEGER REFERENCES pianos(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, piano_id)
);
```

**RLS Policies:**
- Users can only view/add/remove own favorites
- Admins can view all

### Orders Table
```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id UUID,
  piano_id INTEGER,
  type TEXT ('buy' | 'rent'),
  status TEXT ('pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'),
  total_price INTEGER,
  rental_start_date DATE,
  rental_end_date DATE,
  rental_days INTEGER,
  admin_notes TEXT,
  approved_by UUID,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Status Flow:**
```
pending → (Admin action) → approved/rejected
pending → (User cancel) → cancelled
approved → (Complete rental) → completed
```

### Rentals Table
```sql
CREATE TABLE rentals (
  id SERIAL PRIMARY KEY,
  order_id INTEGER,
  user_id UUID,
  piano_id INTEGER,
  start_date DATE,
  end_date DATE,
  days INTEGER,
  status TEXT ('active' | 'completed' | 'cancelled' | 'overdue'),
  returned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Auto-created:** When order status changes to 'approved' (for rent type)

---

## 💰 Pricing Logic

### Buy Price
```typescript
buyPrice = piano.price_per_hour * 1000
```

**Example:**
- Piano: 250,000 VND/hour
- Buy Price: 250,000,000 VND

### Rent Price (with Discounts!)
```typescript
basePrice = price_per_hour * 8 hours/day * days

// Discounts:
if (days >= 8) → -15% discount
else if (days >= 3) → -10% discount
else → no discount
```

**Example:**
- Piano: 250,000 VND/hour
- Rent 1 day: 250,000 * 8 = 2,000,000 VND
- Rent 5 days: 2,000,000 * 5 * 0.9 = 9,000,000 VND (10% off)
- Rent 10 days: 2,000,000 * 10 * 0.85 = 17,000,000 VND (15% off)

---

## 🎨 UI/UX Features

### Piano Detail Page
- **Beautiful Layout:** 2-column grid (image + info)
- **Favorite Button:** Heart icon in corner
- **Rating Display:** Star rating với reviews count
- **Features List:** Bullet points với icons
- **Pricing Card:** Highlighted giá thuê và giá mua
- **Action Buttons:** "Mượn đàn" và "Mua đàn"

### Buy/Rent Modal
- **Dynamic Form:** Show date pickers for rent
- **Price Preview:** Real-time tính toán
- **Validation:** Check dates, minimum 1 day
- **Success State:** Checkmark animation
- **Redirect:** Auto-redirect to profile after 2s

### ProductCard (Updated)
- **Clickable:** Cursor pointer, navigate on click
- **Hover Effect:** Enhanced shadow
- **Responsive:** Works on all screen sizes

---

## 🔜 Next Steps (Phase 2)

### 3. User Profile Page (Đang phát triển)
- [ ] Edit profile (name, avatar)
- [ ] Change password
- [ ] View favorite pianos
- [ ] Order history
- [ ] Active rentals

### 4. Admin Dashboard (Đang phát triển)
- [ ] CRUD Pianos (Create, Read, Update, Delete)
- [ ] Manage Orders (Approve/Reject)
- [ ] Manage Users (View, Edit roles, Ban)
- [ ] Statistics Dashboard

---

## 📝 API Usage Examples

### Favorite Service
```typescript
import favoriteService from './lib/favoriteService';

// Check if favorited
const isFav = await favoriteService.isFavorited(pianoId);

// Toggle favorite
const newStatus = await favoriteService.toggleFavorite(pianoId);

// Get all favorites
const favorites = await favoriteService.getMyFavorites();
```

### Order Service
```typescript
import orderService from './lib/orderService';

// Create buy order
await orderService.createOrder({
  piano_id: 1,
  type: 'buy',
});

// Create rent order
await orderService.createOrder({
  piano_id: 1,
  type: 'rent',
  rental_start_date: '2026-02-10',
  rental_end_date: '2026-02-15',
});

// Get my orders
const orders = await orderService.getMyOrders();

// Admin: Approve order
await orderService.approveOrder(orderId, 'Approved!');
```

---

## 🐛 Troubleshooting

### "Table 'favorites' does not exist"
```
→ Run SQL script: core-features-schema.sql
```

### "RLS policy violation"
```
→ Check: User is logged in?
→ Check: RLS policies created?
→ Temporarily disable RLS to test:
   ALTER TABLE favorites DISABLE ROW LEVEL SECURITY;
```

### "Cannot add favorite"
```
→ Check: User authenticated?
→ Check: Piano ID exists?
→ Check: Not already favorited? (Unique constraint)
```

### "Order creation failed"
```
→ Check: Piano exists?
→ Check: Dates valid (for rent)?
→ Check: Start date < End date?
```

---

## 📚 Files Structure

```
Xpiano/
├── lib/
│   ├── favoriteService.ts    ✅ NEW
│   ├── orderService.ts        ✅ NEW
│   ├── pianoService.ts
│   ├── authService.ts
│   └── supabase.ts
├── pages/
│   ├── PianoDetailPage.tsx    ✅ NEW
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── ForgotPasswordPage.tsx
├── components/
│   ├── ProductCard.tsx        🔄 UPDATED (clickable)
│   ├── Header.tsx
│   ├── Marketplace.tsx
│   ├── Hero.tsx
│   └── Footer.tsx
└── App.tsx                    🔄 UPDATED (add /piano/:id route)

XpianoServer/
└── sql/
    └── core-features-schema.sql ✅ NEW
```

---

## ✨ Key Features Highlights

### 1. Smart Pricing
- ✅ Auto-calculate buy price (1000x hourly)
- ✅ Auto-calculate rent price (8 hours/day)
- ✅ Discount for long-term rental (3+ days)

### 2. Real-time Sync
- ✅ Favorites sync across devices
- ✅ Orders update in real-time
- ✅ Rental status tracking

### 3. Security
- ✅ RLS policies enforce data privacy
- ✅ Users can only see own orders
- ✅ Admins have full access

### 4. UX Enhancements
- ✅ Success animations
- ✅ Loading states
- ✅ Error handling
- ✅ Form validation
- ✅ Price preview
- ✅ Discount indicators

---

**Status:** ✅ Phase 1 Complete - Piano Detail + Buy/Rent

**Next:** User Profile Page & Admin Dashboard

**Date:** 2026-02-07
