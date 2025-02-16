const mongoose = require("mongoose");

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
    role: {
      type: String,
    },
    description: {
      type: String,
    },
    achivements: {
      type: String,
    },
    fanpage: {
      type: String,
    },
    experience: {
      type: String,
    },
    makeup_img_list: {
      type: [String],
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
