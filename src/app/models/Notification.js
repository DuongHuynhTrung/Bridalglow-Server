const mongoose = require("mongoose");

const notificationSchema = mongoose.Schema(
  {
    receiver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    is_new: {
      type: Boolean,
      default: true,
      required: true,
    },
    noti_describe: {
      type: String,
      required: true,
    },
    noti_type: {
      type: String,
      required: true,
    },
    noti_title: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
