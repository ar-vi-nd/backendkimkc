import Subscription from "../models/subscription.model.js";
import User from "../models/user.model.js";
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/ApiResponse.js";
import { asyncHandler } from "../utility/asyncHandler.js";
import mongoose,{isValidObjectId} from "mongoose";


const getChannelSubscribers = asyncHandler(async(req,res)=>{
    const {channelId}= req.params

    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid Object Id")
    }


    const channels = await Subscription.aggregate([
        {
            $match:{
                channel : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channel",
                pipeline:[
                    {
                        $project:{
                            fullName:1,
                            username:1,
                            avatar:1,
                            coverImage:1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriber",
                pipeline:[
                    {
                        $project:{
                            fullName:1,
                            username:1,
                            avatar:1,
                            coverImage:1
                        }
                    }
                ]
            }
        }
    ])

    console.log(channels[0])

    return res.status(200).json(new ApiResponse(400,channels,"All subcscribers for channel fetched"))
})

const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    if(!isValidObjectId(channelId)){
        throw new ApiError(400,"Invalid Object Id")
    }

    const channel = await User.findById(channelId)
    if(!channel){
        throw new ApiError(400,"Channel Doesnt Exist")
    }

    const isAlreadySubscribed = await Subscription.findOne({
        $and:{channel:channelId,subscriber:req.user?._id}
    })

    let subscription;
    if(!isAlreadySubscribed){
     subscription = await Subscription.create({channel :channelId,subscriber:req.user?._id})
    }
    else{
        subscription = await Subscription.findOneAndDelete({$and:{channel:channelId,subscriber:req.user?._id}})
    }

    console.log(subscription)
    return res.status(200).json(new ApiResponse(200,subscription,"Toggled Subscription"))

})

const getSubscribedChannels = asyncHandler(async(req,res)=>{
    const {subscriberId} = req.params
    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400,"Invalid Object Id")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match:{
                subscriber : new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channel",
                pipeline:[
                    {
                        $project:{
                            fullName:1,
                            username:1,
                            avatar:1,
                            coverImage:1
                        }
                    }
                ]
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriber",
                pipeline:[
                    {
                        $project:{
                            fullName:1,
                            username:1,
                            avatar:1,
                            coverImage:1
                        }
                    }
                ]
            }
        }
    ])

    console.log(subscribedChannels[0])

    return res.status(200).json(new ApiResponse(200,subscribedChannels[0],"All subscribed channels fetched"))
})

export {getChannelSubscribers,toggleSubscription,getSubscribedChannels}