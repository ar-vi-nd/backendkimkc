import { asyncHandler } from "../utility/asyncHandler.js";
import {ApiError} from "../utility/ApiError.js"
import User from "../models/user.model.js"

// import dotenv from 'dotenv'
// dotenv.config()
// console.log("inside controller printing process.env :",process.env.CLOUDINARY_API_KEY)

import {uploadOnCloudinary} from "../utility/cloudinary.js"
import { ApiResponse } from "../utility/ApiResponse.js";
import jwt from "jsonwebtoken"


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

export {userLogin,userLogout,refreshTokens}



















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