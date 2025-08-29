const mongoose=require("mongoose");

const sectionSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    subsection:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Subsection",
        required:true
    }]
})

module.exports=mongoose.model("Section",sectionSchema);
