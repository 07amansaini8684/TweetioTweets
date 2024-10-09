import bcrypt from "bcryptjs";

/// models
import Notification from "../models/Notification.model.js";
import User from "../models/UserModel.js";
import { v2 as cloudinary } from "cloudinary";

export const getUserProfile = async (req,res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username }).select("-password");
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    console.log("error in getprofile ");
    return res.status(500).json({ message: error.message });
  }
};

export const followAndUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params; // 'id' is the target user's ID (in this case, Wolverine)
    const targetUser = await User.findById(id); // target user to be followed/unfollowed (Wolverine)
    const loggedInUser = await User.findById(req.user._id); // current logged-in user (Deadpool)

    if (!targetUser) return res.status(404).json({ msg: "User not found" });

    if (!loggedInUser)
      return res.status(404).json({ msg: "Logged-in user not found" });

    // Prevent users from following themselves
    if (id === req.user._id.toString()) {
      return res.status(400).json({ msg: "You can't follow yourself!" });
    }

    const isFollowing = loggedInUser.following.includes(id);

    if (isFollowing) {
      // Unfollow logic
      await User.findByIdAndUpdate(id, {
        $pull: { followers: req.user._id }, // Remove Deadpool from Wolverine's followers
      });
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { following: id }, // Remove Wolverine from Deadpool's following
      });
      return res.status(200).json({ msg: "Unfollowed successfully" });
    } else {
      // Follow logic
      await User.findByIdAndUpdate(id, {
        $push: { followers: req.user._id }, // Add Deadpool to Wolverine's followers
      });
      await User.findByIdAndUpdate(req.user._id, {
        $push: { following: id }, // Add Wolverine to Deadpool's following
      });

      const newNotification = new Notification({
        type: "follow",
        from: req.user._id, // this is our id
        to: targetUser._id, // this is other user id to whom we are following
      });
      await newNotification.save();

      /// send notification or other action
      // we have to send the id of the user as a response
      return res.status(200).json({ msg: "Followed successfully" });
    }
  } catch (error) {
    console.log("Error in follow/unfollow logic:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const getSuggestedUsers = async (req, res) => {
  try {
    const ourUserId = req.user._id;
    const userFollowedByMe = await User.findById(ourUserId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: ourUserId },
        },
      },
      {
        $sample: { size: 10 },
      },
    ]);
    // filtering the already followed user
    const filteredUsers = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id)
    );
    const suggestedUser = filteredUsers.slice(0, 4);
    //removing the password from the user
    suggestedUser.forEach((user) => (user.password = null));
    // sending suggested user in the res
    return res.status(200).json(suggestedUser);
  } catch (error) {
    console.log("Error in getSuggestedUsers:", error.message);
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  const { fullName, email, username, currentPassword, newPassword, bio, link } =
    req.body;
  let { profileImg, coverImg } = req.body;
  const userId = req.user._id;
  try {
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // checking if the current password is correct
    if (
      (!newPassword && currentPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res
        .status(400)
        .json({ message: "Please enter both current and new password" });
    }
    if (currentPassword && newPassword) {
      const isValidPassword = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isValidPassword) {
        return res
          .status(400)
          .json({ message: "Invalid current password, try again" });
      }
      if (newPassword < 5) {
        return res
          .status(400)
          .json({ message: "Password should be at least 5 characters" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }
    if (profileImg) {
      if (user.profileImg) {
        await cloudinary.uploader.destroy(
          user.profileImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedImgResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedImgResponse.secure_url;
    }
    if (coverImg) {
      if (user.coverImg) {
        await cloudinary.uploader.destroy(
          user.coverImg.split("/").pop().split(".")[0]
        );
      }
      const uploadedImgResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedImgResponse.secure_url;
    }
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.username = username || user.username;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;
    user = await user.save();
    // password should be null in response
    user.password = null;
    return res
      .status(200)
      .json({ user, message: "User profile updated successfully" });
  } catch (error) {
    console.log("Error in updateUserProfile:", error.message);
    return res.status(500).json({ message: error.message });
  }
};
