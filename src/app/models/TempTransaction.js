const mongoose = require("mongoose");

const tempTransactionSchema = mongoose.Schema(
  {
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TempTransaction", tempTransactionSchema);
