const mongoose=require('mongoose');

const SectionSchema= new mongoose.Schema({
    sectionName:{
        type:String,
    },
    subSection:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"SubSection"
    },
    description:{
        type:String,
        trim:true,
    },
    videoUrl:{
        type:String,
        
    }
})

models.exports =mongoose.model('Section',SectionSchema);