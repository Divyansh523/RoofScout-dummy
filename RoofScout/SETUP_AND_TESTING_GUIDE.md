# RoofScout - Complete Setup & Testing Guide

## 🚀 Quick Start (Run the Application)

### Step 1: Start Backend Server
```bash
cd RoofScout/Backend
npm install
npm start
```

**Expected Output:**
```
✅ MongoDB Connected
🚀 RoofScout backend running on port 5000
```

### Step 2: Start Frontend (New Terminal)
```bash
cd RoofScout/roofscout_react
npm install
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  press h + enter to show help
```

### Step 3: Open Browser
Navigate to: `http://localhost:5173`

---

## ✅ Evaluation Checkpoints Verification

### 1. ✅ Middleware
**Files:**
- `Backend/middleware/logger.js` - Logs all requests
- `Backend/middleware/errorHandler.js` - Centralized error handling
- `Backend/middleware/authMiddleware.js` - JWT verification
- `Backend/middleware/adminMiddleware.js` - Role checking
- `Backend/middleware/validateProperty.js` - Property validation

**Test:**
1. Open browser devtools → Network tab
2. Make any API request
3. Check backend console for logged requests

### 2. ✅ JWT Authentication (NO Session Cookies)
**Files:**
- `Backend/routes/auth.js` - Signup/Login with bcrypt + JWT
- `Backend/middleware/authMiddleware.js` - Token verification
- `roofscout_react/src/contexts/AuthContext.jsx` - Frontend auth state

**How it works:**
- Passwords hashed with bcrypt (10 salt rounds)
- JWT token stored in localStorage (NOT cookies)
- Token sent in `Authorization: Bearer <token>` header
- 1-hour token expiry

**Test:**
1. Sign up at `/login`
2. Check DevTools → Application → Local Storage
3. Verify `token`, `role`, `user` stored
4. Check password in MongoDB is hashed

### 3. ✅ SSR (Server-Side Rendering)
**Files:**
- `Backend/views/property.ejs` - EJS template
- `Backend/routes/properties.js` - `/properties/:id/ssr` route

**Test:**
1. Add a property via frontend
2. Get the property ID from MongoDB
3. Visit: `http://localhost:5000/api/properties/<ID>/ssr`
4. See server-rendered HTML page

### 4. ✅ Socket.io (Real-time Notifications)
**Files:**
- `Backend/server.js` - Socket server configuration
- `roofscout_react/src/contexts/SocketContext.jsx` - Client connection
- `roofscout_react/src/components/NotificationToast.jsx` - Notifications

**Events:**
- `propertyAdded` - New property listed
- `propertyUpdated` - Property edited
- `propertyDeleted` - Property removed
- `tourRequestCreated` - New tour request
- `adminNotification` - Admin alerts

**Test:**
1. Open two browser windows
2. Window 1: Login as admin → `/AdminDashboard`
3. Window 2: Login as user → `/sell` → Add property
4. See real-time notification in Window 1

---

## 🧪 End-to-End Testing

### Test 1: Authentication Flow
```
1. Visit http://localhost:5173/login
2. Click "Sign Up" tab
3. Enter: name, username, email, password
4. Click Sign Up
5. Verify redirect to /userdashboard (user role)
6. Check localStorage has token, role, user
```

### Test 2: Protected Routes
```
1. Logout (clear localStorage or click logout)
2. Try to visit http://localhost:5173/userdashboard
3. Verify redirect to /login
4. Login as regular user
5. Try to visit http://localhost:5173/AdminDashboard
6. Verify redirect to /userdashboard (role protection)
```

### Test 3: Add Property with Socket
```
1. Open AdminDashboard in one window (admin user)
2. Open Sell page in another window (regular user)
3. User: Fill property form → Submit
4. Admin: See notification toast appear
5. Check notifications panel in AdminDashboard
```

### Test 4: Role-Based API Access
**Using Postman:**

**Without Token (Should Fail):**
```http
POST http://localhost:5000/api/properties/add
```
Response: `401 Unauthorized`

