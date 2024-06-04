
// require('dotenv').config({path:'./env'})
// not working because type is set as module in package.json
// ReferenceError: require is not defined in ES module scope, you can use import instead


// import 'dotenv/config'

import dotenv from 'dotenv';
dotenv.config();


// same thing but different as the second statement requires some modification in the run script otherwise I wont be able to use env variables in those files when they are initialized


// // Load environment variables from .env file








import {app} from './app.js';


import connectDB from './db/index.js';


// sometimes extention is must otherwise you get an error
// dont know why but node.js not importing the file without extention

// In your original script, you're using commas inside the .then() method, which is not correct.
// the below The .then() method accepts up to two arguments: one for the success callback and one for the failure callback.
// so just write everything inside .then inside a anonyomous function



connectDB().then(()=>{

    // console.log("here"),
    // console.log(app),
    app.on('error',(error)=>{console.log(error)})
    app.listen(8000,()=>{console.log("server running")})
}
).catch(error=>{console.log("error in .then.catch, ",error)})
;




































// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
// import express from 'express'
// const app = express()

// async function connectDB(){}
// connectDB( )

// ;(async()=>{
// try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
//     app.on('error',(error)=>{
//         console.log("errr ",error)
//         throw error
//     })
//     app.listen(process.env.PORT,()=>{
//         console.log(`Server runing on port ${process.env.PORT}`)
//     })
// } catch (error) {
//     console.log("error :",error)
//     throw error
// }
// })