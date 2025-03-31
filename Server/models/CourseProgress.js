const mongoose=require('mongoose');

const CourseProgressSchema= new mongoose.Schema({
    CourseId:{
        type:mongoose.Schema.Types.ObjectId,
    },
    CompletedVideos:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"SubSection"
    }],
    
})

models.exports =mongoose.model('CourseProgress',CourseProgressSchema);