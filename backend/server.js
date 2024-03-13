const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { Message } = require("./models/messageSchema");

const dotenv = require("dotenv");
dotenv.config();

// Initialize Express app
const app = express();
const http = require("http");
const server = http.createServer(app);
const socketIo = require("socket.io");
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

corsOptions = {
  origin: "http://localhost:5173",
};
app.use(cors(corsOptions));

mongoose.connect("mongodb://localhost:27017/messenger");

app.use(express.json());

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
    console.log(req.body);
    const { author, content } = req.body;
    const message = await Message.create({ author, content });
    io.emit("message", message);
    res.status(201).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// io.use(socketProtect);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

app.use("/auth", require("./routes/authRoutes"));

// Start server
const PORT = 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
