import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import { followAndUnfollowUser, getSuggestedUsers, getUserProfile, updateUserProfile } from "../controllers/user.contorller.js";

const router = express.Router();

// get the userS profile
router.get("/profile/:username",protectRoute, getUserProfile);
// get some random ass lasi drinker
router.get("/suggested",protectRoute, getSuggestedUsers);
// update the profile of the user
router.post("/update",protectRoute, updateUserProfile);
//  follow and unfollw people
router.post("/follow/:id",protectRoute, followAndUnfollowUser);

export default router;
