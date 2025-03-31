const nodemailer=require('nodemailer');

const nodemailer=async(email,title,body)=>{
    try {
        
        let transporter=nodemailer.createTransporter({
            host:process.env.MAIL_HOST,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS,
            }
        })

        let info=transporter.sendMail({
            from:'StudyNotion || Aman Kumar Verma',
            to:`${email}`,
            subject:`${title}`,
            html:`${body}`,
        })
        console.log(info);
        return info;

    } catch (error) {
        console.log(error.message);
        
    }
}

module.exports= mailSender;