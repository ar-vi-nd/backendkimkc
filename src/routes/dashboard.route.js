import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import { getChanelStats, getChannelVideos } from "../controllers/dashboard.controller.js";

const router = Router()

router.use(verifyjwt)


router.route("/videos").get(getChannelVideos)
router.route("/stats").get(getChanelStats)


export default router