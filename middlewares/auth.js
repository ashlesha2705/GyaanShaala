const jwt=require("jsonwebtoken");
require("dotenv").config();
const User=require("../models/User");

exports.auth=async(req ,res ,next)=>{
    try{
        const token=req.cookies.token||req.body.token||req.header("authorization").replace("bearer","");

        if(!token){
            return res.status(401).json({success:false,message:`Token missing`})
        }
        try{
            const decode =await jwt.verify(token,process.env.JWT_SECRET);
            console.log(decode);
            req.user=decode;
        }
        catch(error){
            return res.status(401).json({success:false,message:"token is invalid"});
            
        }
        next();
    }
    catch(error){

        return res.status(401).json({success:false,message:`something went wrong while validating the token`});
    }
}

exports.isStudent=async(req,res,next)=>{
    try{
        const userDetails=await User.findOne({email:req.user.email});

        if(userDetails.accountType!=="Student"){
            return res.status(401).json({
                success:false,
                message:"You are not a student"
            })
        }
        next();
    }
    catch(error){
        return res.status(401).json({success:false,message:"something went wrong while validating the user"});
    }
}


exports.isInstructor=async(req, res,next)=>{
     try{
        const userDetails=await User.findOne({email:req.user.email});
        console.log(userDetails);

        console.log(userDetails.accountType);
        if(userDetails.accountType!=="Admin"){
            return res.status(401).json({
                success:false,
                message:"You are not an Admin"
                })
     }
     next();
     }
     catch(error){
        return res.status(401).json({success:false,message:"something went wrong while validating the user"})
     }
    }
