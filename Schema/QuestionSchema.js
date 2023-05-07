const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const questionSchema = new Schema({
  question:{
    type: String,
  },
  option1:{
    type: String,
  },
  option2:{
    type: String,
  },
  option3:{
    type: String,
  },
  option4:{
    type: String,
  },
  level:{
    type: String,
  },
  answer:{
    type: String,
  },
  year:{
    type: String,
  },
  shift:{
    type: String,
  },
  topic:{
    type: String,
  },
  subtopic:{
    type :String
  }
});

const question = mongoose.model("question", questionSchema);


module.exports = question;
