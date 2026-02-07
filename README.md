# 🎹 Xpiano Frontend - Authentication & API Integration

## ✅ Hoàn thành

### 1. **Authentication System**
- ✅ Login page (`/login`)
- ✅ Register page (`/register`)
- ✅ Forgot password page (`/forgot-password`)
- ✅ Auth context & JWT management
- ✅ Protected routes
- ✅ User info display in header

### 2. **API Integration**
- ✅ Axios API client với interceptors
- ✅ Auth service (login, register, logout)
- ✅ Piano service (fetch từ Express backend)
- ✅ Loading & error states
- ✅ Remove ALL mock data

### 3. **Features**
- ✅ Dynamic piano list từ backend
- ✅ Category filtering
- ✅ User authentication status
- ✅ Role display (User, Teacher, Admin)
- ✅ Logout functionality

---

## 📁 Project Structure

```
Xpiano/
├── lib/
│   ├── api.ts              # Axios client với auth interceptors
│   ├── authService.ts      # Auth API calls
│   └── pianoService.ts     # Piano API calls
├── contexts/
│   └── AuthContext.tsx     # Global auth state
├── pages/
│   ├── LoginPage.tsx       # Login page
│   ├── RegisterPage.tsx    # Register page
│   └── ForgotPasswordPage.tsx  # Forgot password
├── components/
│   ├── Header.tsx          # 🔄 Updated với auth
│   ├── Marketplace.tsx     # 🔄 Updated fetch từ API
│   ├── ProductCard.tsx     # Unchanged
│   ├── Hero.tsx            # Unchanged (as requested)
│   └── Footer.tsx          # Unchanged
├── App.tsx                 # 🔄 Added routing & auth provider
└── .env.local              # API URL config
```

---

## 🚀 Getting Started

### 1. Install dependencies (đã xong)
```bash
npm install axios react-router-dom
```

### 2. Start frontend
```bash
npm run dev
# Running at: http://localhost:5173
```

### 3. Start backend (trong terminal khác)
```bash
cd ../XpianoServer
npm run dev
# Running at: http://localhost:3000
```

---

## 🔑 Test Accounts

```
👤 User:    user@xpiano.com / user123
👨‍🏫 Teacher: teacher@xpiano.com / teacher123
👑 Admin:   admin@xpiano.com / admin123
```

---

## 🔗 Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/` | Home (Hero + Marketplace) | ❌ No |
| `/login` | Login page | ❌ No |
| `/register` | Register page | ❌ No |
| `/forgot-password` | Forgot password | ❌ No |

---

## 📡 API Integration

### Auth Endpoints (từ Express Backend)
```typescript
POST http://localhost:3000/api/auth/login
POST http://localhost:3000/api/auth/register
POST http://localhost:3000/api/auth/forgot-password
GET  http://localhost:3000/api/auth/me (Protected)
```

### Piano Endpoints (từ Express Backend)
```typescript
GET http://localhost:3000/api/pianos
GET http://localhost:3000/api/pianos/:id
GET http://localhost:3000/api/pianos/stats
POST http://localhost:3000/api/pianos (Admin only)
```

---

## 🎨 Features Implemented

### Header Component
```typescript
// Before
<button>Login</button>

// After
{isAuthenticated ? (
  <div>
    <UserInfo user={user} />
    <LogoutButton />
  </div>
) : (
  <LoginButton />
)}
```

### Marketplace Component
```typescript
// Before
const [products] = useState(MOCK_DATA);

// After
const [pianos, setPianos] = useState([]);

useEffect(() => {
  const data = await pianoService.getAll({ category });
  setPianos(data);
}, [category]);
```

### Auth Flow
```typescript
// Login
await authService.login({ email, password })
// → Save token to localStorage
// → Redirect to home
// → Header shows user info

// Logout
authService.logout()
// → Remove token from localStorage
// → Redirect to login
```

---

## 🔒 Authentication Flow

### 1. Login Process
```
User enters credentials
  ↓
POST /api/auth/login
  ↓
Backend validates & returns JWT token
  ↓
Frontend saves token to localStorage
  ↓
AuthContext updates user state
  ↓
Header shows user info
  ↓
Auto-redirect to home
```

### 2. Protected API Calls
```
User performs action (e.g., view pianos)
  ↓
axios interceptor adds: Authorization: Bearer {token}
  ↓
Backend validates JWT
  ↓
If valid: Return data
If invalid: 401 → Auto-logout → Redirect to login
```

### 3. Logout Process
```
User clicks logout
  ↓
Remove token from localStorage
  ↓
AuthContext clears user state
  ↓
Redirect to login page
  ↓
Header shows login button
```

---

## 🛠️ Configuration

### Environment Variables (.env.local)
```bash
VITE_API_URL=http://localhost:3000/api
```

### API Client (lib/api.ts)
```typescript
// Auto-add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      logout();
    }
    return Promise.reject(error);
  }
);
```

---

## 📝 Usage Examples

### Fetch Pianos
```typescript
import pianoService from './lib/pianoService';

// Get all
const pianos = await pianoService.getAll();

// Filter by category
const grandPianos = await pianoService.getAll({
  category: 'Grand'
});

// Multiple filters
const filtered = await pianoService.getAll({
  category: 'Upright',
  minRating: 4.5,
  maxPrice: 200000
});
```

### Authentication
```typescript
import authService from './lib/authService';

// Register
await authService.register({
  email: 'user@example.com',
  password: 'password123',
  full_name: 'Nguyen Van A',
  phone: '0912345678',
  role: 'user'
});

// Login
await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// Get profile
const user = await authService.getProfile();

// Logout
authService.logout();
```

### Auth Context
```typescript
import { useAuth } from './contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (isAuthenticated) {
    return <div>Welcome {user.full_name}!</div>;
  }

  return <LoginForm onSubmit={login} />;
}
```

---

## ⚠️ Notes

### Mock Data Removed
- ✅ Removed `PRODUCTS` from `constants.ts` usage
- ✅ All data now fetched from backend API
- ⚠️ Hero component unchanged (per request)

### CORS
Backend Express đã enable CORS:
```javascript
app.use(cors()); // Allow all origins
```

### Error Handling
```typescript
// Loading state
if (isLoading) return <Loader />;

// Error state
if (error) return <ErrorMessage retry={loadData} />;

// Success state
return <DataDisplay data={data} />;
```

---

## 🐛 Troubleshooting

### Backend not running
```
Error: connect ECONNREFUSED ::1:3000
```
**Solution:** Start backend server
```bash
cd ../XpianoServer
npm run dev
```

### CORS error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution:** Đã fix trong backend, restart backend server

### 401 Unauthorized
```
Token không hợp lệ hoặc đã hết hạn
```
**Solution:** Login lại để get new token

---

## ✨ Next Steps

### Immediate
- [ ] Add reset password page (with token from email)
- [ ] Add profile page
- [ ] Add admin dashboard

### Supabase Integration (Hybrid Approach)
- [ ] Setup Supabase client for shared features
- [ ] Keep Express for WebRTC & complex logic
- [ ] Sync auth between Web và Mobile

### Features
- [ ] Shopping cart
- [ ] Booking system (mượn đàn)
- [ ] Online classes (WebRTC)
- [ ] Teacher dashboard
- [ ] Admin panel

---

## 📚 Tech Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios
- **State Management:** React Context API
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Backend:** Express.js (http://localhost:3000)

---

**Status:** ✅ Ready for development
**Date:** 2026-02-07
