const {contactUsEmail}=require("../mail/Templates/contactFormResponse")
const mailSender=require("../utils/mailSender")

exports.contactUsController=async(request ,response)=>{
    try{
        const {name,email,subject,message,phoneNo,countrycode}=request.body

        console.log(request.body)
        const emailResponse=await mailSender(
            email,
            "Your data send successfully",
            contactUsEmail(name,email,subject,message,phoneNo,countrycode)
        )
        console.log(emailResponse)
        return response.status(200).json({message:"Data send successfully"})
    }
    catch(error){
        console.log(error)
        return response.status(500).json({message:"Internal Server Error"})
        
    }
}