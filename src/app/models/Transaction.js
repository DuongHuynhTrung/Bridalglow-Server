const mongoose = require("mongoose");

const transactionSchema = mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    service_id: {
      type: [String],
    },
    payment_method: {
      type: String,
    },
    amount: {
      type: Number,
    },
    transaction_code: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);
