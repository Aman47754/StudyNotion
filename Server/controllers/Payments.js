const { instance } = require("../config/razorpay")
const Course = require("../models/Course")

const User = require("../models/User")
const mailSender = require("../utils/mailSender")

const {courseEnrollmentEmail} = require("../mail/templates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const CourseProgress = require("../models/CourseProgress")

const mongoose = require("mongoose")
const crypto = require("crypto")

// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {

  //get course and userID
  const {courses}=req.body;
  const userId= req.user.id;// since user is logged in so its id will be there in the requiest bcz we have send it in the middlewares in Auth.js

  //validation
  if(!courses){
    return res.status(400).json({
      success:false,
      message:"Please provide the courseID"
    })
  }

  let totalAmount=0;
  //validate courseDetails
  //using loop because there can be multiple courses in the cart
  //and we have to check for all the courses if they are valid or not
  for(const course_id of courses){
    let course;
    try{
      course=await Course.findById(course_id);//got course details from the course_id
      if(!course){
        return res.status(400).json({
          success:false,
          message:"Could not find the course"
        })
      }

      //validating if user already bought the same course-no need of payment then
      const uid=new mongoose.Types.ObjectId(userId);//converted userId string to object id
      if(course.studentsEnrolled.includes(uid)){
        return res.status(400).json({
          success:false,
          message:"Student is already enrolled"
        }) 
      }

      totalAmount+=course.price;//adding the price of all the courses to total amount
    }
    catch(error){
      console.log(error);
      return res.status(400).json({
        success:false,
        
        error:error.message,
      })
    }
  }
  

  //order create
  //refer razorpay website to know more
  

  const options={
    amount: totalAmount*100,
    currency:"INR",
    receipt:Math.random(Date.now()).toString(),
  }
  try {
    //initaiate the payment using razorpay
    const paymentResponse= await instance.orders.create(options);
    console.log(paymentResponse);
    //return response
    return res.status(200).json({
      success:true,
      
      message:paymentResponse
    })
  } catch (error) {
    return res.status(400).json({
      success:false,
      message:"could not initiate order"
    })
  }
  
}

//verifying Signature of Razorpay and Server
exports.verifySignature= async (req , res)=>{
  const webhookSecret ='1234567890';

  const signature= req.headers["x-razorpay-signature"];

  crypto.createHmac("sha256",webhookSecret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");


  if(signature ===digest){//payment is authorized
    console.log("Payment is authorized");

    const {courseId,userId}=req.body.payload.entity.notes;// we have send this data in notes while in options while order creation

    try {
      //fulfil the action
      //find the course and enroll the student in it ->we are entering student id in the courses so that we can know which should is enrolled in this particular course
      const enrolledCourse=await Course.findOneAndUpdate(
                                                  {_id: courseId},
                                                  {$push:{studentsEnrolled:userId}},
                                                  {new:true},
      );

      if(!enrolledCourse){
        return res.status(400).json({
          success:false,
          message:"Course not found",
        })
      }
      console.log(enrollStudents);

      //finding the student and enroll the course in student id, ->we are adding this couse to thr enrolled course list of that student
      const enrolledStudent =await User.findOneAndUpdate(
                                              {_id:userId},
                                              {$push:{courses:courseId}},
                                              {new:true}
                                            );
      
      console.log(enrolledStudent);

      //send confirmation mail
      const emailResponse= await mailSender(
                                  enrolledStudent.email,
                                  "congratulation from code Help",
                                  "Congratulation your course has been added to you courses",
                                );
      console.log(emailResponse);
      return res.status(200).json({
        success:true,
        message:"Signature verified and course added",
      })

    } catch (error) {
      return res.status(400).json({
        success:false,
        message:error.message
      })
    }

  }
  else{
    return res.status(400).json({
      success:false,
      message:"Invalid request"
    })
  }
}

//other code cloned from github-similar to above code-->

// verify the payment
exports.verifyPayment = async (req, res) => {
  const razorpay_order_id = req.body?.razorpay_order_id
  const razorpay_payment_id = req.body?.razorpay_payment_id
  const razorpay_signature = req.body?.razorpay_signature
  const courses = req.body?.courses

  const userId = req.user.id

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !courses ||
    !userId
  ) {
    return res.status(200).json({ success: false, message: "Payment Failed" })
  }

  let body = razorpay_order_id + "|" + razorpay_payment_id

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex")

  if (expectedSignature === razorpay_signature) {
    //enrolling students in the courses
    await enrollStudents(courses, userId, res)//this function is defined below

    return res.status(200).json({ success: true, message: "Payment Verified" })
  }

  return res.status(200).json({ success: false, message: "Payment Failed" })
}

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body

  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
  } catch (error) {
    console.log("error in sending mail", error)
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" })
  }
}

// enroll the student in the courses
const enrollStudents = async (courses, userId, res) => {
  if (!courses || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please Provide Course ID and User ID" })
  }

  for (const courseId of courses) {
    try {
      // Find the course and enroll the student in it
      const enrolledCourse = await Course.findOneAndUpdate(
        { _id: courseId },
        { $push: { studentsEnroled: userId } },
        { new: true }
      )

      if (!enrolledCourse) {
        return res
          .status(500)
          .json({ success: false, error: "Course not found" })
      }
      console.log("Updated course: ", enrolledCourse)

      const courseProgress = await CourseProgress.create({
        courseID: courseId,
        userId: userId,
        completedVideos: [],
      })
      // Find the student and add the course to their list of enrolled courses
      const enrolledStudent = await User.findByIdAndUpdate(
        userId,
        {
          $push: {
            courses: courseId,
            courseProgress: courseProgress._id,
          },
        },
        { new: true }
      )

      console.log("Enrolled student: ", enrolledStudent)
      // Send an email notification to the enrolled student
      const emailResponse = await mailSender(
        enrolledStudent.email,
        `Successfully Enrolled into ${enrolledCourse.courseName}`,
        courseEnrollmentEmail(
          enrolledCourse.courseName,
          `${enrolledStudent.firstName} ${enrolledStudent.lastName}`
        )
      )

      console.log("Email sent successfully: ", emailResponse.response)
    } catch (error) {
      console.log(error)
      return res.status(400).json({ success: false, error: error.message })
    }
  }
}