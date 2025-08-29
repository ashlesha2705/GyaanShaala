const mongoose=require("mongoose")

const courseSchema=new mongoose.Schema({
    courseName:{
        type:String,
        required:true,
    },
    courseDescription:{
        type:String,
        required:true
    },
    courseDuration:{
        type:String,
        required:true
    },
    coursePrice:{
        type:Number,
        required:true
    },
    Instructor:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    Whatyouwilllearn:{
        type:String,
        required:true
    },
    RatingandReviews:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"RatingandReview"
        }
    ],
    courseImage:{
        type:String,
        required:true
    },
    courseContent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Section"
}]
,
    Tag:{
        type:[String],
        required:true,
    },
    Category:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Category"
    },
    studentsEnrolled:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }]
})

module.exports=mongoose.model("Course",courseSchema)