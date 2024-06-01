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

// export default app;

export {app}
// same thing

// just changes the way how you import this file in other file
// import {app} from './app.js'