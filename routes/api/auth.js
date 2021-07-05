const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const auth = require("../../Middlewares/auth");

const User = require("../../model/User");

// @route GET api/auth
//  @desc  Test route
// @access  Public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.log(err.message);
    res.status(500).send("Server");
  }
});

// @route POST api/auth
//  @desc    Authenticate user and get user
// @access  Public

router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail().trim().escape(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      // check if user already exists
      let user = await User.findOne({ email });
      // console.log(user);
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credenetials" }] });
      }

      // Match email and Password
      const isMatch = await bcrypt.compare(password, user.password); //Here password is text password and user.password is encrypted password

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credenetials" }] });
      }

      const payload = {
        user: {
          id: user.id,
          emial: email,
        },
      };
      const secret = process.env.jwtSecret;
      const options = {};
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) throw err;
        res.json({ token });
        // console.log(token);
      });
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
