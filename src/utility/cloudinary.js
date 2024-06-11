import { v2 as cloudinary } from "cloudinary";
import fs from 'fs'
import { ApiError } from "./ApiError.js";
// import dotenv from 'dotenv'
// dotenv.config()

// dont know why but need to import dotenv here otherwise its not working

// console.log("inside cloudinary printing process.env :",process.env.CLOUDINARY_API_KEY)
cloudinary.config({ 
    
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadOnCloudinary = async(localFilePath)=>{
    

    // console.log(process.env.CLOUDINARY_API_KEY)
    try {
        if(!localFilePath) return null
        
        // console.log("inside cloudinary " ,localFilePath)
       const response =  await cloudinary.uploader.upload(localFilePath,{resource_type:"auto"})
        // file has been uploaded successfully
        // console.log("file uploaded on cloudinary", response)s
        fs.unlinkSync(localFilePath)

        return response;
    } catch (error) {
         fs.unlinkSync(localFilePath)
        //  removes the file saved on server if upload on cloudinary fails
        throw new ApiError(400,"File not uploaded on cloudinary : ",error)
    }
}

const deleteFromCloudinary = async(cloudinaryFilePath)=>{
    try{
        const response =  await cloudinary.uploader.destroy(cloudinaryFilePath,{resource_type:"image"})
        return response
    }catch(error){
        throw new ApiError(400,"File not deleted from cloudinary : ",error)
    }
}

export {uploadOnCloudinary,deleteFromCloudinary}

// const uploadResult = cloudinary.uploader.upload("https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg", {
//     public_id: "shoes"
// },function(error,result){console.log(result)})