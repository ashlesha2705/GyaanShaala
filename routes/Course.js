const express=require("express")
const router =express.Router()

const {createCourse,getSpecificCourseDetails,showAllCourses}=require("../controllers/Course")

const {auth,isInstructor}=require("../middlewares/auth")

router.post("/createCourse",auth,isInstructor,createCourse)
router.get("/getAllCourses",showAllCourses)
router.post("/getCourseDetails",getSpecificCourseDetails)

module.exports = router

