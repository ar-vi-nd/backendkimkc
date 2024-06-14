import { asyncHandler } from "../utility/asyncHandler.js";
import Comment from "../models/comment.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/ApiResponse.js";



const getVideoComments = asyncHandler(async(req,res)=>{
    const {videoId}= req.params
    
    const comments =await Comment.aggregate([
        {
            $match:{video: new mongoose.Types.ObjectId(videoId)}

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
                            username:1,
                        }
                    }
                ]
            }
        }
    ])

    // if(!comments){
    //     throw new ApiError(400,"Unable to fetch comments")
    // }
    return res.status(200).json(new ApiResponse(200,comments,"Comments fetched Successfully"))
})

const addComment = asyncHandler(async(req,res)=>{
    
    const {videoId}= req.params
    const {content} =  req.body
    if(!content){
        throw new ApiError(400,"Content Required")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400,"Invalid Video Id")
    }

    const comment = await Comment.create({
        content:content,
        video:videoId,
        owner: req.user?._id
    })

    if(!comment){
        throw new ApiError(400,"Unable to add comment")
    }
    console.log(comment)

    return res.status(200).json(new ApiResponse(200,comment,"Comment Added Successfully"))
})

const deleteComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid Comment Id")
    }

    const oldComment = await Comment.findById(commentId)
    if(!oldComment){
        throw new ApiError(400,"Comment Doesnt exist")
    }

    // for some reason we cannot compare two mondodb object using "==" we need to use equals


    if(!oldComment.owner.equals( req.user._id)){
        throw new ApiError(400,"Unauthorized Request")
    }

    const deletedComment= await Comment.findByIdAndDelete(commentId)
    
    if(!deleteComment){
        throw new ApiError(400,"Comment not found")
    }
    return res.status(200).json(new ApiResponse(200,deletedComment,"Comment Deleted Successfully"))
})


const updateComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params
    const {content} = req.body
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid Comment Id")
    }

    const oldComment = await Comment.findById(commentId)
    if(!oldComment){
        throw new ApiError(400,"Comment Doesnt exist")
    }
    // console.log(oldComment)

    console.log(oldComment.owner, new mongoose.Types.ObjectId(req.user?._id))

    // for some reason we cannot compare two mondodb object using "==" we need to use equals

    if(!oldComment.owner.equals(req.user._id)){
        throw new ApiError(400,"Unauthorized Request")
    }

    const updatedComment = await Comment.findByIdAndUpdate(commentId,{
        $set : {content : content}
    },{new:true})

    if(!updatedComment){
        throw new ApiError(400,"Comment not found")
    }

    return res.status(200).json(new ApiResponse(200,updatedComment,"Comment Updated Successfully"))
})


export { getVideoComments,addComment,updateComment,deleteComment}