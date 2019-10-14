const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const Kitten = require("../models/Kitten");

router.get("/", async (req, res, next) => {
  try {
    const kittens = await Kitten.find(req.query);
    res.send(kittens);
  } catch (err) {
    next(err);
  }
});

router.get("/:name", async (req, res, next) => {
  const name = req.params.name;
  const regex = new RegExp(name, "gi");
  try {
    const kittens = await Kitten.find({ name: regex });
    res.send(kittens);
  } catch (err) {
    next(err);
  }
});

//creating a new kitten
router.post("/new", async (req, res, next) => {
  const newKitten = req.body;
  const addKitten = new Kitten(newKitten);

  try {
    await Kitten.init();
    await addKitten.save();
    res.send(addKitten);
  } catch (err) {
    if (err.name === "ValidationError") {
      err.status = 400;
    }
    next(err);
  }
});

// update a kitten
router.patch("/:name", async (req, res, next) => {
  const name = req.params.name;
  const regex = new RegExp(name, "gi");
  const newUpdate = req.body;
  const query = { name: regex };
  try {
    await Kitten.findOneAndUpdate(query, newUpdate, {
      new: true
    });
    const kittens = await Kitten.find();
    res.send(kittens);
  } catch (err) {
    next(err);
  }
});

const protectedRoute = (req, res, next) => {
  try {
    if (!req.cookies.token) {
      throw new Error("You cannot adopt a kitten today!");
    }
    req.user = jwt.verify(req.cookies.token, process.env.JWT_SECRET_KEY);
    next();
  } catch (err) {
    res.status(401).end("You are not authorised");
  }
};

//delete a kitten
router.delete("/:name", protectedRoute, async (req, res, next) => {
  const name = req.params.name;
  const regex = new RegExp(name, "gi");
  try {
    await Kitten.findOneAndDelete({ name: regex });
    const kittens = await Kitten.find();
    res.send(kittens);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
