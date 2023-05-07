const axios = require("axios");
const { decodeJwt } = require("../helpers/decodeToken");
const question = require("../Schema/QuestionSchema");
const Test = require("../Schema/TestSchema");
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
    let marks_obtained = 0, testResult= [],correct_answers = 0 ,wrong_ansuwers=0,questions_ID = [];
    let recommend = questions.map(async (item, index) => {
      const data = await question.findOne({_id:item.id})
      // calculate user's performance
      questions_ID.push(item.id)
      testResult.push({
        ...data._doc,
        userAnswer: item.answer,
        status : data.answer == item.answer ? "right" : "wrong"
      })
      // calculate total marks
      if(data.answer == item.answer){
        marks_obtained +=1
        correct_answers +=1
      }else{
        wrong_ansuwers +=1
      }
      // get recommendation from the model
      const result = await axios.post("https://repeatation.onrender.com/recommend", {
        question: data.question,
        n: 1,
      });
      const intervalScore = await axios.post("https://repeatation.onrender.com/calculate_score",{
        level: data.level,
        is_correct: data.answer == item.answer ? "right" : "wrong",
        "point": [
            -1
        ]
      })
      return {result : result.data , interval : intervalScore.data}
    });
    // resolving all promises
    let data = await Promise.all(recommend)
    // formatting the response of model
    const finalResult = data.map((item,index)=>{
      return {...item.result[0], interval_days: item.interval.interval_score,point: item.interval.point}
    })
    //  updating test record in test schema
    const test = await Test.create({
      user_ID: userID,
      marks_obtained: marks_obtained,
      wrong_ansuwers,
      correct_answers, 
      questions_ID,
      recommend_questions:finalResult
    })
    // update user test records in the db
    await user.findByIdAndUpdate(userID,{$push:{test_information : test._id}})
    const userData = await user.findOne({_id: userID})
    console.log(userData)
    userData.total_score = (marks_obtained + userData.total_score) 
    userData.overall_score = userData.total_score / (userData.test_information.length *10)
    userData.save()

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

const getTestInformation = async (req,res) =>{
  try{
    const {id} = req.params;
    const responseData = await Test.findById(id)
    if(!responseData){
      return res.status(400).send("Invalid Test ID")
    }
    res.send(responseData);
  }catch(err){
    console.log(err)
    res.status(500).send("Internal Server Error")
  }

}

const getRecommendedQuestions = async (req,res)=>{
  try{

    const token = req.headers['x-access-token'];
    const {_id:user_ID} =  decodeJwt(token)
  
    const result  = await Test.find({user_ID})
    const ques = []
    const recommended_questions = result.map((item,index)=>{
      ques.push(...item.recommend_questions)
    })
    res.send({recommended_questions: ques})
  }catch(err){
  console.log(err)
  res.status(500).send(err.message)
}
}
module.exports = { getQuestions,submitTest,getTestInformation,getRecommendedQuestions };
