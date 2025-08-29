const mongoose = require('mongoose');
const mailSender=require('../utils/mailSender.js')
const otpTemplate=require('../mail/Templates/emailVerification.js')
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  otp: {
    type: Number,
    required: true
    },
  createdAt:{
    type:Date,
    default:Date.now(),
    expires:5*60,
  }
});

async function sendVerificationMail(email,otp){
    try{
        const mailresponse=await mailSender(email,"verification mail",otpTemplate(otp));
        console.log("email sent successfully",mailresponse);
    }
    catch(err){
        console.log(err.message);
        throw err
    }
    
}
otpSchema.pre("save",async function (next){
    await sendVerificationMail(this.email,this.otp);
    next();
})
module.exports = mongoose.model('OTP', otpSchema);