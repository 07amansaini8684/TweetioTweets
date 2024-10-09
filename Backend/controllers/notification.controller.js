import Notification from "../models/Notification.model.js";
// get all the notification
export const getNotification = async (req, res) => {
  try {
    // userId of loggedIn user
    const userId = req.user._id;
    // grabing the all notification which is sent to the loggedIn user
    const notification = await Notification.find({ to: userId }).populate({
      path: "from",
      select: "username profileImg",
    });

    await Notification.updateMany({ to: userId }, { read: true });
    res.json(notification);
  } catch (error) {
    console.error("error in the getNotification",error)
    res.status(500).json({ message: "Error fetching notifications" });
  }
};
/// delete all the notifcaiton
export const deleteNotification = async (req, res) => {
    try {
        
        const userId = req.user._id;
        await Notification.deleteMany({
            to: userId
        })
        res.status(201).json({message: "Notifications deleted successfully"})
    } catch (error) {
        console.error("error in the deleteNotification",error)
        res.status(500).json({ message: "Error deleting notifications" });
    }
};
// delete single notification
export const deleteSingleNotification = async (req, res) => {
    try {
        /// grabing the data
        const userId = req.user._id;
        const notificationId = req.params.id;
        // finding the notification of that id
        const notification = await Notification.findById(notificationId);
        //checking if the notification exist
        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }
        // checking if the notification is sent to the user
        if (notification.to.toString() !== userId.toString()) {
            return res.status(403).json({ message: "You can't delete this notification, you are the owner of the notification" });
        }
        // deleting the notification
        await Notification.findByIdAndDelete(notificationId);
        res.status(201).json({message : "chosed Notification deleted successfully"})

    } catch (error) {
        console.error("error in the deleteSingleNotification",error)
        res.status(500).json({ message: "Error deleting notification" });
        
    }
}
