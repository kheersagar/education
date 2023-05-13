const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  first_name: {
    type: String,
  },
  last_name: {
    type: String,
  },
  email: {
    type: String,
    unique: true,
  },
  phone_no: {
    type: Number,
  },
  profile_img: {
    type: String,
  },
  test_information: [{ type: Schema.Types.ObjectId, ref: "test" }],
  total_score: {
    type: Number,
    default: 0,
  },
  overall_score: {
    type: Number,
    default: 0,
  },
});
userSchema.index({ "$**": "text" });
userSchema.pre("save", function (next) {
  var user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified("password")) return next();

  // generate a salt

  // hash the password using our new salt
  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) return next(err);
    // override the cleartext password with the hashed one
    user.password = hash;
    next();
  });
});

const user = mongoose.model("user", userSchema);

module.exports = user;
