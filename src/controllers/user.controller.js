import { asyncHandler } from "../utility/asyncHandler.js";
import {ApiError} from "../utility/ApiError.js"
import User from "../models/user.model.js"

// import dotenv from 'dotenv'
// dotenv.config()
// console.log("inside controller printing process.env :",process.env.CLOUDINARY_API_KEY)

import {deleteFromCloudinary, uploadOnCloudinary} from "../utility/cloudinary.js"
import { ApiResponse } from "../utility/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefreshToken = async(existingUser)=>{
    try{

        // console.log(existingUser)

        // const user = await User.findOne({_id:existingUser._id})
        // console.log(user)

        const accessToken =  await existingUser.generateAccessToken()
        const refreshToken = await existingUser.generateRefreshToken()
        
        if(!(accessToken||refreshToken)){
            throw new ApiError("Error generating tokens")
        }

        // since we are sending reference original object will also change
        existingUser.refreshToken = refreshToken

        const response = await existingUser.save({validateBeforeSave : false})

        console.log("response : ",response)

        return {accessToken,refreshToken}
    }catch(error){
        console.log(error)
        throw new ApiError(500,"Error generating tokens or saving tokens ")
    }
}

// this function inside asyncHandler is actually a argument for asynchandler function
export const registerUser = asyncHandler(async(req,res)=>{

const {fullName,email,username,password} = req.body

console.log([fullName,email,username,password])


// need to know difference bw conditional chaining and ternary conditional operator
// also need to know the && operator



// if i dont write return it wont return automatically because of ternary conditional operator
if([fullName,email,username,password].some(element=>{
    // console.log(element.trim()==="")
   return element? element.trim()==="":true})){

    throw new ApiError(400,"All fields are required")
}

// if ([fullName, email, username, password].some(element => {console.log(element.trim()===""); return element == null || element.trim() === ""})) {
//     throw new ApiError(400, "All fields are required");
// }

const existingUser =await User.findOne({
    $or : [{username},{email}]
})

// console.log("existingUser : ",existingUser)

if(existingUser){
    throw new ApiError(400,"Username or email already exists")
}

// console.log(req.files)
// console.log(req.files.coverImage)
// console.log(req.files.avatar)

// if you dont recieve the avatar or coverImage its field wont be present in req.file
// so make sure to check them

const avatarLocalPath = req.files?.avatar&&req.files.avatar[0]?.path
const coverImagePath = req.files?.coverImage&&req.files?.coverImage[0]?.path

// console.log(avatarLocalPath)
// console.log(coverImagePath)

if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")
}


const avatar = await uploadOnCloudinary(avatarLocalPath)
if(!avatar){
    throw new ApiError(400, "Avatar file is required")
}
let coverImage;
if(coverImagePath){
    coverImage = await uploadOnCloudinary(coverImagePath)
}

// console.log(avatar)
// console.log(coverImage)



const user = await User.create({
    fullName,
    avatar : avatar.url,
    coverImage : coverImage?.url,
    email,
    password,
    username: username.toLowerCase()
})

const createdUser = await User.findById(user._id).select("-password -refreshToken")

if(!createdUser){
    throw new ApiError(400, "Something went wrong while creating user")

}

return res.status(201).json(
    new ApiResponse(200,createdUser,"User Registered Successfully")
)


})


const userLogin = asyncHandler(async (req,res)=>{

    const {username,email,password} = req.body

    // console.log(username)

    // if(username&&password){
    //     console.log("empty string is also valid")
    // }

    // note : empty strings are falsy values

    if(!((username||email)&&password)){
        throw new ApiError(400,"Credentials required")
    }

    const existingUser = await User.findOne({
        $or:[{username},{email}]
    })
    if(!existingUser){
        throw new ApiError(400,"Invalid Credentials")

    }
    // console.log(existingUser)

    const isPasswordCorrect = await existingUser.isPasswordCorrect(password)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Invalid Credentials")
    }

    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(existingUser)

    const options = {
        httpOnly:true,
        secure : true
    }

    // not a function, cannot do it like this
    // existingUser.select("-password")
    // console.log("existing user after removing password",existingUser)

    // this will print nothing but will change the password field in existingUser
    // console.log(existingUser.password = undefined)
    existingUser.password = undefined

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{user:existingUser,accessToken,refreshToken}))





    
})


