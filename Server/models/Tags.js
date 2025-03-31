const mongoose=require('mongoose');

const TagsSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
    },
    description:{
        type:String,
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course"
    },
    
})

models.exports =mongoose.model('Tags',TagsSchema);