// const asyncHandler = (fun)=>{
//     async(req,res,next)=>{
//         try{
//             await fun(req,res,next);
//         }
//         catch(error){
//             res.status(error.code||500).json({
//                 success : false,
//                 message : error.message
//             })
//         }
//     }
// }

import { ApiResponse } from "./ApiResponse.js"


// returning this function is must as when controller is called from user route
// we want to wrap the function written in controller in try catch or say promises
// this asyncHandler will take that function and return a function wrapped in try catch or promises

const asyncHandler = (fun)=>{
  return (req,res,next)=>{
        Promise.resolve(fun(req,res,next)).catch(err=>{
            next(err)
            // return res.status(200).json(new ApiResponse(400,err)) 
        })
    }
}

// this below function is also wrong
// const asyncHandler = (req,res,fun)=>{
//         Promise.resolve(fun(req,res)).catch(err=>{
//             // next(err)
//         })
    
// }

export {asyncHandler}