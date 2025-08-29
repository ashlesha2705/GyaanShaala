const Course=require("../models/Course")
const User=require("../models/User")
const Section=require("../models/Section")
const Category = require("../models/Category")
const { imageUploader } = require("../utils/imageUploader")

exports.createCourse=async(req ,res)=>{
    try{
        const userId=req.user.userId
        let{
            courseName,
            courseDescription,
            Whatyouwilllearn,
            price,
            tag:_tag,
            category,
            status,
            instruction:_instructions,
        }=req.body

        //get thumbnail image from request files
        const thumbnail=req.files.thumbnailImage

        //convert tag and instructions from string array to array
        const tag=JSON.parse(_tag)
        const instructions=JSON.parse(_instructions)

        console.log("tag",tag)

        if(
            !courseName||!courseDescription||!Whatyouwilllearn||!price||!tag.length||!thumbnail||!category||!instructions.length
        ){
            return res.status(400).json({message:"Please fill all the fields"})
        }
        if(!status||status===undefined){
            status="Draft"
        }

        //check if the user is instructor
        const instructorDetails=await User.findById(userId,{
            accountType:"Instructor"
        })
        if(!instructorDetails){
            return res.status(400).json({message:"You are not an instructor"})
        }

        //check if given tag is valid
        const categoryDetails=await Category.findById(category)
        if(!categoryDetails){
            return res.status(400).json({message:"Invalid category"})
        }

        const thumbnailImage=await imageUploader(
            thumbnail,
            process.env.FOLDER_NAME
        )
        console.log(thumbnailImage)

        const newCourse=await Course.create({
            courseName,
            courseDescription,
            instructor:instructorDetails._id,
            whatYouWillLearn:Whatyouwilllearn,
            price,
            tag,
            category:categoryDetails._id,
            thumbnail:thumbnailImage.secure_url,
            status:status,
            instructions:instructions
        })
        const categoryDetails2=await category.findByIdAndUpdate(
            {_id:category},
            {
                $push:{
                    courses:newCourse._id
                }
            },
            {new :true}
        )
         console.log( categoryDetails2)
    // Return the new course and a success message
    res.status(200).json({
      success: true,
      data: newCourse,
      message: "Course Created Successfully",
    })

    }
    catch(Error){
        console.log(Error.message)
        return res.status(500).json({message:Error.message})
    }
}

exports.showAllCourses=async(Request,Response)=>{
    try{
        const allCourses=await Course.find({},{
            courseName:true,
            price:true,
            thumbnail:true,
            category:true,
            courseDescription:true,
            courseImage:true
        })
        return res.status(201).json({
            success:true,
            data:allCourses,
            
        })
    }


    catch(error){
        console.log(error.message)
        return res.status(500).json({message:error.message})
    }
}

exports.getSpecificCourseDetails=async(req,res)=>{
    try{
        const {courseID}=req.body
        const courseDetails=await Course.findById({_id:courseID})
                            .populate({
                                path:'Instructor',
                                populate:{
                                    path:'additionalDetails'
                                }
                            })
                            .populate("category")
                            .populate("RatingandReviews")
                            .populate("courseImage")
                            .populate({
                                path:"courseContent",
                                populate:{
                                    path:"subSection",
                            },
                            })
                            .exec()

        if(!courseDetails){
            return res.status(404).json({message:"Course not found"})

        }
        return res.status(200).json({
            success:true,
            data:courseDetails,
        })

    }
    catch(error){
        console.log(error.message)
        return res.status(500).json({message:error.message})
    }
}