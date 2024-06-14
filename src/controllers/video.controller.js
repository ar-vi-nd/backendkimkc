import Video from "../models/video.model.js";
import User from "../models/user.model.js";
import { asyncHandler } from "../utility/asyncHandler.js";
import {ApiError} from "../utility/ApiError.js"
import { ApiResponse } from "../utility/ApiResponse.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utility/cloudinary.js";
import mongoose ,{ isValidObjectId} from "mongoose";
import { upload } from "../middlewares/multer.middleware.js";



const getAllVideos = asyncHandler(async (req,res)=>{
    const {page=1,limit = 10,query,sortBy="updatedAt",sortType=1,userId}=req.query

    console.log(userId)

    const pageno = parseInt(page,10)
    const pagelimit = parseInt(limit,10)
    const skippages = (pageno-1)*pagelimit


// here one thing to notice is that the .populate can be used to populate the object and also used to select only required fields 
// the outer .select is used on only the video documents and cannot be used for  owner in this case which is a populated object

    // const videos =await Video.find({owner:userId}).populate({path:"owner",select:"-password"}).select("-videoFile.url").sort({[sortBy]:sortType}).skip((pageno-1)*pagelimit).limit(limit)

    const videos =await Video.find({owner:userId}).populate({path:"owner",select:"-password -refreshToken"}).sort({[sortBy]:sortType}).skip((pageno-1)*pagelimit).limit(limit)
    if(!videos){
        throw new ApiError(404,"Error While Fetching Videos")
    }
    // console.log(videos)

    // i can also achieve the same result using the aggregation pipeline

    const videosbypipe = await Video.aggregate([
        {
            $match:{owner: new mongoose.Types.ObjectId(userId)}
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            username:1,
                            fullName:1,
                            avatar:1,
                            // even if i dont mention _id it will also be a part of the object by default
                        }
                    }
                ]
            }
        },{
            $addFields:{owner:{
                // $first:"$owner"
                $arrayElemAt:["$owner",0]
                // same thing
            }}
        },
        {
            $sort:{
                [sortBy]:sortType
            }
        },{
            $skip : skippages
        },{
            $limit : pagelimit
        }
    ])

    // console.log(videosbypipe[0])

    return res.status(200).json(new ApiResponse(200,{videosbypipe},"Videos Fetched successfully"))
})

const publishAVideo = asyncHandler(async(req,res)=>{
    const {title,description}= req.body
    const videoFile = req.files?.videoFile&&req.files.videoFile[0]
    const thumbnail = req.files?.thumbnail&&req.files.thumbnail[0]
    console.log(title,description,videoFile,thumbnail)

    if(!(title&&description&&videoFile&&thumbnail)){
        throw new ApiError(400,"All Fields are required")
    }

    const uploadedVideo = await uploadOnCloudinary(videoFile.path)
    console.log(uploadedVideo)

    if(!uploadedVideo){
        throw new ApiError(400,"Video Upload Failed")
    }

    const uploadedThumbnail = await uploadOnCloudinary(thumbnail.path)
    console.log(uploadedThumbnail)

    if(!uploadedThumbnail){
        throw new ApiError(400,"Thumbnail Upload Failed")
    }

    const video = await Video.create({
        videoFile : {url:uploadedVideo.url,public_id:uploadedVideo.public_id},
        thumbnail : {url:uploadedThumbnail.url,public_id:uploadedThumbnail.public_id},
        title : title,
        description: description,
        duration: uploadedVideo.duration,
        owner: req.user._id,

    })

    if(!video){
        throw new ApiError(400,"Error Saving video to database")
    }

    console.log(video)
    return res.status(200).json(new ApiResponse(200,video,"Video Uploaded Successfully"))
})

const getVideoById = asyncHandler(async(req,res)=>{
    const {id} = req.params
    console.log(id)

    if(!id){
        throw new ApiError(400,"Video id is required")
    }

    const video = await Video.findById(id)

    if(!video){
        throw new ApiError(400,"Video Doesnt Exist")
    }
    console.log(video)
    return res.status(200).json(new ApiResponse(200,video,"Video fetched Successfully"))
})

const deleteVideo = asyncHandler(async(req,res)=>{
    const {id} = req.params
    console.log(id)

    const videoToDelete = await Video.findById(id)

    console.log(videoToDelete)

    if(!videoToDelete){
        throw new ApiError(400,"Video doesnt exist")
    }

    const deletedVideo = await deleteFromCloudinary(videoToDelete.videoFile.public_id,"video")
    if(!deletedVideo){
        throw new ApiError(400,"Unable to delete video from cloudinary")
    }
    console.log(deletedVideo)

    const deletedThumbnail = await deleteFromCloudinary(videoToDelete.thumbnail.public_id)
    if(!deletedThumbnail){
        throw new ApiError(400,"Unable to delete thumbnail from cloudinary")
    }
    console.log(deletedThumbnail)

    await Video.findByIdAndDelete(id)

    return res.status(200).json(new ApiResponse(200,videoToDelete,"Video Deleted Successfully"))
})

const updateVideo = asyncHandler(async(req,res)=>{
    const {id} = req.params
    if(!id){
        throw new ApiError(400,"id required")
    }
    const thumbnail = req.file
    if(!thumbnail){
        throw new ApiError(400,"Thumbnail required")
    }
    // console.log(thumbnail)

    const videoToUpdate = await Video.findById(id)
    if(!videoToUpdate){
        throw new ApiError(400,"Video Doesnt Exist")
    }
    // console.log(videoToUpdate)

    const uploadedThumbnail = await uploadOnCloudinary(thumbnail.path)

    if(!uploadedThumbnail){
        throw new ApiError ( 400,"Unable to Upload Thumbnail On cloudinary at this point")
    }

    // console.log(uploadedThumbnail)

    const updatedVideo = await Video.findByIdAndUpdate(id,{$set:{thumbnail : {url: uploadedThumbnail.url,public_id:uploadedThumbnail.public_id }}},{new:true})

    if(!updatedVideo){
        throw new ApiError(400,"Failed to Update in Db")
    }

    const deletedThumbnail = await deleteFromCloudinary(videoToUpdate.thumbnail.public_id)
    if(!deletedThumbnail){
        throw new ApiError(400,"Unable to delete thumbnail from cloudinary")
    }
    console.log(deletedThumbnail)

    return res.status(200).json(new ApiResponse( 200,updatedVideo,"Thumbnail updated successfully"))



})

const togglePublish = asyncHandler(async(req,res)=>{
    const {id} = req.params

    // I am able to use aggregatin pipeline with findByIdAndUpdate but not with findOne
    const video = await Video.findByIdAndUpdate(id,
         [{ $set: { isPublished: { $not: "$isPublished" } } }],
    {new:true})

        // here i have used aggregation pipeline otherwise i had to fetch the video first and then update it by toggling the isPublished field

    if(!video){
        throw new ApiError(400,"Video Not Found")
    }
    console.log(video)
    return res.status(200).json(new ApiResponse(200,video,"Video's Publish Status Toggled"))
})

export {getAllVideos,publishAVideo,getVideoById,deleteVideo,updateVideo,togglePublish}