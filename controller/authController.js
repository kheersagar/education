const { generateAccessToken, generateRefreshToken } = require("../helpers/generateToken")
const User = require("../Schema/UserSchema")
const userSession = require('../Schema/sessions')
const bcrypt = require('bcrypt')

const register = async (req,res)=>{
  try{
    const result = await User.create(req.body)
    res.send('Successfully Registered')
    }catch(err){
      console.log(err.message)
      res.status(500).send(err.message)
    }
}
const login = async (req,res)=>{
  const { username, password } = req.body;
  try{
    const result = await User.findOne({ username: username});
    if(!result){
      res.status(400).send("No user found!")
    }else{
    if (result && await bcrypt.compare(password, result.password)){
      const jwtEncryptData = {
        'username' : result.username,
        '_id'  : result._id,
      }
  
      const token = generateAccessToken(jwtEncryptData)
      const refreshToken = generateRefreshToken(jwtEncryptData)
      await userSession.deleteMany({user_id: result._id})
      await userSession.create({
        user_id: result._id,
        refreshToken: refreshToken
      })
      res.send({
        token: token,
        data:result
      })
    }else{
      res.status(401).send("Invalid password")
    }
  }
  }catch(err){
    console.log(err)
    res.status(401).send(err.message)
  }
}

module.exports = {login,register}