const userLogout = asyncHandler(async(req,res)=>{
   const user = await User.findByIdAndUpdate(
        req.user._id,{

            $set:{
                // unable to set it to undefined

                // refreshToken:undefined
                refreshToken:""

            }
            },{
            new:true
        }
        
    )

    console.log(user)

    if(!user){
        throw new ApiError(400,"Error while logging out")
    }

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200,"User Logout Successfully"))


})

const refreshTokens = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken

    console.log(req.cookies.refreshToken)
    console.log(incomingRefreshToken)
    if(!incomingRefreshToken){
        throw new ApiError(400,"Invalid Refresh Token")
    }

    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)

    if(!decodedToken){
        throw new ApiError(400,"Invalid Refresh Token")
    }

    const user = await User.findById(decodedToken._id).select("-password")

    if(incomingRefreshToken!==user.refreshToken){
        throw new ApiError(400,"Refresh Token expired")
    }

    
    const options = {
        httpOnly:true,
        secure: true
    }
    const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user)

    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,{accessToken,refreshToken},"Access and Refresh Tokens Refreshed"))
})

const changePassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword} = req.body

    console.log(oldPassword,newPassword)

    if(!(oldPassword.trim()&& newPassword.trim())){
        throw new ApiError(400,"Both Old and new password are required")
    }
    const user = await User.findOne({_id : req.user._id})

    if(!user){
        throw new ApiError(400,"Unauthorized access")
    }

    console.log(user)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"Wrong Old Password")
    }

    user.password = newPassword
    const updatedUser = await user.save()

    console.log(updatedUser)

    return res.status(201).json(new ApiResponse(200,"Password Updated"))

})

const updateUser = asyncHandler(async(req,res)=>{
    if(!(username.trim()||email.trim()||fullName.trim())){
        throw new ApiError(400,"Some fields required")
    }

    const {fullName,email,username} = req.body

    const finduserbyemail = await User.findOne({email})
    if(finduserbyemail._id!=req.user._id){
        throw new ApiError(400,"Email already exixt")
    }

    const finduserbyusername = await User.findOne({username})
    if(finduserbyusername._id != req.user._id){
        throw new ApiError(400,"Username already exist")
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {$set:{
            fullName:fullName,
            email:email,
            username: username
        }},
        {new:true}
    )

    if(!updateUser){
        throw new  ApiError(400,"Error while updating user")
    }

    return res.status(200).json(new ApiResponse(200,"User Updated Successfully"))



})

const updateAvatar = asyncHandler(async(req,res)=>{

    console.log(req.file)

   

    const avatar = await uploadOnCloudinary(req.file.path)
    if(!avatar){
        throw new ApiError(400,"Error updating avatar")
    }

    // const existingUser = await User.findById(req.user._id)
    // if(!existingUser){
    //     throw new ApiError(400,"Unauthorized Access")
    // }
    // console.log(existingUser)


    const updatedUser = await User.findByIdAndUpdate(req.user._id,{
        $set:{avatar : avatar.url}
    },{new:true})

    if(!updatedUser){
        throw new ApiError(400,"Error Updating Avatar")
    }

    console.log(updatedUser)

    return res.status(200).json(new ApiResponse(200,"Avatar Updated Successfully"))

})
const updateCoverImage = asyncHandler(async(req,res)=>{

    // console.log(req.file)

    const coverImage = await uploadOnCloudinary(req.file.path)
    if(!coverImage){
        throw new ApiError(400,"Error updating coverImage")
    }

    // const existingUser = await User.findById(req.user._id)
    // if(!existingUser){
    //     throw new ApiError(400,"Unauthorized Access")
    // }
    // console.log(existingUser)

    console.log(coverImage)

    const oldUser = await User.findById(req.user._id)

    if(!oldUser){
        throw new ApiError(400,"Unauthorized Request")
    }

    const oldCoverImagePath = oldUser.coverImage

    console.log(oldCoverImagePath)


    const updatedUser = await User.findByIdAndUpdate(req.user._id,{
        $set:{coverImage : coverImage.url}
    },{new:true})

    if(!updatedUser){
        throw new ApiError(400,"Error Updating Avatar")
    }

    console.log(updatedUser)

    if(oldCoverImagePath){
        const response = await deleteFromCloudinary(oldCoverImagePath)
        console.log(response)

    }

    return res.status(200).json(new ApiResponse(200,"Cover Image Updated Successfully"))

})

