const mongoose = require("mongoose");

const tempTransactionSchema = mongoose.Schema(
  {
    type: {
      type: String,
    },

    // Temp Transaction
    orderCode: {
      type: Number,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    service_id: {
      type: [String],
    },

    // Temp Schedule
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TempTransaction", tempTransactionSchema);
