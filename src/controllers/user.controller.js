import { asyncHandler } from "../utility/asyncHandler.js";

// this function inside asyncHandler is actually a argument for asynchandler function
export const registerUser = asyncHandler(async(req,res)=>{
    res.status(200).json({
        message: "ok"
    })
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