# 🚀 QUICK SETUP - Supabase Database

## ⚠️ QUAN TRỌNG: Chạy script này TRƯỚC KHI test!

Nếu chưa setup Supabase Database, bạn cần chạy SQL script để tạo tables và policies.

---

## Cách 1: Chạy SQL Script (Khuyến khích)

### Bước 1: Mở Supabase SQL Editor
```
https://supabase.com/dashboard/project/pjgjusdmzxrhgiptfvbg/sql
```

### Bước 2: Copy SQL từ file
```
XpianoServer/supabase-setup.sql
```

### Bước 3: Paste và Run
Click "Run" để execute

---

## Cách 2: Manual Setup (Nếu cần customize)

### 1. Tạo Profiles Table

```sql
-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'teacher')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### 2. Tạo Auto-Create Profile Trigger

```sql
-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role, phone)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NEW.raw_user_meta_data->>'phone'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();
```

### 3. Tạo Pianos Table

```sql
-- Pianos table (giống Express backend)
CREATE TABLE IF NOT EXISTS pianos (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  image_url TEXT,
  category TEXT,
  price_per_hour INTEGER,
  rating DECIMAL(2,1),
  reviews_count INTEGER DEFAULT 0,
  description TEXT,
  features TEXT[]
);

-- Enable RLS
ALTER TABLE pianos ENABLE ROW LEVEL SECURITY;
```

### 4. Setup RLS Policies

#### Profiles Policies:
```sql
-- Users can view own profile
CREATE POLICY "view_own_profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Admins can view all
CREATE POLICY "admin_view_all"
ON profiles FOR SELECT
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Users can update own profile
CREATE POLICY "update_own_profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Admins can update all
CREATE POLICY "admin_update_all"
ON profiles FOR UPDATE
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

#### Pianos Policies:
```sql
-- Anyone can view pianos (even not logged in)
CREATE POLICY "public_view_pianos"
ON pianos FOR SELECT
USING (true);

-- Only admins can insert
CREATE POLICY "admin_insert_pianos"
ON pianos FOR INSERT
WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Only admins can update
CREATE POLICY "admin_update_pianos"
ON pianos FOR UPDATE
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Only admins can delete
CREATE POLICY "admin_delete_pianos"
ON pianos FOR DELETE
USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
```

### 5. Insert Sample Pianos (Optional)

```sql
-- Sample data
INSERT INTO pianos (name, image_url, category, price_per_hour, rating, reviews_count, description, features)
VALUES 
  (
    'Yamaha C3X Grand',
    'https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=1000',
    'Grand',
    250000,
    4.9,
    128,
    'Dòng đàn Grand Piano tiêu chuẩn thế giới',
    ARRAY['Âm thanh vòm', 'Phím ngà voi nhân tạo', 'Phòng cách âm VIP']
  ),
  (
    'Roland FP-90X Digital',
    'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?q=80&w=1000',
    'Digital',
    120000,
    4.6,
    98,
    'Đàn piano điện tử cao cấp',
    ARRAY['88 phím PHA-50', 'Bluetooth Audio/MIDI', 'SuperNATURAL Piano']
  ),
  (
    'Kawai K-300 Upright',
    'https://images.unsplash.com/photo-1510915228340-29c85a43dcfe?q=80&w=1000',
    'Upright',
    180000,
    4.7,
    142,
    'Đàn piano đứng Nhật Bản chất lượng cao',
    ARRAY['Chiều cao 122cm', 'Millennium III Action', 'Âm thanh rõ ràng']
  )
ON CONFLICT DO NOTHING;
```

### 6. Enable Realtime (Optional)

```sql
-- Enable realtime for pianos (cho auto-sync)
ALTER PUBLICATION supabase_realtime ADD TABLE pianos;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
```

---

## ✅ Verification

### Check Tables Created:
```
Supabase Dashboard → Table Editor
→ Phải thấy: profiles, pianos
```

### Check Trigger:
```sql
-- Test: Register user qua app
-- Sau đó check profiles table
SELECT * FROM profiles;
-- Phải có record mới!
```

### Check RLS:
```sql
-- Test policies
SELECT * FROM pianos; -- Phải work (public access)
```

---

## 🐛 Common Issues

### "relation 'profiles' does not exist"
```
→ Chạy bước 1 (Create profiles table)
```

### "Trigger không chạy"
```
→ Check Function và Trigger đã tạo chưa
→ Xem logs trong Supabase Dashboard
```

### "RLS policy violation"
```
→ Temporarily disable RLS để test:
   ALTER TABLE pianos DISABLE ROW LEVEL SECURITY;
→ Sau khi test xong, enable lại
```

### "Admin không thể CRUD pianos"
```
→ Update role trong profiles:
   UPDATE profiles SET role = 'admin' WHERE id = 'your-user-id';
```

---

## 📝 Next Steps

1. ✅ Run SQL script
2. ✅ Register test user trên Web
3. ✅ Check profiles table (trigger worked?)
4. ✅ Login và view pianos
5. ✅ Test với Mobile Flutter (same credentials)

---

**File này giải thích:** Cần setup gì trong Supabase Database trước khi test app

**See also:** 
- `XpianoServer/supabase-setup.sql` - Full SQL script
- `SUPABASE_MIGRATION.md` - Complete migration guide
