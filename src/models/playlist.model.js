import mongoose , {Schema} from "mongoose";

const playlistSchema = new Schema({

    name:{
        type:String,
        required:true
    },

    description:{
        type:String,
        required:true
    },
    
    //videos multiple honge hence array me multiple objects honge jinme uska objectid hoga jo video schema se aa raha hoga
    videos:[{

        type:Schema.Types.ObjectId,
        ref:"Video"
       



    }],


    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }

},{timestamps:true})

export const Playlist = mongoose.model("Playlist",playlistSchema)