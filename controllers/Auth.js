const User = require("../models/User");
const Profile = require("../models/Profile");
const OTP = require("../models/OTP");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
require("dotenv").config()
const passwordUpdated = require("../mail/Templates/passwordUpdated")




exports.signup = async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      password,
      confirmpassword,
      accountType,
      otp,
    } = req.body;

    // 1. Check empty fields
    if (
      !firstname ||
      !lastname ||
      !email ||
      !password ||
      !confirmpassword ||
      !accountType ||
      !otp
    ) {
      return res.status(400).json({ message: "Please fill all the fields." });
    }

    // 2. Check password match
    if (password !== confirmpassword) {
      return res.status(400).json({ message: "Passwords do not match." });
    }

    // 3. Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "Email already exists.",
        success: false,
      });
    }

    // 4. Validate OTP
    const response = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);

    if (response.length === 0) {
      return res.status(400).json({
        success: false,
        message: "OTP is invalid",
      });
    }

    if (String(response[0].otp) !== String(otp) ){
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP" });
    }

    // 5. Create empty profile
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      phoneNo: null,
    });

    // 6. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 7. Create user
    const user = await User.create({
      firstname,
      lastname,
      email,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstname} ${lastname}`,
      
    });

    return res.status(200).json({
      success: true,
      message: "User created successfully",
      user,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter both email and password"
            })
        }
        const user = await User.findOne({ email }).populate("additionalDetails")
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "account not found"
            })
        }

        if (await bcrypt.compare(password, user.password)) {
            const token = jwt.sign(
                { email: user.email,
                     id: user._id,
                      role: user.accountType },
                process.env.JWT_SECRET,
                {
                    expiresIn: "24h"
                }

            )


            user.token = token
            user.password = undefined

            const options = {
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000 * 3),
                httpOnly: true
            }
            res.cookie("token", token, options).status(200).json({
                success: true,
                user:user,
                token,
                message: `user login success`,
            })

        } else {
            return res.status(400).json({
                success: false,
                message: "password incorrect"
            })
        }
    }
    catch (error) {
        console.log(error)
        return res.status(400).json({
            success: false,
            message: "Invalid credentials",
            error:error.message

        })
    }
}


exports.sendOTP = async (req, res) => {
    try {
        const { email } = req.body

        //check if user is present
        //find user with email
        const checkUserPresent = await User.findOne({ email })
        if (checkUserPresent) {
            return res.status(401).json({
                message: "User already exists",
                success: false,
            })
        }
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        })

        //result is for generating the otp
        const result = await OTP.findOne({
            otp: otp
        })
        console.log(otp);
        console.log(result);
        while (result) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,

            })
        }

        const otpPayload = { email, otp }
        const otpBody = await OTP.create(otpPayload)
        console.log(otpBody);
        res.status(200).json({
            message: "OTP sent successfully",
            success: true,
            otp,
        })
    }
    catch (err) {
        console.log(err.message);
        return res.status(500).json({ success: false, err: err.message })
    }
}

exports.changePassword = async (req, res) => {
    try {
        const userDetails = await User.findById(req.user.id)
        const { oldPassword, newPassword } = req.body

        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password
        )

        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Old password is incorrect",
                success: false,
            })
        }

        const encryptedPassword = await bcrypt.hash(newPassword, 10)
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword },
            { new: true },
        )

        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                "Password for your account has been updated",
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstname} ${updatedUserDetails.lastname}`

                ))
            console.log("email sent successfully", emailResponse.response)
        }
        catch (error) {
            console.log(error.message)
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
            })
        }
        return res
            .status(200)
            .json({ success: true, message: "Password updated successfully" })

    }
    catch (err) {
        console.log(err.message)
        return res.status(400).json({
            success: false,
            message: "password can't be changed"
        })
    }
}
