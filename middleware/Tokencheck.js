const jwt = require("jsonwebtoken");
const { generateAccessToken } = require("../helpers/generateToken");
const userSession = require("../Schema/sessions");

const tokenCheck = async (req,res,next) =>{
  const token = req.headers['x-access-token'];
  console.log(req.headers)
  if (token === null) res.status(403).send("No Token Found");

  try {
    const isValid = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (isValid) {
      const isUser = await userSession.findOne({user_id:isValid._id})
      if(isUser){
        res.setHeader('x-access-token',generateAccessToken({
          'username' : isValid.username,
          '_id'  : isValid._id,
          'role':isValid.role
        }))
        next();
      }else{
        res.setHeader('logout',true)
        res.status(403).send("Invalid Token")
      }
    }
  } catch (err) {
    console.log(err.message);
    res.setHeader('logout',true)
    res.status(401).send(err.message);
  }
}

module.exports ={tokenCheck}