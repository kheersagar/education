const mongoose  = require("mongoose");

 function mongoDB(){
  mongoose.connect(process.env.MONGODB_URL,{dbName:'Education'});
  const db = mongoose.connection;
  db.on('error',()=>{
    console.log("error while connecting to mongoDB");
  });
  db.once('open',()=>{
    console.log("connected to MongoDb");
  })
}

module.exports  = mongoDB;