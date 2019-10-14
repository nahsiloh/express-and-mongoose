const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const Owner = require("../models/Owner");

router.get("/", async (req, res, next) => {
  try {
    const owners = await Owner.find();
    res.send(owners);
  } catch (err) {
    next(err);
  }
});

router.post("/new", async (req, res, next) => {
  try {
    const owner = new Owner(req.body);
    // const newOwner = req.body;
    // const addOwner = new Owner(newOwner);

    // const bcrypt = require("bcryptjs");
    // const rounds = 10;
    // owner.password = await bcrypt.hash(owner.password, rounds);

    await Owner.init();
    const newOwner = await owner.save();
    res.send(newOwner);
  } catch (err) {
    if (err.name === "ValidationError") {
      err.status = 400;
    }
    next(err);
  }
});

//login that takes in username and password
//find username, match password, return 200 ok/ message
//res.send("You are logged in")
router.post("/login", async (req, res, next) => {
  try {
    const { userName, password } = req.body;
    const owner = await Owner.findOne({ userName });

    const bcrypt = require("bcryptjs");
    const result = await bcrypt.compare(password, owner.password);
    if (!result) {
      throw new Error("Login failed");
    }

    const token = jwt.sign(
      { name: owner.userName },
      process.env.JWT_SECRET_KEY
    );
    res.cookie("token", token);
    // console.log(token);

    res.send(owner);
  } catch (err) {
    if (err.message === "Login failed") {
      err.status = 400;
    }
    next(err);
  }
});

//created the protectedRoute middleware to replace this check s
// router.get("/secret", (req, res, next) => {
//   // console.log(req.headers);
//   try {
//     if (!req.cookies.token) {
//       throw new Error("Go Away!");
//     }
//     const user = jwt.verify(req.cookies.token, "abcde");
//     res.send(`Hello ${user.name}`);
//   } catch (err) {
//     err.status = 401;
//     next();
//   }
// });

//middleware to create a protected route
const protectedRoute = (req, res, next) => {
  try {
    if (!req.cookies.token) {
      throw new Error("Go Away!");
    }
    req.user = jwt.verify(req.cookies.token, process.env.JWT_SECRET_KEY);
    next();
  } catch (err) {
    res.status(401).end("You are not authorised");
  }
};

router.get("/:userName", protectedRoute, async (req, res, next) => {
  const userName = req.params.userName;
  const regex = new RegExp(userName, "gi");
  try {
    const owners = await Owner.find({ userName: regex });
    // console.log(owners[0].fullName);
    res.send(owners);
  } catch (err) {
    next(err);
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("token").send("You are now logged out!");
});

module.exports = router;
