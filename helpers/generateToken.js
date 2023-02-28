const jwt = require("jsonwebtoken");

const generateAccessToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1d",
    });
    return token;
  } catch (err) {
    console.log(err);
  }
};
const generateRefreshToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "1y",
    });
    return token;
  } catch (err) {
    console.log(err);
  }
};
const verifyToken = (req, res, next) => {
  token = req.body.token;
  if (token === null) res.status(403).send("No Token Found");

  try {
    const isValid = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (isValid) {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(401).send("invalid token");
  }
};

const verifyRefreshToken = (req, res, next) => {
  token = req.body.token;
  if (token === null) res.status(403).send("No Token Found");

  try {
    const isValid = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    if (isValid) {
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(401).send("invalid token");
  }
};
module.exports = {generateAccessToken,verifyToken,generateRefreshToken,verifyRefreshToken}