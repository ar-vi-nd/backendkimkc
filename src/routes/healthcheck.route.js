import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import healthCheck from "../controllers/healthcheck.controller.js";

const router = Router()

router.use(verifyjwt)

router.route("/").get(healthCheck)

export default router