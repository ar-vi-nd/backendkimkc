// ========================  NOTE ============================

// extentions are must otherwise I'm getting errors

// ========================  NOTE =============================



// routes import


// if its export default cannot import like this
// import {router} from './routes/user.route.js'
// app.use("/api/v1/users",router)

// since we are exporting router in user.routes.js as default we can import it with any name
// import userRouter from './routes/user.route.js';




// export default app;
// export {app}

// same thing both statements export but changes a lot when we import these 
// just changes the way how you import this file in other file
// import {app} from './app.js' for export{app}  and export const app = express()
// import app from './app.js' for export default app


// also cannot export like this
// export default const app = express()