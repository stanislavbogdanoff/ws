const jwt = require("jsonwebtoken");
const { User } = require("../models/userSchema");

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization) {
    try {
      // "Bearer afqwjfad6lkv9aerfjqerjg7wqefjq3kegpoakef1woenr"

      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.data;
      next();
    } catch (error) {
      res.status(401).json({ error: JSON.stringify(error) });
      // throw new Error(error);
    }
  } else {
    res.status(401).json({ error: "No token" });
  }
};

module.exports = { protect };
