import { Router } from "express";
import { verifyjwt } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishAVideo , togglePublish, updateVideo, updateVideoViews } from "../controllers/video.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

router.use(verifyjwt)

router
.route("/")
.get(getAllVideos)
.post(upload.fields(
    [
        {name:"videoFile",maxCount:1},
        {name:"thumbnail",maxCount:1}
    ]
    ),
    publishAVideo
    )

router
.route("/:id")
.get(getVideoById)
.delete(deleteVideo)
.patch(upload.single("thumbnail"), updateVideo);

router.route("/views/:videoId").patch(updateVideoViews)

router.route("/togglepublish/:id").patch(togglePublish)
export default router