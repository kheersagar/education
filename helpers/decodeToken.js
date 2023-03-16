const jwt  = require("jsonwebtoken")

const decodeJwt = (token) => jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

module.exports = {decodeJwt}