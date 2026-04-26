const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const adminRoutes = require("./routes/admin");


require("dotenv").config();

const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/auth");
const propertyRoutes = require("./routes/properties");
const requestRoutes = require("./routes/requests");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Error:", err));

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use(logger);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("io", io);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/request", requestRoutes);
app.use("/api/admin", adminRoutes); 

app.use(errorHandler);

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // Join user-specific room for targeted notifications
  const userId = socket.handshake.auth?.userId;
  if (userId) {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  }

  // Admin joins admin room
  const token = socket.handshake.auth?.token;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role === "admin") {
        socket.join("admins");
        console.log(`👑 Admin ${decoded.id} joined admin room`);
      }
    } catch (err) {
      console.log("Socket auth error:", err.message);
    }
  }

  // Property events
  socket.on("propertyAdded", (data) => {
    console.log("🏠 Property added:", data);
    io.emit("propertyAdded", {
      type: "propertyAdded",
      message: `New property listed: ${data.title}`,
      property: data,
    });
    io.to("admins").emit("adminNotification", {
      type: "adminNotification",
      message: `New property added by ${data.ownerName || "user"}: ${data.title}`,
      property: data,
    });
  });

  socket.on("propertyUpdated", (data) => {
    console.log("✏️ Property updated:", data);
    io.emit("propertyUpdated", {
      type: "propertyUpdated",
      message: `Property updated: ${data.title}`,
      property: data,
    });
    io.to("admins").emit("adminNotification", {
      type: "adminNotification",
      message: `Property updated: ${data.title}`,
      property: data,
    });
  });

  socket.on("propertyDeleted", (data) => {
    console.log("🗑️ Property deleted:", data);
    io.emit("propertyDeleted", {
      type: "propertyDeleted",
      message: `Property removed: ${data.title}`,
      property: data,
    });
    io.to("admins").emit("adminNotification", {
      type: "adminNotification",
      message: `Property deleted: ${data.title}`,
      property: data,
    });
  });

  // Tour request events
  socket.on("tourRequest", (data) => {
    console.log("📅 Tour request:", data);
    // Notify property owner
    io.to(`user_${data.ownerId}`).emit("tourRequestCreated", {
      type: "tourRequestCreated",
      message: `New tour request for ${data.propertyTitle} from ${data.buyerName}`,
      tourRequest: data,
    });
    // Notify requester
    io.to(`user_${data.buyerId}`).emit("tourRequestCreated", {
      type: "tourRequestCreated",
      message: `Tour request sent for ${data.propertyTitle}`,
      tourRequest: data,
    });
    // Notify admins
    io.to("admins").emit("adminNotification", {
      type: "adminNotification",
      message: `New tour request: ${data.propertyTitle} by ${data.buyerName}`,
      tourRequest: data,
    });
  });

  socket.on("tourRequestStatusUpdate", (data) => {
    console.log("🔄 Tour status update:", data);
    io.to(`user_${data.buyerId}`).emit("tourRequestStatusChanged", {
      type: "tourRequestStatusChanged",
      message: `Tour request ${data.status}: ${data.propertyTitle}`,
      tourRequest: data,
    });
  });

  // Message events
  socket.on("sendMessage", (data) => {
    console.log("💬 Message sent:", data);
    io.to(`user_${data.recipientId}`).emit("newMessage", {
      type: "newMessage",
      message: `New message from ${data.senderName}`,
      messageData: data,
    });
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 RoofScout backend running on port ${PORT}`);
});
