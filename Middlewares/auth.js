const JWT = require("jsonwebtoken");
require("dotenv/config");

module.exports = function (req, res, next) {
  //  Get the tokens from header
  const token = req.header("x-auth-token");

  // Check if there is no token
  if (!token) {
    return res.status(401).json({
      msg: "No token, authorization denied",
    });
  }

  // Verify token
  try {
    const decoded = JWT.verify(token, process.env.jwtSecret);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({
      msg: "Token is not valid",
    });
  }
};
