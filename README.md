# 🎹 Xpiano Frontend - Supabase Integration ✅

## 🔄 MIGRATION HOÀN TẤT 

**Tính năng X (Auth + Pianos) đã ĐỒNG BỘ 100% với Mobile Flutter!**

---

## ✅ Features Migrated to Supabase

### 1. **Authentication** (Shared với Mobile)
- ✅ Login/Register với Supabase Auth
- ✅ Role metadata (user/teacher/admin)
- ✅ Forgot Password với email
- ✅ Real-time auth state changes
- ✅ Auto profile sync
- ✅ **ĐỒNG BỘ với Flutter App**

### 2. **Piano CRUD** (Shared với Mobile)
- ✅ Fetch pianos từ Supabase Database
- ✅ Category filtering
- ✅ Admin CRUD với RLS
- ✅ Real-time updates
- ✅ **ĐỒNG BỘ với Flutter App**

### 3. **User Profiles** (Shared với Mobile)
- ✅ Auto-create via Trigger
- ✅ Role management
- ✅ **ĐỒNG BỘ với Flutter App**

---

## 🏗️ Hybrid Architecture

```
┌──────────────────────────────────────────────┐
│         SUPABASE (Shared Features)           │
│  ✅ Auth                                     │
│  ✅ Pianos CRUD                              │
│  ✅ Profiles                                 │
│  ✅ Realtime                                 │
├─────────────┬────────────────────────────────┤
│ Web (React) │ Mobile (Flutter)               │
│ + WebRTC    │ + Video Social                 │
│ + Admin     │ + Teacher Schedules            │
└─────────────┴────────────────────────────────┘
       ↓
┌──────────────────────────────────────────────┐
│    EXPRESS BACKEND (Web-only features)       │
│  🔧 WebRTC Signaling (will be implemented)  │
│  🔧 Payment Processing (will be implemented) │
│  🔧 Admin Analytics                          │
└──────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Install Dependencies (đã xong)
```bash
npm install @supabase/supabase-js axios react-router-dom
```

### 2. Environment Variables
```env
# .env.local
VITE_API_URL=http://localhost:3000/api              # Express (WebRTC, etc)
VITE_SUPABASE_URL=https://pjgjusdmzxrhgiptfvbg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3. Start Development
```bash
# Frontend
npm run dev
# Running at: http://localhost:5173

# Backend (optional - for WebRTC/Payment later)
cd ../XpianoServer
npm run dev
# Running at: http://localhost:3000
```

---

## 📁 Project Structure

```
Xpiano/
├── lib/
│   ├── supabase.ts              ✅ Supabase client
│   ├── authService.ts           ✅ Supabase Auth
│   └── pianoService.ts          ✅ Supabase Database
├── contexts/
│   └── AuthContext.tsx          ✅ Supabase real-time
├── pages/
│   ├── LoginPage.tsx            ✅ Uses Supabase
│   ├── RegisterPage.tsx         ✅ Uses Supabase
│   └── ForgotPasswordPage.tsx   ✅ Uses Supabase
├── components/
│   ├── Header.tsx               ✅ Shows Supabase user
│   ├── Marketplace.tsx          ✅ Loads from Supabase
│   ├── ProductCard.tsx
│   ├── Hero.tsx
│   └── Footer.tsx
└── SUPABASE_MIGRATION.md        📚 Full documentation
```

---

## 🔐 Authentication Flow

### Login (Đồng bộ Web ↔ Mobile):
```typescript
// Web hoặc Mobile đều dùng
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
// → Session stored in Supabase
// → Profile synced from profiles table
// → ✅ ĐỒNG BỘ!
```

### Register (Đồng bộ Web ↔ Mobile):
```typescript
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      full_name: 'Nguyen Van A',
      phone: '0912345678',
      role: 'user' // hoặc 'teacher'
    }
  }
})
// → Trigger auto-creates profile
// → ✅ ĐỒNG BỘ!
```

---

## 📡 API Integration

### Supabase (Shared Features):
```typescript
// Auth
import authService from './lib/authService';
await authService.login({ email, password });
await authService.register({ email, password, full_name, role });

// Pianos
import pianoService from './lib/pianoService';
const pianos = await pianoService.getAll();
const piano = await pianoService.getById(1);
```

