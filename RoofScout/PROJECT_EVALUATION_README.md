# RoofScout - Project Evaluation Documentation

## ✅ Completed Features for Project Evaluation

### 1. Backend Features

#### Authentication (JWT + Bcrypt)
- **File**: `Backend/routes/auth.js`
- Signup with hashed passwords using bcrypt (10 salt rounds)
- Login with JWT token generation (1-hour expiry)
- Protected routes using `authMiddleware`

#### Role-Based Access Control
- **File**: `Backend/middleware/authMiddleware.js`
- `authMiddleware`: Verifies JWT token from Authorization header
- `adminMiddleware`: Checks if user role is "admin"
- **Routes Protected**:
  - `POST /api/properties/add` - Logged-in users only
  - `PUT /api/properties/:id` - Admins only
  - `DELETE /api/properties/:id` - Admins only
  - `GET /api/properties/user` - Logged-in users only (their own properties)
  - `GET /api/admin/stats` - Admins only

#### Middleware
- **Logger**: `Backend/middleware/logger.js` - Logs all requests
- **Error Handler**: `Backend/middleware/errorHandler.js` - Centralized error handling
- **Property Validation**: `Backend/middleware/validateProperty.js` - Validates property data

#### SSR (Server-Side Rendering)
- **File**: `Backend/views/property.ejs`
- EJS template engine configured
- Property view page with EJS rendering

#### Socket.io Integration
- **File**: `Backend/server.js`
- Events implemented:
  - `propertyAdded` - Broadcast when new property is added
  - `propertyUpdated` - Broadcast when property is updated
  - `propertyDeleted` - Broadcast when property is deleted
  - `tourRequest` - Notify property owner and admin of tour request
  - `tourRequestStatusUpdate` - Notify buyer of status change
  - `sendMessage` - Real-time messaging
  - `adminNotification` - Admin-specific notifications

### 2. Frontend Features

#### Socket.io Client
- **File**: `roofscout_react/src/contexts/SocketContext.jsx`
- Global socket connection with authentication
- Auto-reconnection handling
- User-specific and admin room joining

#### Authentication Context
- **File**: `roofscout_react/src/contexts/AuthContext.jsx`
- JWT token management in localStorage
- Role-based access (user/admin)
- Login/signup/logout functions

#### Protected Routes
- **File**: `roofscout_react/src/components/ProtectedRoute.jsx`
- Route guarding based on authentication status
- Admin-only route protection
- Redirect to login for unauthenticated users

#### Real-time Notifications
- **File**: `roofscout_react/src/components/NotificationToast.jsx`
- Toast notifications for socket events
- Notification panel with unread count
- Visual indicators for different event types

#### Tour Request System
- **File**: `roofscout_react/src/components/TourRequestModal.jsx`
- Modal for requesting property tours
- Socket emission for real-time notifications
- Form with date, time, contact info

### 3. API Integration

#### API Functions (`roofscout_react/src/api.js`)
```javascript
// Auth
login(formData)       // Stores token, role, user data
signup(formData)      // Creates new user, auto-login

// Properties
addProperty(data)           // POST /api/properties/add (Auth required)
getProperties()             // GET /api/properties (Public)
getPropertyById(id)         // GET /api/properties/:id/view (Public)
getUserProperties()         // GET /api/properties/user (Auth required)
updateProperty(id, data)    // PUT /api/properties/:id (Admin only)
deleteProperty(id)          // DELETE /api/properties/:id (Admin only)

// Admin
getAdminStats()             // GET /api/admin/stats (Admin only)
```

## 🧪 Testing Instructions

### Prerequisites
1. MongoDB Atlas connection string in `Backend/.env`
2. JWT_SECRET in `Backend/.env`
3. Node.js installed

### 1. Start Backend Server
```bash
cd RoofScout/Backend
npm install
npm start
```
Server runs on `http://localhost:5000`

### 2. Start Frontend
```bash
cd RoofScout/roofscout_react
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`

### 3. Test Authentication (JWT + Bcrypt)

#### Using Postman

**Signup - Create User**
```http
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "Test User",
  "username": "testuser",
  "email": "user@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "name": "Test User",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Login**
```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "_id": "...",
    "name": "Test User",
    "email": "user@example.com",
    "role": "user"
  }
}
```

**Create Admin User** (Directly in MongoDB or modify role after creation)
```javascript
// In MongoDB Compass or Atlas
// Find user and update role to "admin"
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

### 4. Test Protected Routes

**Access User Properties (Requires Auth)**
```http
GET http://localhost:5000/api/properties/user
Authorization: Bearer <token>
```

**Access Admin Stats (Requires Admin Role)**
```http
GET http://localhost:5000/api/admin/stats
Authorization: Bearer <admin_token>
```

**Add Property (Requires Auth)**
```http
POST http://localhost:5000/api/properties/add
Content-Type: application/json
Authorization: Bearer <token>

{
  "title": "Test Property",
  "description": "A test property",
  "price": 5000000,
  "location": "Mohali",
  "state": "Punjab",
  "type": "house",
  "area": 2000,
  "beds": 3,
  "baths": 2
}
```

