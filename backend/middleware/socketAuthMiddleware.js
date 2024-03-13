const { User } = require("../models/userSchema");
const jwt = require("jsonwebtoken");

const socketProtect = (socket, next) => {
  const token = socket.handshake.query["token"];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded; // Associate socket connection with user ID
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  } else {
    next(new Error("Authentication error"));
  }
};

module.exports = { socketProtect };
