const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//defining the Schema and model
//creating a schema
const ownerSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  // salutation: { type: String, enum: ["Mr", "Mrs", "Ms", "Mdm", "Miss"] }
  userName: { type: String, required: true, index: true, unique: true },
  password: { type: String, required: true, minlength: 8 }
  //can add select:false which hide fields when querying documents
});

// ownerSchema.virtual("fullName").get(function() {
//   return `${this.salutation} ${this.firstName} ${this.lastName}`;
// });

ownerSchema.pre("save", async function(next) {
  const rounds = 10;
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

//creating a model
//this is the collection
const Owner = mongoose.model("Owner", ownerSchema);

module.exports = Owner;
