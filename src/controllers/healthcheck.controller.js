import { ApiResponse } from "../utility/ApiResponse.js";
import { asyncHandler } from "../utility/asyncHandler.js";


const healthCheck = asyncHandler(async(req,res)=>{

    return res.status(200).json(new ApiResponse(200,{},"Server Running Properly"))

})

export default healthCheck