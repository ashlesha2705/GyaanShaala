const { instance } = require("../config/razorpay")
const Course = require("../models/Course")
const crypto = require("crypto")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const mongoose = require("mongoose")
const { courseEnrollmentEmail, } = require("../mail/Templates/courseEnrollment")
const { paymentSuccessEmail } = require("../mail/Templates/paymentSuccessfulEmail")
const CourseProgress = require("../models/CourseProgress")
const e = require("express")

exports.capturePayment = async (request, response) => {
    const { courses } = request.body
    const userId = request.user.id
    if (courses.length === 0) {
        return response.status(400).json({ message: "No courses selected" })
    }
    let total_amount = 0

    for (const course_id of courses) {
        let course
        try {
            course = await Course.findById(course_id)
            if (!course) {
                return response.status(400).json({ message: "Course not found" })
            }
            const uid = new mongoose.Types.ObjectId.createFromHexString(userId)

            if (course.studentsEnrolled.includes(uid)) {
                return response.status(400).json({ message: "Course already enrolled" })
            }

            total_amount += course.coursePrice

        }

        catch (error) {
            console.log(error.message)
            return response.status(500).json({ message: "Internal server error" })
        }
    }
    const options={
        amount:total_amount*100,
        currency:"INR",
        receipt: `${userId}_${Date.now()}`,

    }
    try{
        const paymentResponse=await instance.orders.create(options)
        console.log(paymentResponse)
        response.json({
            success:true,
            data:paymentResponse
        })
    }
    catch(error){
        console.log(error.message)
        response.status(500).json({
            success:false,
            message:"Could not initiate order."
        })
    }

}

exports.verifyPayment=async(request ,response)=>{
    const razorpay_order_id=request.body?.razorpay_order_id
    const razorpay_payment_id=request.body?.razorpay_payment_id
    const razorpay_signature=request.body?.razorpay_signature
    const courses=request.body?.courses
    const userId=request.user.id
    if(!razorpay_order_id,razorpay_payment_id,razorpay_signature,courses,userId){
        return response.status(400).json({ message: "Invalid request" })
    }
    let body=razorpay_order_id+"|"+razorpay_payment_id

    const expectedSignature=crypto.createHmac("sha256",process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex")

    if(expectedSignature===razorpay_signature)
    {
        await enrollStudents(courses,userId,res)
        return response.status(200).json({
            success:true,
            message:"Payment verified successfully"

        })

    }
    return response.status(400).json({
        success:false,
        message:"Invalid signature"
    })

}

exports.sendPaymentSuccessEmail=async(request ,response)=>{
    const {orderId, paymentId, amount}=request.body
    const userId=request.user.id
    if(!orderId,paymentId,amount,userId){
        return response.status(400).json({ message: "Invalid request" })
    }
    try{
        const enrolledStudent=await User.findById(userId)

        await mailSender(enrolledStudent.email,
            `Payment Received`,
            paymentSuccessEmail(`${enrolledStudent.firstname} ${enrolledStudent.lastname}`,
            amount/100,
            orderId,
            paymentId
            )
        )
    
    }
    catch(error){
        console.log("error in sending mail", error)
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" })
  }
    

}

const enrollStudents=async(courses,userId,res)=>{
    if(!courses||!userId){
        return response.status(400).json({ message: "Invalid request" })
    }

    for(const courseId of courses){
        try{
           const enrolledCourse=await Course.findOneAndUpdate(
            {_id:courseId},
            {$push:{studentsEnrolled:userId}},
            {new:true}
           )
           if(!enrolledCourse){
            return response.status(400).json({ message: "Course not found" })
           }
           console.log("Updated course:",enrolledCourse)

           const newCourseProgress=await CourseProgress.create({
            userId:userId,
            courseId:courseId,
            completedVideos:[],
         })
         const enrolledStudent=await User.findByIdAndUpdate(
            userId,
            {$push:{courses:courseId,courseProgress:courseProgress._id,},},
            {new:true}
         )

         const emailResponse=await mailSender(
            enrolledStudent.email,
            `successfully enrolled into ${enrolledCourse.courseName}`,
            courseEnrollmentEmail(
                enrolledCourse.courseName,
                `${enrolledStudent.firstname} ${enrolledStudent.lastname}`
            )
         )
        }
        catch(error){
            console.log("error in enrolling student", error)
            return response.status(400).json({ message: "Could not enroll student" })
        }
    }
}

