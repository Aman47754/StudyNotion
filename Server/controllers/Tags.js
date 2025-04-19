const Tag= require('../models/Tags');

// create tag handler

exports.createTag = async(req,res)=>{
    try {
        //data fetch
        const {name, description}= req.body;

        //validation
        if(!name || !description ){
            return res.status(400).json({
                success:false,
                message:"All fields are required",
            })
        }
        //create entry in db
        const tagDetails = await Tag.create({
            name:name,
            description:description,
        });
        console.log(tagDetails);

        //return response
        return res.status(200).json({
            status:true,
            message:"Tag created successfully"
        })

        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            messages:error.messages,
        })
    }
}


//get all tags handler function

exports.showAlltags = async (req,res)=>{
    try {

        const allTags= await Tag.find({},{name:true , description:true});// {}->means no searchinf criteria ust fetach all the tags ,no filetrs

        return res.status(200).json({
            success:true,
            message:"all tags returned successfully"
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success:false,
            messages:error.messages,
        })
    }
}