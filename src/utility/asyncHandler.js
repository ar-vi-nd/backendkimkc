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


const asyncHandler = (fun)=>{
    (req,res,next)=>{
        Promise.resolve(fun(req,res,next)).then().catch(err=>{
            next(err)
        })
    }
}

export {asyncHandler}