const mongoose = require("mongoose");

//defining the Schema and model
//creating a schema
const kittySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
    unique: true,
    minlength: 3,
    lowercase: true
  },
  age: { type: Number, min: 0, max: 25 },
  sex: { type: String, enum: ["male", "female"] }
});

//creating a model
//this is the collection
const Kitten = mongoose.model("Kitten", kittySchema);

module.exports = Kitten;
