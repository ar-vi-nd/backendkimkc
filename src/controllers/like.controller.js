import mongoose, { isValidObjectId } from "mongoose";
import Like from "../models/likes.model.js";

import { asyncHandler } from "../utility/asyncHandler.js";
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/ApiResponse.js";
import Video from "../models/video.model.js";
import Comment from "../models/comment.model.js";
import Tweet from "../models/tweets.model.js";



const toggleVideoLike = asyncHandler(async(req,res)=>{

    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }

    const video = await Video.findById(videoId)
    if(!video){
        throw new ApiError(400,"Video doesnt exist")
    }

    const oldLike = await Like.findOne({$and:{video:videoId,likedBy:req.user?._id}})

    if(oldLike){
        const deletedLike = await Like.findOneAndDelete({$and:{video:videoId,likedBy:req.user?._id}})
        return res.status(200).json(new ApiResponse(200,deletedLike,"Like Removed"))
    }else{
        const newVideoLike = await Like.create({video:videoId,likedBy:req.user?._id})
        return res.status(200).json(new ApiResponse(200,newVideoLike,"Video Liked"))

    }


})
const toggleCommentLike = asyncHandler(async(req,res)=>{

    const {commentId} = req.params


    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid Comment Id")
    }

    const comment = await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(400,"Comment doesnt exist")
    }

    const oldCommentLike = await Like.findOne({$and:{comment:commentId,likedBy:req.user?._id}})

    if(oldCommentLike){
        const deletedLike = await Like.findOneAndDelete({$and:{comment:commentId,likedBy:req.user?._id}})
        return res.status(200).json(new ApiResponse(200,deletedLike,"Comment Like Removed"))
    }else{
        const newCommetLike = await Like.create({comment:commentId,likedBy:req.user?._id})
        return res.status(200).json(new ApiResponse(200,newCommetLike,"Comment Liked"))

    }


})
const toggleTweetLike = asyncHandler(async(req,res)=>{

    const {tweetId} = req.params

    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet Id")
    }

    const tweet = await Tweet.findById(tweetId)
    if(!tweet){
        throw new ApiError(400,"Tweet doesnt exist")
    }

    const oldTweetLike = await Like.findOne({$and:{tweet:tweetId,likedBy:req.user?._id}})

    if(oldTweetLike){
        const deletedTweetLike = await Like.findOneAndDelete({$and:{tweet:tweetId,likedBy:req.user?._id}})
        return res.status(200).json(new ApiResponse(200,deletedTweetLike,"Tweet Like Removed"))
    }else{
        const newTweetLike = await Like.create({tweet:tweetId,likedBy:req.user?._id})
        return res.status(200).json(new ApiResponse(200,newTweetLike,"Tweet Liked"))

    }


})

const getLikedVideos = asyncHandler(async(req,res)=>{
    const userId = req.user?._id
    console.log(userId)

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Unauthorized User")
    }

    const likedVideos = await Like.aggregate([
        {
            $match : {
                likedBy: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $match:{
                comment:{$exists:false},
                tweet:{$exists:false}
            }
        },
        {
            $lookup:{
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails",
                pipeline:[
                    {
                        $project:{
                            title:1,
                            owner:1
                        }
                    }
                ]
            }
        },
        {
            // works on array to make separate document for each array element. See below for more details
            $unwind: "$videoDetails"
        },
        {
            $project: {
                _id: 0,
                video: "$videoDetails"
            }
        }
    ])

    console.log(likedVideos)


    return res.status(200).json(new ApiResponse(200,likedVideos,"All liked videos fetched"))
})

export{toggleVideoLike,toggleCommentLike,toggleTweetLike,getLikedVideos}


// ===============================================================================


// :: json
// {
//     "_id": 1,
//     "name": "Alice",
//     "hobbies": ["reading", "traveling", "swimming"]
// }


// :: javascript
// db.users.aggregate([
//     { $unwind: "$hobbies" }
// ])

// output json
// {
//     "_id": 1,
//     "name": "Alice",
//     "hobbies": "reading"
// }
// {
//     "_id": 1,
//     "name": "Alice",
//     "hobbies": "traveling"
// }
// {
//     "_id": 1,
//     "name": "Alice",
//     "hobbies": "swimming"
// }


