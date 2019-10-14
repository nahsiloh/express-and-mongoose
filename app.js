const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

app.use(cookieParser());
app.use(express.json());

//without using CORS API
// app.use((req, res, next) => {
//   res.set("Access-Control-Allow-Origin", "http://localhost:3000");
//   res.set("Access-Control-Allow-Headers", "content-type");
//   res.set("Access-Control-Allow-Methods", "DELETE")
//   res.set("Access-Control-Allow-Credentials", true);
//   next();
// });

//using the CORS API
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  allowedHeaders: "content-type"
};

app.use(cors(corsOptions));

// console.log(process.env.NODE_ENV, app.get("env"));
if (process.env.NODE_ENV !== "test") {
  require("./db");
}

const kittens = require("./routes/kittens");
app.use("/kittens", kittens);

const owners = require("./routes/owners");
app.use("/owners", owners);

module.exports = app;
