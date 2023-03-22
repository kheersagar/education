const { generateAccessToken, generateRefreshToken } = require("../helpers/generateToken")
const User = require("../Schema/UserSchema")
const userSession = require('../Schema/sessions')
const bcrypt = require('bcrypt')
const { decodeJwt } = require("../helpers/decodeToken")

const register = async (req,res)=>{
  try{
    const {username} = req.body
    const isUserExist = await User.findOne({username})
    if(isUserExist){
      return res.status(403).send("User Already Exists")
    }
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
      // delete password from response data
      const {password,...responseData} = result._doc
      res.send({
        token: token,
        data:responseData
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

const logout = async (req,res) =>{
  try{
    const token = req.headers['x-access-token'];
    const {_id:userID} =  decodeJwt(token)
  
    await userSession.findOneAndDelete({user_id:userID})
    res.send("Log out Successfully")
  }catch(err){
    console.log(err)
    res.status(500).send("Internal Server Error")
  }
}

module.exports = {login,register,logout}