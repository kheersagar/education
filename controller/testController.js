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
    const { questions, userID, testID } = req.body;
    // console.log(req.body)
    let recommend = questions.map(async (item, index) => {
      const result = await axios.post("https://repeatation.onrender.com/recommend", {
        question: item.data,
        n: 1,
      });
      // console.log(...result.data);
      return result.data
    });
    recommend = await Promise.all(recommend)
    const finalResult = recommend.map((item,index)=>{
      return item[0]
    })
    res.send(finalResult);
  } catch (err) {
    console.log(err);
    res.status(500).send(err.message);
  }
};

module.exports = { getQuestions,submitTest };
