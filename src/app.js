import express from 'express'
import path from 'path'
const app = express();
import cors from 'cors'
import cookieParser from 'cookie-parser';

// console.log(process.env.CORS_ORIGIN)

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
import videoRouter from "./routes/video.route.js"

import subscriptionRouter from "./routes/subscription.route.js"

import commentRouter from './routes/comment.route.js';

import tweetRouter from './routes/tweet.route.js';

import likeRouter from './routes/like.route.js';

import playlistRouter from './routes/playlist.route.js';

import healthRouter from './routes/healthcheck.route.js';

import dashboardRouter from './routes/dashboard.route.js';





// routes declaration

app.use("/api/v1/users",userRouter)
app.use("/api/v1/videos",videoRouter)
app.use("/api/v1/subscriptions",subscriptionRouter)
app.use("/api/v1/comments",commentRouter)
app.use("/api/v1/tweets",tweetRouter)
app.use("/api/v1/likes",likeRouter)
app.use("/api/v1/playlists",playlistRouter)
app.use("/api/v1/healthcheck",healthRouter)
app.use("/api/v1/dashboard",dashboardRouter)

export {app}
