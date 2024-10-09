import Notification from "../models/Notification.model.js";
import Post from "../models/PostModel.js";
import User from "../models/UserModel.js";
import { v2 as cloudinary } from "cloudinary";

// creating a post
export const createPost = async (req, res) => {
  try {
    /// grabing the info
    let { text, img } = req.body;
    const userId = req.user._id.toString();

    // finding the user
    const user = await User.findById(userId);
    // check if the user exist
    if (!user) {
      return res.status(404).json({
        message:
          "User not found, check if you have a account or not you are suspecious",
      });
    }
    // creating the post
    if (!text && !img) {
      return res
        .status(400)
        .json({ message: "Please provide a text or an image" });
    }
    if (img) {
      const uploadedResoponse = await cloudinary.uploader.upload(img);
      img = uploadedResoponse.secure_url;
    }
    const newPost = new Post({
      user: userId,
      text: text,
      img: img,
    });
    // saving the post
    await newPost.save();
    res.status(201).json({ newPost, message: "Post created successfully" });
  } catch (error) {
    console.error("Error in the createPost", error.message);
    return res
      .status(500)
      .json({ message: "Error in the createPost, Internal sever error " });
  }
};
// deleting the post
export const deletePost = async (req, res) => {
  try {
    // grabing the id
    const postId = req.params.id;
    // grabing the user
    const userId = req.user._id.toString();
    // finding the post
    const post = await Post.findById(postId);
    // if there is any post or not
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    // checking if that is the owner
    if (post.user.toString() !== userId) {
      return res.status(401).json({
        message:
          "You are not the owner or you are not authorized to delete this post",
      });
    }
    // deleting the post
    if (post.img) {
      const imgId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(imgId);
    }
    await Post.findByIdAndDelete(postId);
    //sending the response
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error in the deletePost", error.message);
    return res.status(500).json({
      message: "Error in the deletePost, Internal server error who know's",
    });
  }
};
// comment on the post
export const commentOnPost = async (req, res) => {
  try {

    const { text } = req.body;
    console.log(text)
    // grabing the id
    const postId = req.params.id;
    // grabing the user
    const userId = req.user._id.toString();
    // grabing the comment

    if (!text) {
      return res.status(400).json({ message: "Please enter a comment" });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const comment = { user: userId, text };
    post.comments.push(comment);
    await post.save();
    res.status(200).json({ post, message: "Comment added successfully" });
  } catch (error) {
    console.error("Error in the commentOnPost", error.message);
    return res
      .status(500)
      .json({ message: "Error in the commentOnPost, Internal" });
  }
};
// like on the post
export const likeUnlikePost = async (req, res) => {
  try {
    /// post Id
    const postId = req.params.id;
    // user Id
    const userId = req.user._id.toString();
    // grabing the post
    const post = await Post.findById(postId);
    // checking if there is that post or not
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userLikedPost = post.likes.includes(userId);
    if (userLikedPost) {
      // if the user has liked the post then remove the like
      // Correct usage of updateOne
      await Post.updateOne(
        { _id: postId }, // Filter to find the post by ID
        { $pull: { likes: userId } } // Update to remove the user ID from likes
      );
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });
      //removing our id form the the array
      const updatedLikes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );

      res.status(200).json(updatedLikes);
    } else {
      // if the user has not liked the post then add the like
      post.likes.push(userId);
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });
      await post.save();

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();

      const updatedLikes = post.likes;

      res.status(200).json(updatedLikes);
    }
  } catch (error) {
    console.error("Error in the likeUnlikePost", error.message);
    return res
      .status(500)
      .json({ message: "Error in the likeUnlikePost, Internal" });
  }
};
/// get all the post
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    if (posts.length === 0) {
      return res.status(404).json({ message: "No posts found" });
    }
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in the getAllPosts", error.message);
    return res
      .status(500)
      .json({ message: "Error in the getAllPosts, Internal surver error" });
  }
};

//  get all liked post of the user
export const getAllLikedPosts = async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });

    res.status(200).json(likedPosts);
  } catch (error) {
    console.error("Error in the getAllLikedPosts", error.message);
    return res
      .status(500)
      .json({ message: "Error in the getAllLikedPosts, errowrrrrrr" });
  }
};
// get all post of following user
export const getFollowingPosts = async (req, res) => {
  try {
    // grabing userId
    const userId = req.user._id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // getting all following user id
    const following = user.following;
    const feedPosts = await Post.find({ user: { $in: following } })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    res.status(200).json(feedPosts);
  } catch (error) {
    console.error("Error in the getFollowingPosts", error.message);
    return res
      .status(500)
      .json({ message: "Error in the getFollowingPosts, Internal error " });
  }
};
// get all post of user
export const getUsersPosts = async (req, res) => {
  try {
    // grabing username from the params
    const username = req.params.username;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // getting all post of user
    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "user",
        select: "-password",
      })
      .populate({
        path: "comments.user",
        select: "-password",
      });
    // send the json res
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in the getUsersPosts", error.message);
    return res
      .status(500)
      .json({ message: "Error in the getUsersPosts, Internal error" });
  }
};
