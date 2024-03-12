const { User } = require("../models/userSchema");

const jwt = require("jsonwebtoken");

const socketProtect = async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    socket.user = user; // Associate socket connection with user ID
    next();
  } else {
    next(new Error("Authentication error"));
  }
};

module.exports = { socketProtect };
