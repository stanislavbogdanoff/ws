const jwt = require("jsonwebtoken");
const { User } = require("../models/userSchema");

const socketProtect = (req, res, next) => {
  // sid - Session ID
  const isHandshake = req._query.sid === undefined;
  if (!isHandshake) {
    return next();
  }

  const header = req.headers.authorization;

  if (!header) {
    return next(new Error("no token"));
  }

  // bearer asdfasdfasdfasdf

  if (!header.startsWith("bearer ")) {
    return next(new Error("invalid token"));
  }

  const token = String(header.split(" ")[1]);

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return next(new Error("invalid token"));
    }

    req.user = decoded.data;
    next();
  });
};

module.exports = { socketProtect };
