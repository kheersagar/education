const axios = require("axios");
const { decodeJwt } = require("../helpers/decodeToken");
const question = require("../Schema/QuestionSchema");
const user = require("../Schema/UserSchema");

const getQuestions = async (req,res)=>{
  try{
    const result  = await question.aggregate([{ $sample: { size: 10 } }]) //to get random samples from the db
    res.send(result)
  }catch(err){
    console.log(err)
    res.status(500).send(err.message)
  }
}
const submitTest = async (req, res) => {
  try {
    const { questions, testID } = req.body;
    const token = req.headers['x-access-token'];
    const {_id:userID} =  decodeJwt(token)
    // console.log(req.body)
    let marks_obtained = 0, testResult= [],correct_answers = 0 ,wrong_ansuwers=0;
    let recommend = questions.map(async (item, index) => {
      const answers = await question.findOne({_id:item.id})
      // calculate user's performance
      testResult.push({
        ...answers._doc,
        userAnswer: item.answer,
        status : answers.answer == item.answer ? "Correct" : "Wrong"
      })
      // calculate total marks
      if(answers.answer == item.answer){
        marks_obtained +=1
        correct_answers +=1
      }else{
        wrong_ansuwers +=1
      }
      // get recommendation from the model
      const result = await axios.post("https://repeatation.onrender.com/recommend", {
        question: item.data,
        n: 1,
      });
      return result.data
    });
    // resolving all promises
    recommend = await Promise.all(recommend)
    // formatting the response of model
    const finalResult = recommend.map((item,index)=>{
      return item[0]
    })

    // update user test records in the db
    await user.findByIdAndUpdate(userID,{$push : {"test_information":{
      marks_obtained: marks_obtained,
      wrong_ansuwers,
      correct_answers, 
      recommend_questions:finalResult
    }}})
    res.send({
      marks_obtained :marks_obtained, 
      testResult: testResult,
      "recommend_questions":finalResult
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
};

module.exports = { getQuestions,submitTest };
