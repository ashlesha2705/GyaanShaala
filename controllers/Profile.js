const Profile=require("../models/Profile")
const courseProgress=require("../models/CourseProgress")
const Course=require("../models/Course")
const User=require("../models/User")
const { uploadImageToCloudinary } = require("../utils/imageUploader");

const mongoose=require("mongoose")
const {convertSecondsToDuration}=require("../utils/secToDuration")
const { request } = require("http")

exports.updateProfile=async(request ,response)=>{
    try{
        const {
            firstname="",
            lastname="",
            dateofbirth="",
            about="",
            gender="",
            phoneno=""
        }=request.body
        const id=request.user.id

        const userDetails=await User.findById(id)
        const profile=await Profile.findById(userDetails.additionalDetails)

        const user=await User.findByIdAndUpdate(id,{
            firstname,
            lastname,
        })

        await user.save()

        profile.dateofbirth=dateofbirth
        profile.about=about
        profile.gender=gender
        profile.phoneNo=phoneno

        await profile.save()

        const updatedUserDetails=await User.findById(id)
        .populate("additionalDetails")
        .exec()

        return response.json({
            message:"Profile updated successfully",
            data:updatedUserDetails,
            success:true,
        })

    }
    catch(error){
        console.log(error)
        return response.status(500).json({message:"Internal Server Error"})
    }
}

exports.deleteAccount=async(request,response)=>{
    try{
        const id=request.user.id
        console.log(id)
        const user=await User.findByIdAndDelete({_id:id})
        if(!user){
            return response.status(404).json({message:"User not found"})
        }
        await Profile.findByIdAndDelete({
            _id:new mongoose.Types.ObjectId(user.additionalDetails)
        })
        for(const courseId of user.courses){
            await Course.findByIdAndUpdate(courseId,{$pull:{studentsEnrolled:id}},{new:true})
        }
        await User.findByIdAndDelete({_id:id})
        return response.json({message:"Account deleted successfully",success:true})
        await courseProgress.deleteMany({userId:id})
    }
    catch(error){
        console.log(error)
        return response.status(500).json({
            message:"Internal Server Error"
        })
    }
}

exports.updateDisplayPicture=async(req,res)=>{
    try{
        const id=req.user.id
        const displayPicture=req.files.image
        const image=await uploadImageToCloudinary(
            displayPicture,
            process.env.FOLDER_NAME,
            1000,
            1000
        )
        console.log(image)

        const updatedProfile=await User.findByIdAndUpdate(
            {_id:id},
            {$set:{image:image.secure_url}},{new:true}
            
        )
        res.send({
      success: true,
      message: `Image Updated successfully`,
      data: updatedProfile,
    })
    }
    catch(error){
        console.log(error.message)
        return res.status(500).json({
      success: false,
      message: error.message,
    })
    }
}

exports.getUserDetails=async(req,res)=>{
    try{
        const id = req.user.id
    const userDetails = await User.findById(id)
      .populate("additionalDetails")
      .exec()
    console.log(userDetails)
    res.status(200).json({
      success: true,
      message: "User Data fetched successfully",
      data: userDetails,
    })
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            message:"internal server error"
        })
    }
}