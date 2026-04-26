# RoofScout - Real Estate Property Management System

A full-stack real estate application built with React, Node.js, Express, MongoDB, and Socket.io. Features property listings, user authentication, admin dashboard, real-time notifications, and payment integration.

## Features

- **User Dashboard**: Browse properties, request tours, track requests
- **Admin Dashboard**: Manage properties, users, payments, and statistics
- **Property Management**: Add, edit, delete properties (houses, plots, PG)
- **Authentication**: JWT-based secure authentication with Bcrypt
- **Real-time Communication**: Socket.io for live notifications
- **Payment Integration**: Property booking and payment processing
- **Responsive Design**: Mobile-friendly UI with dark mode support
- **Role-based Access**: Admin and user roles with different permissions

## Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Framer Motion (animations)
- Recharts (data visualization)
- Socket.io-client (real-time)
- Axios (API calls)
- Lucide React (icons)

### Backend
- Node.js
- Express.js
- MongoDB (NoSQL database)
- Mongoose (ODM)
- Socket.io (real-time server)
- JWT (authentication)
- Bcrypt (password hashing)
- CORS
- Body-parser

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager
- Git

## Installation

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd BE-2PE
```

### 2. Backend Setup

```bash
cd RoofScout/Backend
npm install
```

Create a `.env` file in the Backend folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/roofscout
# Or use MongoDB Atlas connection string
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/roofscout
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Frontend Setup

```bash
cd RoofScout/roofscout_react
npm install
```

Create a `.env` file in the frontend folder (if needed):

```env
VITE_API_URL=http://localhost:5000
```

### 4. Start MongoDB

Make sure MongoDB is running locally or update the MONGO_URI in the backend `.env` file to use MongoDB Atlas.

### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd RoofScout/Backend
npm start
# Backend runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd RoofScout/roofscout_react
npm run dev
# Frontend runs on http://localhost:5173
```

## Environment Variables

### Backend (.env)
- `PORT` - Backend server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT token generation

### Frontend (optional .env)
- `VITE_API_URL` - Backend API URL (default: http://localhost:5000)

## Default Admin Account

To access the admin dashboard, you can create an admin user through the signup process. The system supports role-based access control.

## Project Structure

```
BE-2PE/
├── RoofScout/
│   ├── Backend/
│   │   ├── middleware/      # Custom middleware (auth, admin, logger, error handling)
│   │   ├── models/          # Mongoose models (User, Property, Request, Stats)
│   │   ├── routes/          # Express routes (auth, properties, requests, admin)
│   │   ├── views/           # EJS templates (if needed)
│   │   └── server.js        # Main server file
│   └── roofscout_react/
│       ├── src/
│       │   ├── components/  # Reusable components (Navbar, Footer, PropertyCard, etc.)
│       │   ├── contexts/     # React contexts (AuthContext, SocketContext)
│       │   ├── hooks/        # Custom hooks (useTheme)
│       │   ├── pages/        # Page components (Home, Login, Dashboards, etc.)
│       │   ├── App.jsx       # Main app component with routing
│       │   └── main.jsx      # Entry point
│       ├── public/           # Static assets
│       └── index.html        # HTML template
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login

### Properties
- `GET /api/properties` - Get all properties
- `POST /api/properties/add` - Add new property
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

### Requests (Tour Requests)
- `GET /api/request` - Get all requests
- `POST /api/request` - Create tour request
- `PUT /api/request/:id/status` - Update request status

### Admin
- `GET /api/admin/stats` - Get dashboard statistics

## Socket.io Events

### Client → Server
- `propertyAdded` - Notify when property is added
- `propertyUpdated` - Notify when property is updated
- `propertyDeleted` - Notify when property is deleted
- `tourRequest` - Create tour request
- `tourRequestStatusUpdate` - Update tour request status
- `sendMessage` - Send message

### Server → Client
- `propertyAdded` - Broadcast property addition
- `propertyUpdated` - Broadcast property update
- `propertyDeleted` - Broadcast property deletion
- `adminNotification` - Admin-specific notifications
- `tourRequestCreated` - Tour request notification
- `tourRequestStatusChanged` - Tour status update
- `newMessage` - New message notification

## Topics Covered

This project demonstrates:
- **Middleware**: Application-level, router-level, error-handling, custom middleware
- **Body Parser**: Request body parsing
- **MongoDB & Mongoose**: NoSQL database with ODM
- **Authentication**: Bcrypt for password hashing, JWT for token-based auth
- **Socket.io**: Real-time full-duplex communication
- **Cookies**: Cookie-parser for cookie handling
- **React**: SPA with client-side rendering
- **REST API**: Express.js RESTful API design

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running locally
- Check MONGO_URI in backend .env file
- Verify network connectivity if using MongoDB Atlas

### Frontend API Connection Error
- Ensure backend is running on port 5000
- Check CORS configuration in backend
- Verify API URL in frontend

### Socket.io Connection Issues
- Ensure both frontend and backend are running
- Check socket.io client configuration
- Verify CORS settings for socket.io

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is for educational purposes.

## Contact

For questions or support, please open an issue in the repository.
