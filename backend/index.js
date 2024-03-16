const express = require("express");
const app = express();

const { createServer } = require("node:http");
const { join } = require("node:path");
const passport = require("passport");
const passportJwt = require("passport-jwt");
const JwtStrategy = passportJwt.Strategy;
const ExtractJwt = passportJwt.ExtractJwt;
const bodyParser = require("body-parser");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const { Message } = require("./models/messageSchema");
const { User } = require("./models/userSchema");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const cors = require("cors");
corsOptions = {
  origin: "http://localhost:5173",
};
app.use(cors(corsOptions));

mongoose.connect("mongodb://localhost:27017/messenger");

const dotenv = require("dotenv");
const { protect } = require("./middleware/authMiddleware");
dotenv.config();

const port = process.env.PORT || 5000;
const jwtSecret = process.env.JWT_SECRET;

const httpServer = createServer(app);

app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

app.get(
  "/self",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    if (req.user) {
      res.send(req.user);
    } else {
      res.status(401).end();
    }
  }
);

app.post("/auth/login", async (req, res) => {
  const { name, password } = req.body;
  const user = await User.findOne({ name });

  if (user && (await bcrypt.compare(password, user.password))) {
    console.log("authentication OK");

    const token = jwt.sign(
      {
        data: user,
      },
      jwtSecret,
      {
        expiresIn: "30d",
      }
    );

    res.status(200).json({
      _id: user.id,
      name: user.name,
      age: user.age,
      jobTitle: user.jobTitle,
      role: user.role,
      token: token,
    });
  } else {
    console.log("wrong credentials");
    res.status(401).end();
  }
});

app.get("/messages", protect, async (req, res) => {
  try {
    const messages = await Message.find({ isPublic: true })
      .populate("sender")
      .populate("reciever")
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/messages/private/:recieverId", protect, async (req, res) => {
  const senderId = req.user._id;
  const { recieverId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        {
          sender: senderId,
          reciever: recieverId,
        },
        {
          sender: recieverId,
          reciever: senderId,
        },
      ],
    })
      .populate("sender")
      .populate("reciever")
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/messages", protect, async (req, res) => {
  try {
    const senderId = req.user._id; // Assuming req.user contains user data

    const message = await Message.create({
      ...req.body,
      sender: senderId,
      isPublic: true,
    });

    const newMessage = await Message.findById(message._id)
      .populate("reciever")
      .populate("sender");

    io.emit("message", message); // Send message only to the receiver

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/messages/private", protect, async (req, res) => {
  try {
    const { recieverId } = req.body;
    const senderId = String(req.user._id); // Assuming req.user contains user data

    const message = await Message.create({
      ...req.body,
      sender: senderId,
      reciever: recieverId,
    });

    const newMessage = await Message.findById(message._id)
      .populate("reciever")
      .populate("sender");

    console.log("PRIVATE MESSAGE", recieverId, senderId);

    io.to(senderId).to(recieverId).emit("message", newMessage);

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

io.engine.use((req, res, next) => {
  const isHandshake = req._query.sid === undefined;
  if (!isHandshake) {
    return next();
  }

  const header = req.headers["authorization"];

  if (!header) {
    return next(new Error("no token"));
  }

  if (!header.startsWith("bearer ")) {
    return next(new Error("invalid token"));
  }

  const token = header.substring(7);

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      return next(new Error("invalid token"));
    }
    req.user = decoded.data;
    next();
  });
});

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
