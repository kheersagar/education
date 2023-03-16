const axios = require("axios");
const question = require("../Schema/QuestionSchema");

const getQuestions = async (req,res)=>{
  try{
    const result  = await question.find({}).limit(10)
    res.send(result)
  }catch(err){
    console.log(err)
    res.status(500).send(err.message)
  }
}
const submitTest = async (req, res) => {
  try {
    const { questions, testID } = req.body;
    // console.log(req.body)
    let totalMarks = 0, testResult= [];
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
        totalMarks +=1
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
    res.send({
      totalMarks :totalMarks, 
      testResult: testResult,
      "recommendedQuestion":finalResult
    });
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
};

module.exports = { getQuestions,submitTest };
