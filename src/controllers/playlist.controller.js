import Playlist from "../models/playlist.model.js";
import Video from "../models/video.model.js"
import { asyncHandler } from "../utility/asyncHandler.js";
import { ApiError } from "../utility/ApiError.js";
import { ApiResponse } from "../utility/ApiResponse.js";
import mongoose, { isValidObjectId } from "mongoose";


const createPlaylist = asyncHandler(async(req,res)=>{
    const {name,description} = req.body
    if(!name.trim()){
        throw new ApiError(400,"Name required")
    }

    const playlist = await Playlist.create({name,description,owner:req.user?._id})
    
    if(!playlist){
        throw new ApiError(400,"Unable to create playlist")
    }

    return res.status(200).json(new ApiResponse(200,playlist,"Playlist Created"))
})

const updatePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params
    const {name,description}= req.body
    
    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400,"Invalid Playlist Id")
    }
    if(!playlist.owner.equals(req.user?._id)){
        throw new ApiError(400,"Unauthorized Request")
    }
    if(!name.trim()){
        throw new ApiError(400,"Name required")
    }

    const newplaylist = await Playlist.findByIdAndUpdate(playlistId,{$set:{name:name,description:description}},{new:true})

    if(!newplaylist){
        throw new ApiError(400,"Unable to create playlist")
    }

    return res.status(200).json(new ApiResponse(200,newplaylist,"Playlist updated"))

})

const deletePlaylist = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params
    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400,"Invalid Playlist Id")
    }
    if(!playlist.owner.equals(req.user?._id)){
        throw new ApiError(400,"Unauthorized Request")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!deletePlaylist){
        throw new ApiError(400,"Unable to delete playlist")
    }

    return res.status(200).json(new ApiResponse(200,deletedPlaylist,"Playlist deleted successfully"))
})

const getPlaylistBYId = asyncHandler(async(req,res)=>{
    const {playlistId} = req.params
    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400,"Invalid Playlist Id")
    }
    if(!playlist.owner.equals(req.user?._id)){
        throw new ApiError(400,"Unauthorized Request")
    }

    const expandedPlaylist = await Playlist.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(playlistId)
            }
            
        },
        {
            $lookup : {
                from : "videos",
                localField:"videos",
                foreignField: "_id",
                as : "videos",
                pipeline:[
                    {
                        $lookup:{
                            from:"users",
                            localField:"owner",
                            foreignField:"_id",
                            as:"owner",
                            pipeline:[
                                {
                                    $project:{
                                        fullName:1,
                                        username:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $project:{
                            title:1,
                            description:1,
                            thumbnail:1,
                            duration:1,
                            owner:1

                        }
                    },{
                        $unwind:"$owner"
                    }
                ]
            }

        },
        {
            $unwind:"$videos"
        }
    ])

    return res.status(200).json(new ApiResponse(200,expandedPlaylist,"Playlist Fetched Successfully"))
})

const addVideoToPlaylist = asyncHandler(async(req,res)=>{
    const {videoId,playlistId} = req.params

    if(!(isValidObjectId(videoId)&&isValidObjectId(playlistId))){
        throw new ApiError(400,"Invalid Video or PlaylistId")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400,"Playlist doesn't exist")
    }

    if(!playlist.owner.equals(req.user?._id)){
        throw new ApiError(400,"Unauthorized Request")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400,"Video Doesn't exist")
    }

    for(let video of playlist.videos){
        // console.log("inside for loop")
        
        if(video.equals(videoId)){
            return res.status(200).json(new ApiResponse(200,playlist,"Video already present in playlist"))
            break;
        }
    }

    const newVideoArray = [...playlist.videos,videoId]

    // const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,{$set:{videos:playlist.videos.push(new mongoose.Types.ObjectId(videoId))}})
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,{$set:{videos:newVideoArray}},{new:true})

    if(!updatePlaylist){
        throw new ApiError(400,"Unable to update playlist")
    }

    return res.status(200).json(new ApiResponse(200,updatedPlaylist,"Video added to playlist"))
}) 

const removeVideoFromPlaylist = asyncHandler(async(req,res)=>{
    const {videoId,playlistId} = req.params

    if(!(isValidObjectId(videoId)&&isValidObjectId(playlistId))){
        throw new ApiError(400,"Invalid Video or PlaylistId")
    }

    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400,"Playlist doesn't exist")
    }

    if(!playlist.owner.equals(req.user?._id)){
        throw new ApiError(400,"Unauthorized Request")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400,"Video Doesn't exist")
    }

    const newVideoArray = playlist.videos.filter((video)=>{return !video.equals(videoId)})

    // for(let video in playlist.videos){
    //     if(video.equals(videoId)){
    //         return res.status(200).json(new ApiResponse(200,{},"Video already present in playlist"))
    //         break;
    //     }
    // }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,{$set:{videos:newVideoArray}})

    if(!updatePlaylist){
        throw new ApiError(400,"Unable to update playlist")
    }

    return res.status(200).json(new ApiResponse(200,updatePlaylist,"Video removed from playlist"))
}) 


const getUserPlaylists = asyncHandler(async(req,res)=>{
    const {userId} = req.params

    if(!isValidObjectId(userId)){
        throw new ApiError(400,"Invalid user id")
    }

    console.log(userId,req.user?._id)
    if(!(new mongoose.Types.ObjectId(userId).equals(req.user?._id))){
        throw new ApiError(400,"Unauthorized Request")
    }

    console.log("here")

    const userPlaylists = await Playlist.find({owner : userId})

    if(!userPlaylists){
        throw new ApiError(400,"Unable to fetch playlists")
    }

    return res.status(200).json(new ApiResponse(200,userPlaylists,"All playlists fetched"))
})



export {createPlaylist,updatePlaylist,deletePlaylist,getPlaylistBYId,addVideoToPlaylist,removeVideoFromPlaylist,getUserPlaylists}