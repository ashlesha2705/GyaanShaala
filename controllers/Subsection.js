const Subsection=require("../models/Subsection")
const Section=require("../models/Section")
const {uploadImageToCloudinary}=require("../utils/imageUploader")

exports.createSubsection=async(req ,res)=>{
    try{
        const {sectionId,title,description}=req.body
        const video=req.files.video
        if(!sectionId ||!title||!description||!video){
            return res.status(400).json({message:"Please fill all the fields"})
        }
        console.log(video)
        const uploadDetails=await uploadImageToCloudinary(
            video,
            process.env.FOLDER_NAME

        )
        console.log(uploadDetails)

        const subSectionDetails=await Subsection.create({
            title:title,
            timeDuration:`${uploadDetails.duration}`,
            description:description,
            videoUrl:uploadDetails.secure_url,
        })
        const updatedSection=await Section.findByIdAndUpdate(
            {_id:sectionId},
            {$push:{subSection:subSectionDetails._id}},
            {new:true},
        ).populate("subSection")

        return res.status(201).json({message:"Subsection created successfully",updatedSection})
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            message:"Error creating subsection",
            error:Error
        })
    }
}

exports.updateSubSection=async(req,res)=>{
    try{
        const {sectionId,subSectionId,title,description}=req.body
        const subSection=await Subsection.findById(subSectionId)

        if(!subSection){
            return res.status(404).json({message:"Subsection not found"})
        }

        if(title!==undefined){
            subSection.title=title
        }
        if(description!==undefined){
            subSection.description=description
        }
        if(req.files && req.files.video!==undefined){
            const video=req.files.video
            const uploadDetails=await uploadImageToCloudinary(
                video,
                process.env.FOLDER_NAME
            )
        subSection.videoUrl=uploadDetails.secure_url
        subSection.timeDuration=`${uploadDetails.duration}`
        }
        await subSection.save()

        const updatedSection=await Section.findById(sectionId).populate("subSection")

        return res.status(200).json({message:"Subsection updated successfully",updatedSection})
    }
    catch(error){
        console.log(error)
        return res.status(500).json({
            message:"Error updating subsection",
        })
    }
}