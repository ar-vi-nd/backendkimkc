import User from "../models/user.model.js"
import { ApiError } from "../utility/ApiError.js"
import { asyncHandler } from "../utility/asyncHandler.js"
import jwt from "jsonwebtoken"
export const verifyjwt = asyncHandler(async (req,res,next)=>{
    const token = req.cookies?.accessToken||req.header("Authorization")?.replace("Bearer ","")

    if(!token){
        throw new ApiError(400,"Unauthorized access")
    }

    const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)

    console.log(decodedToken)

    const user = await User.findOne({_id : decodedToken?._id}).select("-password")

    if(!user){
        throw new ApiError(400,"Invalid Access Token")
    }

    req.user =  user
    next()
    
})