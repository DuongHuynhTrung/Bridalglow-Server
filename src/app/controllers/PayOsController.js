const asyncHandler = require("express-async-handler");
const RoleEnum = require("../../enum/RoleEnum");
const Transaction = require("../models/Transaction");
const PayOS = require("@payos/node");
const User = require("../models/User");
const TransactionTypeEnum = require("../../enum/TransactionTypeEnum");
const NotificationTypeEnum = require("../../enum/NotificationTypeEnum");
const Notification = require("../models/Notification");
const UserMembershipEnum = require("../../enum/UserMembershipEnum");
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUMS_KEY
);

const createAddFundsPayOsUrl = asyncHandler(async (req, res) => {
  try {
    if (req.user.roleName !== RoleEnum.CUSTOMER) {
      res.status(403);
      throw new Error("Chỉ có khách hàng có quyền thanh toán giao dịch");
    }

    const requestData = {
      orderCode: Date.now(),
      amount: req.body.amount,
      description: `${req.user?.email.split("@")[0] || "email"} ${
        TransactionTypeEnum.ADD_FUNDS
      }`,
      cancelUrl: "https://smart-room-rental.vercel.app/history",
      returnUrl: "https://smart-room-rental.vercel.app/history",
    };
    const paymentLinkData = await payos.createPaymentLink(requestData);
    res.status(200).json({ paymentUrl: paymentLinkData.checkoutUrl });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const createUpMembershipPayOsUrl = asyncHandler(async (req, res) => {
  try {
    if (req.user.roleName !== RoleEnum.CUSTOMER) {
      res.status(403);
      throw new Error("Chỉ có khách hàng có quyền thanh toán giao dịch");
    }
    const membership = req.params.membership;
    let description = "";
    switch (membership) {
      case UserMembershipEnum.SILVER: {
        description = `${req.user?.email.split("@")[0] || "email"} 1`;
        break;
      }
      case UserMembershipEnum.GOLD: {
        description = `${req.user?.email.split("@")[0] || "email"} 2`;
        break;
      }
      case UserMembershipEnum.DIAMOND: {
        description = `${req.user?.email.split("@")[0] || "email"} 3`;
        break;
      }
      default: {
        res.status(400);
        throw new Error("Gói thành viên không hợp lệ");
      }
    }
    const requestData = {
      orderCode: Date.now(),
      amount: req.body.amount,
      description: description,
      cancelUrl: "https://smart-room-rental.vercel.app/account",
      returnUrl: "https://smart-room-rental.vercel.app/account",
    };
    const paymentLinkData = await payos.createPaymentLink(requestData);
    res.status(200).json({ paymentUrl: paymentLinkData.checkoutUrl });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

// @desc Create a new transaction
// @route POST /api/transactions
// @access private (Admin only)
const payOsCallBack = asyncHandler(async (req, res) => {
  try {
    const code = req.body.code;
    if (code == "00") {
      const { description, amount, orderCode } = req.body.data;
      const email = description.split(" ")[0];
      const type = description.split(" ")[1];
      const user = await User.findOne({ email: `${email}@gmail.com` });
      if (type == "addfunds") {
        user.account_balance += amount;
        await user.save();

        // create transaction
        const transaction = new Transaction({
          user_id: user._id,
          amount: amount,
          transaction_code: orderCode,
        });
        await transaction.save();

        // Create Notification
        const notification = new Notification({
          receiver_id: user._id,
          noti_describe:
            "Giao dịch thanh toán của bạn đã hoàn tất. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!",
          noti_title: "Thanh toán thành công",
          noti_type: NotificationTypeEnum.PAYMENT_SUCCESSFUL,
        });
        await notification.save();

        _io.emit(`new-noti-${user._id}`, notification);
        _io.emit(`user-info-${user._id}`, user);
      } else {
        switch (type) {
          case "1": {
            user.membership = UserMembershipEnum.SILVER;
            break;
          }
          case "2": {
            user.membership = UserMembershipEnum.GOLD;
            break;
          }
          case "3": {
            user.membership = UserMembershipEnum.DIAMOND;
            break;
          }
          default: {
            user.membership = type;
          }
        }
        await user.save();

        // create transaction
        const transaction = new Transaction({
          user_id: user._id,
          amount: amount,
          transaction_type: TransactionTypeEnum.UP_MEMBERSHIP,
          transaction_code: orderCode,
        });
        await transaction.save();

        // Create Notification
        const notification = new Notification({
          receiver_id: user._id,
          noti_describe: `Chúc mừng! Tài khoản của bạn đã được nâng cấp thành công lên gói thành viên ${type}`,
          noti_title: "Tài khoản của bạn đã được nâng cấp",
          noti_type: NotificationTypeEnum.UP_MEMBERSHIP,
        });
        await notification.save();

        _io.emit(`new-noti-${user._id}`, notification);
        _io.emit(`user-info-${user._id}`, user);
      }
      const admin = await User.findOne({ role: RoleEnum.ADMIN });
      console.log(admin);
      // Create Notification
      const notificationAdmin = new Notification({
        receiver_id: admin._id,
        noti_describe:
          "Một giao dịch mới vừa được thực hiện. Vui lòng kiểm tra chi tiết giao dịch vừa tạo.",
        noti_title: "Có giao dịch mới phát sinh",
        noti_type: NotificationTypeEnum.NEW_TRANSACTION,
      });
      await notificationAdmin.save();

      _io.emit(`new-noti-${admin._id}`, notificationAdmin);

      res.status(200).send("Success");
    }
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

module.exports = {
  createAddFundsPayOsUrl,
  createUpMembershipPayOsUrl,
  payOsCallBack,
};
