const mongoose = require("mongoose");
const UserMembershipEnum = require("../../enum/UserMembershipEnum");

const userSchema = mongoose.Schema(
  {
    fullname: {
      type: String,
      maxLength: 255,
    },
    dob: {
      type: Date,
    },
    email: {
      type: String,
      maxLength: 255,
    },
    phone_number: {
      type: String,
      maxLength: 10,
    },
    gender: {
      type: String,
    },
    password: {
      type: String,
    },
    avatar_url: {
      type: String,
    },
    membership: {
      type: String,
      default: UserMembershipEnum.NORMAL,
    },
    account_balance: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
    },
    status: {
      type: Boolean,
      default: true,
    },
    otp: {
      type: Number,
    },
    otpExpired: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