**Update Property (Requires Admin)**
```http
PUT http://localhost:5000/api/properties/<property_id>
Content-Type: application/json
Authorization: Bearer <admin_token>

{
  "title": "Updated Property Title",
  "price": 5500000
}
```

**Delete Property (Requires Admin)**
```http
DELETE http://localhost:5000/api/properties/<property_id>
Authorization: Bearer <admin_token>
```

### 5. Test Frontend Features

#### Authentication Flow
1. Open `http://localhost:5173/login`
2. Sign up a new user
3. Verify token stored in localStorage (DevTools → Application → Local Storage)
4. Login with credentials
5. Check role-based redirect (user → /userdashboard, admin → /AdminDashboard)

#### Role-Based Access
1. **As User**: Try to access `/AdminDashboard` → Should redirect to `/userdashboard`
2. **As User**: Try to access `/sell` without login → Should redirect to `/login`
3. **As Admin**: Access `/AdminDashboard` → Should work

#### Protected Routes
1. Logout and try accessing `/userdashboard` → Redirects to `/login`
2. Login as user and try `/AdminDashboard` → Redirects to `/userdashboard`

#### Socket.io Real-time Features
1. **Open two browser windows**:
   - Window 1: Login as admin → `/AdminDashboard`
   - Window 2: Login as user → `/sell`

2. **Test Property Added Notification**:
   - In Window 2 (User): Add a new property
   - In Window 1 (Admin): Should see real-time notification
   - Check NotificationToast component in both windows

3. **Verify Socket Events**:
   - Check browser console for socket connection messages
   - Check backend console for event logs

#### Tour Request System
1. Login as user
2. Navigate to a property
3. Click "Request Tour" (integrate TourRequestModal)
4. Fill and submit form
5. Check real-time notification in admin dashboard

### 6. MongoDB Verification

**Check Collections:**
```javascript
// Users collection - Verify password is hashed
db.users.find().pretty()

// Properties collection - Verify user reference
db.properties.find().pretty()
```

**Verify Password Hashing:**
- Password should NOT be stored in plain text
- Should be bcrypt hash (starts with `$2a$10$`)

### 7. Testing Checklist for Evaluation

| Feature | Test | Expected Result | Status |
|---------|------|-----------------|--------|
| **JWT** | Login and check localStorage | Token stored with "Bearer" prefix | ✅ |
| **Bcrypt** | Check MongoDB user document | Password field is hashed | ✅ |
| **Middleware** | Access protected route without token | 401 Unauthorized | ✅ |
| **Auth** | Access /userdashboard without login | Redirect to /login | ✅ |
| **Role-Based** | User accesses /AdminDashboard | Redirect to /userdashboard | ✅ |
| **Role-Based** | Admin accesses /AdminDashboard | Access granted | ✅ |
| **Socket.io** | Add property as user | Admin receives notification | ✅ |
| **Socket.io** | Connection status indicator | Shows green/red dot | ✅ |
| **API** | POST /api/properties/add with auth | Property created, socket event emitted | ✅ |
| **API** | PUT /api/properties/:id as admin | Property updated | ✅ |
| **API** | DELETE /api/properties/:id as admin | Property deleted | ✅ |
| **SSR** | EJS template rendering | View property page renders | ✅ |
| **Frontend** | ProtectedRoute component | Guards routes properly | ✅ |
| **Frontend** | AuthContext | Manages auth state globally | ✅ |
| **Frontend** | SocketContext | Manages socket connection globally | ✅ |

## 📸 Screenshots for Report

### Required Screenshots:

1. **Postman - Signup Request/Response**
2. **Postman - Login Request/Response**
3. **Postman - Add Property (with Auth header)**
4. **Postman - Get User Properties (Protected)**
5. **Postman - Admin Stats (Admin Protected)**
6. **MongoDB Compass - User document (showing hashed password)**
7. **MongoDB Compass - Properties collection**
8. **Frontend - Login Page**
9. **Frontend - User Dashboard (showing user's properties)**
10. **Frontend - Admin Dashboard (with notifications)**
11. **Frontend - Add Property Page**
12. **Browser DevTools - localStorage (showing token, role, user)**
13. **Backend Console - Socket connection logs**
14. **Frontend - Notification Toast (real-time)**

## 🔐 Security Features Implemented

1. **Password Hashing**: bcrypt with 10 salt rounds
2. **JWT Tokens**: Signed with JWT_SECRET, 1-hour expiry
3. **Protected Routes**: Middleware checks token validity
4. **Role-Based Access**: Separate middleware for admin checks
5. **CORS**: Enabled for frontend-backend communication
6. **Input Validation**: Property validation middleware

## 📝 Notes for Evaluation

- All mandatory features are implemented and tested
- Socket.io provides real-time notifications across connected clients
- JWT tokens are properly validated on every protected request
- Bcrypt securely hashes passwords before storage
- Role-based access control restricts admin-only operations
- Frontend has comprehensive protected route implementation
- Notifications appear in real-time for property events
