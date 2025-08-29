const RatingandReview=require("../models/RatingandReview")
const Course=require("../models/Course")
const {mongo,default:mongoose}=require("mongoose")
exports.createRating=async(request,response)=>{
    try{
        const userId=request.user.id;

        const {rating,review,courseId}=request.body;

        const courseDetails=await Course.findOne({_id:courseId,
            studentsEnrolled:{$elemMatch:{$eq:userId}},
        })
        if(!courseDetails){
            return response.status(404).json({message:"Course not found"})
        }
        const alreadyReviewed=await RatingandReview.findOne({
            user:userId,
            course:courseId,
        })
        if(alreadyReviewed){
            return response.status(400).json({message:"You have already reviewed this course"})
        }
        const ratingReview=await RatingandReview.create({
            rating,review,course:courseId,
            user:userId,
        })
        const updatedCourseDetails=await Course.findByIdAndUpdate({_id:courseId},
            {
                $push:{
                    RatingandReviews:ratingReview._id
                }
            },
            {new:true}
        );
        return response.status(201).json({message:"Rating and review created successfully"})
    }
    catch(error){
        console.log(error)
        return response.status(200).json({
            message:"error reviewing course",
            success:false,
        })
    }
}

exports.getAverageRating=async(request,response)=>{
    try{
        const courseId=request.body.courseId;

        const result=await RatingandReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),
                }
            },
            {
                $group:{
                    _id:null,
                    averageRating:{$avg:"$rating"},
                }
            }
        ])
        if(result.length>0){
            return response.status(200).json({message:result[0].averageRating})
        }

        return response.status(200).json({
            success:true,
            message:"average rating is 0,no rating given till now",
            averageRating:0,
        })
    }
    catch(error){
        console.log(error)
        return response.status(500).json({
            message:"Error fetching average rating",
            success:false,
        })
    }
}

exports.getAllRating = async (req, res) => {
    try{
            const allReviews = await RatingAndReview.find({})
                                    .sort({rating: "desc"})
                                    .populate({
                                        path:"user",
                                        select:"firstName lastName email image",
                                    })
                                    .populate({
                                        path:"course",
                                        select: "courseName",
                                    })
                                    .exec();
            return res.status(200).json({
                success:true,
                message:"All reviews fetched successfully",
                data:allReviews,
            });
    }   
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    } 
}