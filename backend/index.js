const express = require("express");
const app = express();

const { createServer } = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");

const cors = require("cors");
corsOptions = {
  origin: "http://localhost:5173",
};
app.use(cors(corsOptions));

app.use(express.json());

mongoose.connect("mongodb://localhost:27017/messenger");

const dotenv = require("dotenv");
const { socketProtect } = require("./middleware/socketAuthMiddleware");
dotenv.config();

const port = process.env.PORT || 5000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Устанавливаем в настройках сервера инстанции WebSocket-сервера
app.set("io", io);

app.use("/messages", require("./routes/messageRoutes"));

io.engine.use(socketProtect);

io.on("connection", (socket) => {
  console.log("A user connected", socket.request.user);

  const roomId = socket?.request?.user?._id;

  if (roomId) {
    socket.join(roomId);
    console.log(`User ${roomId} joined room ${roomId}`);
  }

  socket.on("disconnect", () => {
    console.log("A client disconnected");
  });
});

httpServer.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});
