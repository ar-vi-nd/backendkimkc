import mongoose, {Schema} from "mongoose";

// this below line imports helps in adding pagination and is used as a plugin
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const urlAndPublicIdSchema = new Schema({
    url: {
      type: String,
      required: true
    },
    public_id: {
      type: String,
      required: true,
      unique: true
    }
  });

const videoSchema = new Schema({

    videoFile: urlAndPublicIdSchema,
    thumbnail:{
        // type : String,
        // required: true
       url: {type: String,required:true},
        public_id:{type:String,required:true}
    },
    title:{
        type: String,
        required : true
    },
    description : {
        type:String,
        required: true
    },
    duration:{
        type: Number,
        required : true
    },
    views : {
        type: Number,
        default : 0
    },
    isPublished :{
        type: Boolean,
        default : true
        },
    owner:{
            type: Schema.Types.ObjectId,
            ref: "User"
        }
},{timestamps:true})

videoSchema.plugin(mongooseAggregatePaginate)

const Video = mongoose.model("Video",videoSchema)

export default Video