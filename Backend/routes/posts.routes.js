import express from "express"
import { protectRoute } from "../middleware/protectRoute.js"
import { commentOnPost, createPost, deletePost, getAllLikedPosts, getAllPosts, getFollowingPosts, getUsersPosts, likeUnlikePost,  } from "../controllers/post.controller.js"

const router = express.Router()

//creating post
router.post("/create", protectRoute, createPost)
//liking&unliking on post
router.post("/like/:id", protectRoute, likeUnlikePost )
//commenting on the post
router.post("/comment/:id", protectRoute,commentOnPost)
// deleting the post
router.delete("/:id", protectRoute, deletePost)
//getting all the post
router.get("/allposts", protectRoute, getAllPosts)
// getliked post of the loggedIn user
router.get("/likedposts/:id", protectRoute, getAllLikedPosts)
// getting all the post of user following people
router.get("/following", protectRoute, getFollowingPosts)
// get all the post of the loggedIn user
router.get("/user/:username", protectRoute, getUsersPosts)



export default router