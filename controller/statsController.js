const { decodeJwt } = require("../helpers/decodeToken");
const user = require("../Schema/UserSchema");

const userStats = async (req,res)=>{
  try{
    const token = req.headers['x-access-token'];
    const {_id:userID} =  decodeJwt(token)
  
    const userData = await user.findById(userID).populate('test_information');
    const responseData = {
      last_score : userData.test_information.length > 0  ? userData.test_information[userData.test_information.length -1].marks_obtained : 0,
      overall_score : userData.overall_score * 100
    }
    res.send(responseData)
  }catch(err){
    console.log(err)
    res.status(500).send('Internal Server Error')
  }
}

module.exports = {userStats}