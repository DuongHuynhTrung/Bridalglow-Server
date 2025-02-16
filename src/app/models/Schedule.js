const mongoose = require("mongoose");

const scheduleSchema = mongoose.Schema(
  {
    customer_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    artist_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    appointment_date: {
      type: Date,
      required: true,
    },
    slot: {
      type: String,
      required: true,
    },
    place: {
      type: String,
      required: true,
    },
    service_id: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
