const Section=require("../models/Section")
const Subsection=require("../models/Subsection")
const Course=require("../models/Course")

exports.createSection=async(Request ,Response)=>{
    try{
        const {sectionName,courseId}=Request.body

        if(!sectionName||!courseId){
            return Response.status(400).json({message:"Please fill all fields"}
            )
        }

        const newSection=await Section.create({sectionName})
        const updatedCourse=await Course.findByIdAndUpdate(courseId,
            {$push:{courseContent:newSection._id,},},
            {new:true})
        .populate({
            path:"courseContent",
            populate:{
                path:"subSection",
            },
        }).exec();

        return Response.status(201).json({message:"Section created successfully",updatedCourse})

    }
    catch(error){
        Response.status(500).json({message:"Internal Server Error"})
    }
}

exports.updateSection=async(req,res)=>{
    try{
        const {sectionName,sectionId,courseId}=req.body
        const section=await Section.findByIdAndUpdate(
            sectionId,
            {sectionName},
            {new:true}
        );
        const course=await Course.findByIdAndUpdate(courseId)
        .populate({
            path:"courseContent",
            populate:{
                path:"subSection",
            },
        })
        .exec();
        return res.status(200).json({message:"Section updated successfully",course})
    }
    catch(error){
        res.status(500).json({message:"Internal Server Error"})
    }
}

exports.deleteSection=async(request ,response)=>{
    try{
        const {sectionId,courseId}=req.body;
        await Course.findByIdAndUpdate(courseId,{
            $pull:{
                courseContent:sectionId
            },
        })
        const section=await Section.findById(sectionId);
        console.log(sectionId,courseId);
        if(!section){
            return response.status(404).json({message:"Section not found"})
        }
        await Section.findByIdAndDelete(sectionId);

        const course=await Course.findById(courseId).populate({
            path:"courseContent",
            populate:{
                path:"subSection",
            }
        })
        .exec();
        return response.status(200).json({message:"Section deleted successfully",course})
    }
    catch(error){
        response.status(500).json({message:"Internal Server Error"})
    }
}