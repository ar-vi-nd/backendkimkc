import { asyncHandler } from "../utility/asyncHandler.js";
import {ApiError} from "../utility/ApiError.js"
import User from "../models/user.model.js"

// import dotenv from 'dotenv'
// dotenv.config()
// console.log("inside controller printing process.env :",process.env.CLOUDINARY_API_KEY)

import {uploadOnCloudinary} from "../utility/cloudinary.js"
import { ApiResponse } from "../utility/ApiResponse.js";

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
if(coverImagePath){
    const coverImage = await uploadOnCloudinary(coverImagePath)
    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
}

// console.log(avatar)
// console.log(coverImage)

if(!avatar){
    throw new ApiError(400, "Avatar file is required")
}

const user = await User.create({
    fullName,
    avatar : avatar.url,
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