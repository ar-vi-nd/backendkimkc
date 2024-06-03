// import { Router } from "express";
// const router = Router();

// import { registerUser } from "../controllers/user.controller.js";

// router.route("/register").post(registerUser)

// this .post expects a callback funciton so our registerUser must return a function
// thats why we write our controller such that it returns a funciton
// but you'll notice that in controller (which is a variable and its value is equal to the return value of asyncHandler)
// i have written a function call not a function
//  But Actually when the controllerls function call executes, it returns a function
//  router.route("/register").post(
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

// export default router



// ======================================================================
// export  default router

// if we are exporting as default we can import it in other file by any name

// ==================================================================

// this is equivalent to  export {router}

/*
export const router = Router();
import { registerUser } from "../controllers/user.controller.js";
 router.route("/register").post((req,res)=>{
    res.status(200).json({
        message : "ok"
    })
    
})
*/