### Express Backend (Web-only):
```typescript
// WebRTC, Payment, etc (will be implemented later)
// Still available at http://localhost:3000/api/*
```

---

## 🔄 Real-time Sync (Bonus!)

```typescript
// Auto-update khi Mobile thêm piano
useEffect(() => {
  const channel = pianoService.subscribeToChanges((payload) => {
    console.log('Piano changed:', payload);
    loadPianos(); // Auto-refresh
  });

  return () => channel.unsubscribe();
}, []);
```

**Kết quả:**
- Mobile thêm piano → Web tự động hiển thị! 🚀
- Web thêm piano → Mobile tự động hiển thị! 🚀

---

## 🧪 Testing

### Test với Mobile Flutter:
```
1. Register trên Web
2. ✅ Login trên Mobile với cùng credentials
3. View pianos trên Mobile
4. ✅ Thấy cùng danh sách với Web
5. Add piano trên Web (admin)
6. ✅ Mobile auto-update realtime!
```

### Test Accounts:
```
Tạo mới qua /register hoặc dùng Supabase Dashboard
```

---

## ⚠️ Important Setup

### 1. Supabase Database Setup
```bash
# Chạy trong Supabase SQL Editor
# File: ../XpianoServer/supabase-setup.sql

# Tạo:
- profiles table
- pianos table
- RLS policies
- Triggers
```

### 2. RLS Policies
```sql
-- PHẢI enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pianos ENABLE ROW LEVEL SECURITY;

-- Policies đã có trong supabase-setup.sql
```

---

## 📚 Documentation

- **Full Migration Guide**: `SUPABASE_MIGRATION.md`
- **Backend Setup**: `../XpianoServer/MIGRATION_TO_SUPABASE.md`
- **SQL Setup**: `../XpianoServer/supabase-setup.sql`

---

## 🎯 Roadmap

### ✅ Done (Migration Phase 1):
- ✅ Auth migration to Supabase
- ✅ Pianos migration to Supabase
- ✅ Real-time sync with Mobile
- ✅ RLS policies

### 🔜 Next (Phase 2):
- [ ] Bookings (mượn đàn) → Supabase
- [ ] Orders (mua đàn) → Supabase
- [ ] Courses → Supabase
- [ ] WebRTC signaling → Express Backend

### 🚀 Future (Phase 3):
- [ ] Payment integration → Express Backend
- [ ] Admin dashboard → Web
- [ ] Video social → Mobile (Supabase Storage)
- [ ] Teacher schedules → Mobile

---

## 🐛 Troubleshooting

### Auth không đồng bộ?
```
✅ Check: VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY
✅ Check: Trigger đã chạy chưa (profiles table)
✅ Check: Session trong Supabase Dashboard → Auth
```

### Pianos không load?
```
✅ Check: RLS policies enabled
✅ Check: Data trong Supabase Dashboard → Table Editor
✅ Check: Network tab (Supabase API calls)
```

### Mobile không sync?
```
✅ Check: Mobile dùng CÙNG Supabase URL/Key
✅ Check: Profiles table có data
✅ Check: RLS policies allow read
```

---

## 📊 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend (Shared)**: **Supabase** (Auth + PostgreSQL + Realtime)
- **Backend (Web-only)**: Express.js (WebRTC, Payment)
- **Routing**: React Router DOM v6
- **State**: React Context API + Supabase Real-time
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

---

## 🎉 Results

### Before Migration:
```
❌ Web → Express Auth → PostgreSQL
❌ Mobile → Supabase Auth → PostgreSQL
❌ KHÔNG đồng bộ
❌ 2 systems riêng biệt
```

### After Migration:
```
✅ Web → Supabase Auth → PostgreSQL
✅ Mobile → Supabase Auth → PostgreSQL
✅ ĐỒNG BỘ 100%
✅ Single source of truth
✅ Realtime sync
```

---

**Status:** ✅ **PRODUCTION READY - Sync với Mobile Flutter**

**Version:** 2.0 - Supabase Integration

**Last Updated:** 2026-02-07
