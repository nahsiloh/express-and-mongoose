const mongoose = require("mongoose");

//defining the Schema and model
//creating a schema
const ownerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  salutation: { type: String, enum: ["Mr", "Mrs", "Ms", "Mdm", "Miss"] }
});

ownerSchema.virtual("fullName").get(function() {
  return `${this.salutation} ${this.firstName} ${this.lastName}`;
});

//creating a model
//this is the collection
const Owner = mongoose.model("Owner", ownerSchema);

module.exports = Owner;
