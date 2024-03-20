const express = require("express");
const mongoose = require("mongoose");
const { createServer } = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const { socketProtect } = require("./middleware/socketAuthMiddleware");

// Создаем приложение
const app = express();

// Создаем HTTP сервер
const httpServer = createServer(app);

// Создаем WebSocket сервер
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5174",
    methods: ["GET", "POST"],
  },
});

// Настройка CORS для express
const cors = require("cors");
corsOptions = {
  origin: "http://localhost:5174",
};
app.use(cors(corsOptions));

// Middleware для конвертации тел запросов в JSON
app.use(express.json());

// Подключение к БД
mongoose.connect("mongodb://localhost:27017/messenger");

// Конфигурация пути до .env
dotenv.config();

// Подключение эндпоинтов для сообщений

app.use("/messages", require("./routes/messageRoutes"));
app.use("/auth", require("./routes/authRoutes"));

// Применение middleware для авторизации WebSocket событий

io.engine.use(socketProtect);

// Слушатель подключения/отключения

io.on("connection", (socket) => {
  const roomId = socket?.request?.user?._id || null;

  console.log(`A user connected ${roomId}`);

  if (roomId) {
    socket.join(roomId);
    console.log(`User ${roomId} joined room ${roomId}`);
  }

  socket.on("disconnect", () => {
    // console.log("A client disconnected", socket.request.user);
  });
});

// Устанавливаем в настройках сервера инстанцию WebSocket-сервера
app.set("io", io);

// Запуск сервера

const port = process.env.PORT || 5001;

httpServer.listen(port, () => {
  console.log(`application is running at: http://localhost:${port}`);
});
