const express = require("express");
const notificationRouter = express.Router();

const {
  getAllNotificationsOfUser,
  getNotificationById,
  updateAllNotificationIsSeen,
  updateNotificationIsSeen,
  deleteAllNotificationOfUserByAdmin,
  deleteNotificationByAdmin,
  deleteAllNotificationByAdmin,
} = require("../app/controllers/NotificationController");

const { validateToken } = require("../app/middleware/validateTokenHandler");

notificationRouter.get("/", validateToken, getAllNotificationsOfUser);
notificationRouter.get("/:notification_id", validateToken, getNotificationById);
notificationRouter.put(
  "/mark-all-seen",
  validateToken,
  updateAllNotificationIsSeen
);
notificationRouter.put(
  "/mark-seen/:notification_id",
  validateToken,
  updateNotificationIsSeen
);
notificationRouter.delete(
  "/:notification_id",
  validateToken,
  deleteNotificationByAdmin
);
notificationRouter.delete(
  "/admin/delete-all",
  validateToken,
  deleteAllNotificationByAdmin
);
notificationRouter.delete(
  "/admin/delete-all/:user_id",
  validateToken,
  deleteAllNotificationOfUserByAdmin
);

module.exports = notificationRouter;
