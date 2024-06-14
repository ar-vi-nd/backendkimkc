import mongoose, { isValidObjectId } from "mongoose";
import Tweet from "../models/tweets.model.js";
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/ApiResponse.js";

import { asyncHandler } from "../utility/asyncHandler.js";

const createTweet = asyncHandler(async(req,res)=>{

    const {content} = req.body
    const tweet = await Tweet.create({content : content,owner:req.user?._id})
    
    if(!tweet){
        throw new ApiError(400,"Unable to post tweet")
    }

    return res.status(200).json(new ApiResponse(200,tweet,"Tweet Uploaded Successfully"))
})

const getUserTweets = asyncHandler(async(req,res)=>{

    const {userId} = req.params

    if(!isValidObjectId){
        throw new ApiError(400,"Invalid User Id")
    }

    const tweets = await Tweet.aggregate([
        {
            $match:{
                owner : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as : "owner",
                pipeline:[
                    {
                        $project:{
                            fullName:1,
                            username:1
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200,tweets,"Tweets fetched successfully"))

})


const updateTweet = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params
    const {content} = req.body

    if(!isValidObjectId){
        throw new ApiError(401,"Invalid Tweet Id")
    }

    const oldTweet = await Tweet.findById(tweetId)

    if(!oldTweet){
        throw new ApiError(404,"Tweet doesnt exist")
    }

    // cant compare mongodb objects with "=="

    if(!oldTweet.owner.equals(req.user?._id)){
        throw new ApiError(400,"Unauthorized Request")
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(tweetId,{$set:{content: content}},{new:true})

    if(!updatedTweet){
        throw new ApiError(400,"Unable to update comment")
    }

    return res.status(200).json(new ApiResponse(200,updatedTweet,"Tweet Updated Successfully"))

})

const deleteTweet = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params

    if(!isValidObjectId){
        throw new ApiError(401,"Invalid Tweet Id")
    }

    const oldTweet = await Tweet.findById(tweetId)

    if(!oldTweet){
        throw new ApiError(404,"Tweet doesnt exist")
    }

    // cant compare mongodb objects with "=="
    if(!oldTweet.owner.equals(req.user?._id)){
        throw new ApiError(400,"Unauthorized Request")
    }

    const deletedTweet = await Tweet.findByIdAndDelete(tweetId)

    if(!deletedTweet){
        throw new ApiError(400,"Unable to update comment")
    }

    return res.status(200).json(new ApiResponse(200,deletedTweet,"Tweet Updated Successfully"))

})








export {createTweet,getUserTweets,updateTweet,deleteTweet}