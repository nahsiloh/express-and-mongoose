const express = require("express");
const router = express.Router();

const Owner = require("../models/Owner");

router.post("/new", async (req, res, next) => {
  const newOwner = req.body;
  const addOwner = new Owner(newOwner);

  try {
    await Owner.init();
    await addOwner.save();
    res.send(addOwner);
  } catch (err) {
    if (err.name === "ValidationError") {
      err.status = 400;
    }
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const Owners = await Owner.find();
    res.send(Owners);
  } catch (err) {
    next(err);
  }
});

router.get("/:name", async (req, res, next) => {
  const name = req.params.name;
  const regex = new RegExp(name, "gi");
  try {
    const Owners = await Owner.find({ firstName: regex });
    console.log(Owners[0].fullName);
    res.send(Owners);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
