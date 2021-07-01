const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
// const User = require('./model')
// @route GET api/users
//  @desc  Test route
// @access  Public
router.get("/", (req, res) => {
  res.send("User Route");
});

router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "please enter a password with more than 6 character"
    ).isLength({ min: 6 }),
  ],
  (req, res) => {
    console.log(req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.send(req.body);
  }
);

module.exports = router;
