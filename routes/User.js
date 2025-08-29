const express=require("express")
const router=express.Router()

const {
    login,
    signup,
    sendOTP,
    changePassword
}=require("../controllers/Auth")
const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword")

const {auth}=require("../middlewares/auth")

router.post("/login",login)

router.post("/signup",signup)

router.post("/sendOTP",sendOTP)

router.post("/changepasword",changePassword)

router.post("/reset-password-token",resetPasswordToken)

router.post("/reset-password",resetPassword)

module.exports = router
