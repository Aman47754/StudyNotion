const mongoose= require('mongoose');
require('dotenv').config();

exports.connectDB=()=>{
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>console.log("DB connected"))
    .catch((error)=>{
        console.log("Db connection error");
        console.error(error);
        process.exit(1);
    })
};