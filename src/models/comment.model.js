import mongoose, {Schema} from "mongoose";

// this below line imports helps in adding pagination and is used as a plugin
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new Schema({

    content:{
        type:String,
        required : true
    },
    video:{
        type: Schema.Types.ObjectId,
        ref : "Video"
    },
    owner : {
        type : Schema.Types.ObjectId,
        ref : "User"
    }
},
{timestamps: true})

commentSchema.plugin(mongooseAggregatePaginate)

const Comment = mongoose.model("Comment",commentSchema)
export default Comment