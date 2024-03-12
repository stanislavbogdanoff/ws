// server.js

const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const { socketProtect } = require("./middleware/socketAuthMiddleware");
io.use(socketProtect);

const cors = require("cors");
const { Message } = require("./models/messageSchema");
corsOptions = {
  origin: "http://localhost:5173",
};
app.use(cors(corsOptions));

// Set up MongoDB connection
mongoose.connect("mongodb://localhost:27017/messenger");

// Middleware
app.use(bodyParser.json());

// Routes
app.get("/messages", async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/messages", async (req, res) => {
  try {
    const { author, content } = req.body;
    const message = await Message.create({ author, content });
    io.emit("message", message);
    res.status(201).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Handle socket connections
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.user}`);
  //   console.log("SOCKET", socket);

  socket.on("message", (data) => {
    const { content } = data;
    // Broadcast message with user's identity
    io.emit("message", { userId: socket.user._id, content });
  });

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.user._id}`);
  });
});

app.use("/auth", require("./routes/authRoutes"));

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
