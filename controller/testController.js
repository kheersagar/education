const axios = require("axios");
var moment = require('moment'); // require

const { decodeJwt } = require("../helpers/decodeToken");
const question = require("../Schema/QuestionSchema");
const Test = require("../Schema/TestSchema");
const user = require("../Schema/UserSchema");
const Revision = require("../Schema/RevisionSchema");

const getQuestions = async (req,res)=>{
  try{
    const result  = await question.aggregate([{ $sample: { size: 10 } }]) //to get random samples from the db
    res.send(result)
  }catch(err){
    console.log(err)
    res.status(500).send(err.message)
  }
}
const getDate = (date) =>{
  date = new Date(date)
  return date.getDate()+ '/' + Number(date.getMonth() +1)  + '/'+ date.getFullYear();
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
      return {...item.result[0], interval_days: item.interval.interval_score,attempt_date: new Date(new Date().getTime()+(item.interval.interval_score*24*60*60*1000)) ,point: item.interval.point}
    })
    //  updating test record in test schema
    const r = finalResult.map(async (item,index)=>{
     const qID = await question.findOne({question: item.question}) 
     const update = await Revision.updateOne({attempt_date : getDate(item.attempt_date)},{ user_ID: userID,
      $addToSet: {questions_ID : qID._id} // adds only unique elements
     },{ upsert: true, new: true, setDefaultsOnInsert: true })
   })
    await Promise.all(r)

    const test = await Test.create({
      user_ID: userID,
      marks_obtained: marks_obtained,
      wrong_ansuwers,
      correct_answers, 
      questions_ID,
    })
    // update user test records in the db
    await user.findByIdAndUpdate(userID,{$push:{test_information : test._id}})
    const userData = await user.findOne({_id: userID}).populate('test_information')

    let count = 0
    //summation of each test total marks
    userData.test_information.forEach((item)=>{
      count+=item.questions_ID.length
    })

    userData.total_score = (marks_obtained + userData.total_score) 
    userData.overall_score = userData.total_score / count
    userData.save()

    res.send({
      marks_obtained :marks_obtained, 
      testResult: testResult,
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

const getRevisionTest = async(req,res)=>{
  try{

    const token = req.headers['x-access-token'];
    const {_id:user_ID} =  decodeJwt(token)

    const result = await Revision.find({user_ID}).populate('questions_ID')
    result.sort((a,b)=>{
     return  moment(a.attempt_date).isAfter(moment(b.attempt_date)) ? 1 : -1
    })
    res.send(result)
  }catch(err){
  console.log(err)
  res.status(500).send(err.message)
}
}
module.exports = { getQuestions,submitTest,getTestInformation,getRevisionTest };
