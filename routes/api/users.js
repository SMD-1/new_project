const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
require("dotenv/config");
const { check, validationResult } = require("express-validator");
const JWT = require("jsonwebtoken");

const User = require("../../model/User");

// @route GET api/users
//  @desc  Register user
// @access  Public
router.get("/", (req, res) => {
  res.send("User Route");
});

// @route POST api/users
//  @desc   Register user
// @access  Public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail().trim().escape(),
    check(
      "password",
      "please enter a password with more than 6 character"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      // check if user already exists
      let user = await User.findOne({ email });
      // console.log(user);
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User Already exists" }] });
      }

      // Get Users gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      await user.save();

      const payload = {
        user: {
          id: user.id,
          name: name,
        },
      };
      const secret = process.env.jwtSecret;
      const options = {};
      JWT.sign(payload, secret, options, (err, token) => {
        if (err) throw err;
        res.json({ token });
        console.log(token);
      });
      // res.send("User Registerd");
    } catch (err) {
      console.log(err);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