const getUserChannelProfile = asyncHandler(async(req,res)=>{
    const {username} = req.params
    if(!username?.trim()){
        throw new ApiError(400,"Username is missing")
    }

   const channel = await User.aggregate([
    {
        $match : {
            username: username?.toLowerCase()
        }
    },{

        // $lookup is somwhat similar to left outer join and it works on array of objects i guess
        // and in this case there is only one object in the array
        $lookup:{
            // dont know why but here i need to use the plural form of mongodb model in lowercase
            from:"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
        }
        // whatever is the result of this lookup it will be added as a new field 'subscribers' in each object of the array 
    },{
        // similarly this lookup will run on the resultant array of objects of the previous lookup
        // Each pipeline works on the result of the preious pipeline
        $lookup: {
            from : "subscriptions",
            localField:"_id",
            foreignField:"subscriber",
            as :"subscribedTo"
        }
    },{
        $addFields:{
            subscribersCount :{
                $size : "$subscribers" 
            },
            channelsSubscribedToCount : {
                $size : "$subscribedTo"
            },
            isSubscribed : {
                $cond:{
                    if:{$in:[req.user?._id,"$subscribers.subscriber"]},
                    then: true,
                    else:false
                }
            }
        }
    },{
        $project:{
            fullName:1,
            username:1,
            email:1,
            subscribersCount:1,
            channelsSubscribedToCount:1,
            isSubscribed:1,
            avatar:1,
            coverImage:1

        }
    }
   ])

   if(!channel?.length){
    throw new ApiError(400,"channel does not exist")
   }

   console.log(channel)

   return res.status(200).json(new ApiResponse(200,channel[0],"User channel fetched successfully"))

    
})

const getUserWatchHistory = asyncHandler(async (req,res)=>{

    const userWatchHistory = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId.createFromHexString(req.user._id)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"watchHistory",
                foreignField:"_id",
                as:"watchHistory",
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
                                    _id:1,
                                    fullName:1,
                                    email:1,
                                    username:1,
                                    avatar:1
                                }
                            }
                        ]
                    } 
                    },
                    {
                $addFields:{
                    owner:{
                        $first:"$owner"
                    }
                }
            }]
            }
        }
    ])

    console.log(userWatchHistory)
    return res.status(200).ApiResponse(400,userWatchHistory[0],"User history fetched successfully")
})

export {userLogin,userLogout,refreshTokens,changePassword,updateUser,updateAvatar,updateCoverImage}



















// ==============================  NOTES  =========================================
// export const registerUser = async(req,res)=>{
//     res.status(200).json({
//         message: "ok"
//     })
// }

// export {registerUser}


// cannot export single function as export function_name
// we need to user export {function_name}

// if you want to export it simply use export default function_name

// or export like below code

// export const registerUser = asyncHandler(async(req,res)=>{
//     res.status(200).json({
//         message: "ok"
//     })
// })

// the above one and 'export {registerUser}' is same