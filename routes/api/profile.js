// to get our own Profile
const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");

const auth = require("../../Middlewares/auth");
const Profile = require("../../model/Profile");
const User = require("../../model/User"); //we also need user model]
// @route GET api/profile/me
//  @desc  Get Current users profile
// @access  Private   because we were getting the profile by user id thats in the token so we need to bring in the auth middleware and add that
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id, //this user is pretend to our profile model user field which is going to object id of the user
    }).populate("user", ["name", "avatar", "id"]);
    //we wanna get user name and profile which is in user model so we use populate method to get that
    if (!profile) {
      return res.status(400).json({
        msg: "There is no profile for this user",
      });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server");
  }
  // res.send("Profile Route");
});

// @route POST api/profile
//  @desc  Create or product user profile
// @access  Private

router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      bio,
      status,
      skills,
      githubUserName,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) {
      profileFields.company = company;
    }
    if (website) {
      profileFields.website = website;
    }
    if (location) {
      profileFields.location = location;
    }
    if (bio) {
      profileFields.bio = bio;
    }
    if (status) {
      profileFields.status = status;
    }
    if (githubUserName) {
      profileFields.githubUserName = githubUserName;
    }
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    // Build Social Object
    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;

    if (twitter) profileFields.social.twitter = twitter;

    if (facebook) profileFields.social.facebook = facebook;

    if (linkedin) profileFields.social.linkedin = linkedin;

    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        // Update
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }
      //   console.log("23djdh");

      //   // Create
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server Error");
    }

    console.log(profileFields.skills);
    // res.send("Hello");
  }
);

// Get all profiles and profile by user ID
// @route Get api/profile
//  @desc  Get All profile
// @access  Public

router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route Get api/profile/user/:user_id
//  @desc  Get profile by User ID
// @access  Public

router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);
    if (!profile) {
      return res.status(400).json({ msg: "Profile Not found" });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile Not found" });
    }
    res.status(500).send("Server error");
  }
});

//Delete profile and user

// @route DELETE api/profile
//  @desc  delete profile, user and posts
// @access  private

// beacause this private so we have to access token for which we actully have to add here to auth middleware
router.delete("/", auth, async (req, res) => {
  try {
    //remove profile
    await Profile.findOneAndRemove({ user: req.user.id });
    // Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// @route PUT api/profile/experience
//  @desc  Add profile experience
// @access  private

router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { title, company, location, from, to, current, description } =
      req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route DELETE api/profile/experience
//  @desc  delete profile experience
// @access  private

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);
    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
