import mongoose  from "mongoose";
import { Schema } from "mongoose";

const subscriptionSchema = new Schema({

    channel : {type : Schema.Types.ObjectId,
    ref : "User"},

    subscriber : {
        type : {
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    }
})

const Subscription = mongoose.model("Subscription",subscriptionSchema)

export default subscriptionSchema;