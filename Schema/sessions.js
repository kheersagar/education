const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const sessionSchema = new Schema({
  user_id:{
    type: String,
    required :true,
  },
  refreshToken:{
    type: String,
    required :true,

  },
  createdAt:{
    type:Date,
    default : () => new Date()
  },
  updatedAt: {
    type:Date,
    default : () => new Date()
  },
})

sessionSchema.pre('save',function(next){
  this.updatedAt = Date.now()
  next();
})

const userSession = mongoose.model('Session',sessionSchema);
module.exports  = userSession
