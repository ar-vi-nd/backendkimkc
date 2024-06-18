import mongoose from "mongoose";
import Video from "../models/video.model.js";
import User from "../models/user.model.js"
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/ApiResponse.js";
import { asyncHandler } from "../utility/asyncHandler.js";
import Subscription from "../models/subscription.model.js";

const getChannelVideos = asyncHandler(async(req,res)=>{
    const channelId = req.user?._id
    if(!channelId){
        throw new ApiError(400,"Unautorized Request")
    }
    const videos = await Video.find({owner:channelId})

    // console.log(videos)

    return res.status(200).json(new ApiResponse(200,videos,"All videos fetched successfully"))
})


const getChanelStats = asyncHandler(async(req,res)=>{

    const channelId = req.user?._id
    if(!channelId){
        throw new ApiError(400,"Unautorized Request")
    }
    const channelstats = await User.aggregate([
     {
        $match:{
            _id: new mongoose.Types.ObjectId(channelId)
        }
     },
     {
        $lookup : {
            from:"videos",
            localField: "_id",
            foreignField: "owner",
            as : "videos"
        }
     },
     {
        $lookup:{
            from:"subscriptions",
            localField: "_id",
            foreignField: "channel",
            as: "subscribers"
        }
     },
     {
        $lookup:{
            from:"likes",
            localField:"_id",
            foreignField:"likedBy",
            as:"likes"
        }
     },
     {
        $addFields:{
            totalVideos: {
                $size:"$videos"
            },
            totalLikes:{
                $size:"$likes"
            },
            totalSubscribers: {
                $size:"$subscribers"
            },
            totalViews :{
                $sum : "$videos.views"
            }
            
        }
    },
    {
        $project:{
            totalVideos:1,
            totalLikes:1,
            totalViews:1,
            totalSubscribers:1
        }
    }
    ])

    console.log(channelstats[0])

    return res.status(200).json(new ApiResponse(200,channelstats,"Here's channel Stats"))




})





export {getChannelVideos,getChanelStats}