**With User Token (Should Work):**
```http
POST http://localhost:5000/api/properties/add
Authorization: Bearer <user_token>
```
Response: `200 OK` - Property created

**With User Token - Admin Route (Should Fail):**
```http
DELETE http://localhost:5000/api/properties/<id>
Authorization: Bearer <user_token>
```
Response: `403 Access denied`

**With Admin Token (Should Work):**
```http
DELETE http://localhost:5000/api/properties/<id>
Authorization: Bearer <admin_token>
```
Response: `200 OK` - Property deleted

---

## 🔍 Troubleshooting

### Issue: "Cannot connect to backend"
**Solution:**
1. Check if backend is running on port 5000
2. Verify MongoDB Atlas connection string in `.env`
3. Check firewall/antivirus settings

### Issue: "JWT verification failed"
**Solution:**
1. Check `JWT_SECRET` is set in Backend/.env
2. Verify token format: `Bearer <token>`
3. Check token hasn't expired (1 hour)

### Issue: "Socket.io not connecting"
**Solution:**
1. Check backend console for "User connected" message
2. Verify frontend `SocketContext` is loaded
3. Check browser console for connection errors

### Issue: "npm install fails"
**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

---

## 📁 Project Structure

```
RoofScout/
├── Backend/                          # Express + MongoDB + Socket.io
│   ├── middleware/                   # Logger, auth, error handler
│   │   ├── logger.js
│   │   ├── authMiddleware.js
│   │   ├── adminMiddleware.js
│   │   ├── errorHandler.js
│   │   └── validateProperty.js
│   ├── models/                       # MongoDB schemas
│   │   ├── User.js
│   │   └── Property.js
│   ├── routes/                       # API routes
│   │   ├── auth.js                   # JWT auth endpoints
│   │   ├── properties.js             # Property CRUD + SSR
│   │   └── admin.js                  # Admin endpoints
│   ├── views/                        # EJS templates (SSR)
│   │   └── property.ejs
│   ├── server.js                     # Main server + socket.io
│   ├── package.json
│   └── .env                          # Environment variables
│
└── roofscout_react/                  # React + Vite frontend
    ├── src/
    │   ├── components/
    │   │   ├── ProtectedRoute.jsx      # Route guarding
    │   │   ├── NotificationToast.jsx   # Socket notifications
    │   │   └── TourRequestModal.jsx    # Tour request form
    │   ├── contexts/
    │   │   ├── AuthContext.jsx         # JWT auth state
    │   │   ├── SocketContext.jsx       # Socket.io connection
    │   │   ├── PropertyContext.jsx     # Property data
    │   │   └── PropertyContextRent.jsx # Rent data
    │   ├── pages/                      # All page components
    │   ├── api.js                      # API functions
    │   ├── App.jsx                     # Routes + providers
    │   └── main.jsx                    # Entry point
    ├── package.json
    └── index.html
```

---

## ✅ Pre-Flight Checklist

Before showing to evaluator, verify:

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] MongoDB connected
- [ ] Can sign up new user
- [ ] Can login existing user
- [ ] JWT token stored in localStorage
- [ ] Password hashed in MongoDB
- [ ] Protected routes redirect unauthenticated users
- [ ] Admin routes redirect non-admin users
- [ ] Can add property (authenticated)
- [ ] Real-time notification appears on property add
- [ ] SSR page renders at `/api/properties/:id/ssr`
- [ ] Socket.io shows connection status
- [ ] All pages load without console errors

---

## 🎯 Expected Behavior Summary

| Feature | Expected |
|---------|----------|
| Signup | Creates user with hashed password, returns JWT |
| Login | Returns JWT, stores in localStorage |
| Auth Check | Checks `token` in localStorage |
| Protected Route | Redirects to `/login` if no token |
| Admin Route | Redirects to `/userdashboard` if not admin |
| Add Property | Requires auth token in header |
| Edit/Delete Property | Requires admin role |
| Socket Connection | Shows green dot when connected |
| Notification | Toast appears on property events |
| SSR | HTML rendered server-side at `/ssr` route |

---

**Ready for Evaluation! 🚀**
