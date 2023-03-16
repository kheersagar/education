const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv").config();
const app = express();
const database = require('./mongoDB_connection');
const authRouter = require("./routes/authRoute");
const userRouter = require("./routes/user");
const { tokenCheck } = require("./middleware/Tokencheck");
const PORT = process.env.PORT || 6000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

app.use("/auth",authRouter)

app.use(tokenCheck)
app.use("/user",userRouter)

database();


app.listen(PORT, () => {
  console.log(
    "-------------server started on port " + PORT + " -----------------"
  );
});