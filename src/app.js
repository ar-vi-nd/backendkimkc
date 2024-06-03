import express from 'express'
import path from 'path'
const app = express();
import cors from 'cors'
import cookieParser from 'cookie-parser';

app.use(cors({
    origin : process.env.CORS_ORIGIN
}))

app.use(express.json({limit:"16kb"}))
// to accept json data sent by user

app.use(express.urlencoded({extended : true,limit:"16kb"}))
// to accept form data and read complex data in url like arvind+search?fjsdljf

app.use(express.static(path.resolve('./public')))

app.use(cookieParser())



// ========================  NOTE ============================

// extentions are must otherwise I'm getting errors

// ========================  NOTE =============================




// routes import

import userRouter from './routes/user.route.js';
// since we are exporting router in user.routes.js as default we can import it with any name



// routes declaration

app.use("/api/v1/users",userRouter)


export {app}
