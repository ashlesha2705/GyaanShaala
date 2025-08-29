const mongoose=require('mongoose');
require('dotenv').config();

function connectDB(){
    mongoose.connect(process.env.MONGODB_URL,{
          useNewUrlParser: true,
  useUnifiedTopology: true,
    })
    .then(()=>{
        console.log('connected to mongodb')
    })
    .catch(err=>console.log(err))
}

module.exports = { connectDB };
