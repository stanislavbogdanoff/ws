const jwt = require("jsonwebtoken");

const socketProtect = (req, res, next) => {
  const isHandshake = req._query.sid === undefined;
  if (!isHandshake) {
    return next();
  }

  const header = req.headers.authorization;

  if (!header) {
    return next(new Error("no token"));
  }

  if (!header.startsWith("bearer ")) {
    return next(new Error("invalid token"));
  }

  const token = String(header.split(" ")[1]);

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error("invalid token"));
    }
    req.user = decoded.data;
    next();
  });
};

module.exports = { socketProtect };
