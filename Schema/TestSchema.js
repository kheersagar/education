const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const userSchema = new Schema({
  user_ID: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  marks_obtained: Number,
  wrong_ansuwers: Number,
  correct_answers: Number,
  questions_ID:[
    {type: Schema.Types.ObjectId }
   ],
  recommend_questions: [
    {
      question: String,
      interval_days: Number,
      point :[]
    },
  ],
  test_date: {
    type: Date,
    default: () => new Date(),
  },
});

const Test = mongoose.model("test", userSchema);

module.exports = Test;
