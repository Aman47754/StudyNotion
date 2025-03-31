const mongoose=require('mongoose');
const mailSender=require('../utils/mailSender')
const OTPSchema= new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:true,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60,
    }
})

// a function to send email
async function sendVerificationEmail(email,otp){
     try {
        const mailResponse= await mailSender(email,"Verification email from studynotion",otp);
        console.log("email send successfully",mailResponse);

     } catch (error) {
        console.log("error occured while sending mail",error);
        throw error;
     }
}
//pre middlewares
OTPSchema.pre("save", async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})

models.exports =mongoose.model('OTP',OTPSchema);