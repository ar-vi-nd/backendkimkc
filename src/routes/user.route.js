import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
const router = Router();

import { registerUser, userLogin, userLogout } from "../controllers/user.controller.js";
import { verifyjwt } from "../middlewares/auth.middleware.js";

    router.route("/register").post(

    // to send pictures with different field name
    // if you increase the maxcount for a field the no of file objects in the array will increase if more files are present but each would have same field name
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name: "coverImage",
            maxCount:1
        }
    ]),
    // to send pictures with same fieldname as you can send myltiple pics with different field names
    // upload.array('coverImage',5),

    // also multiple instance of multer might give error as it overwrite the previous fields
    
    registerUser)


    router.route("/userlogin").post(
        userLogin
    )

    // secured routes

    router.route("/userlogout").get(verifyjwt
        ,userLogout
    )















export default router


// =============================================  NOTES  ==================================

// this .post expects a callback funciton so our registerUser must return a function
// thats why we write our controller such that it returns a funciton
// but you'll notice that in controller (which is a variable and its value is equal to the return value of asyncHandler)
// i have written a function call not a function
//  But Actually when the controllerls function call executes, it returns a function

// router.route("/register").post(
//     registerUser
//     // res.status(200).json({
//     //     message : "ok"
//     // })
    
// )





// if i try to do it like this it would say .post only accepts a callback
// because registeruser should be a callback function
// but since its a variable that gets its value when asyncHandler function is executed
// the asyncHandler should return a function otherwise it would give error

//  router.route("/register").post(
//      registerUser
         
// )



// here it wont give error but wont do anything because the callback its going to execute
// will already be executed and any value that registerUser will bring will have no access to req,res
//  router.route("/register").post(
//     (req,res)=>{
//      registerUser
//     }
         
// )

