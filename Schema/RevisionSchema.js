const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const revisionSchema = new Schema({
  user_ID: {
    type: Schema.Types.ObjectId,
    ref: "user",
  },
  attempt_date: String,
  questions_ID: [{ type: Schema.Types.ObjectId, ref: "question" }],
});

const Revision = mongoose.model("revision", revisionSchema);

module.exports = Revision;
