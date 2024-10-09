import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { deleteNotification, getNotification,deleteSingleNotification } from "../controllers/notification.controller.js";

const router = express.Router()

// get all the notification
router.get("/", protectRoute, getNotification)
//delete all the notification
router.delete("/", protectRoute, deleteNotification)
// delete only one notification
router.delete("/:id", protectRoute, deleteSingleNotification)


export default router