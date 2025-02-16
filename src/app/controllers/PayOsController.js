const asyncHandler = require("express-async-handler");
const RoleEnum = require("../../enum/RoleEnum");
const Transaction = require("../models/Transaction");
const PayOS = require("@payos/node");
const TempTransaction = require("../models/TempTransaction");
const Schedule = require("../models/Schedule");
const User = require("../models/User");
const payos = new PayOS(
  process.env.PAYOS_CLIENT_ID,
  process.env.PAYOS_API_KEY,
  process.env.PAYOS_CHECKSUMS_KEY
);

const createBuyServicesPayOsUrl = asyncHandler(async (req, res) => {
  try {
    if (req.user.roleName !== RoleEnum.CUSTOMER) {
      res.status(403);
      throw new Error("Chỉ có khách hàng có quyền thanh toán giao dịch");
    }
    const { amount, service_id } = req.body;
    const requestData = {
      orderCode: Date.now(),
      amount: amount,
      description: `Thanh toán mua dịch vụ`,
      cancelUrl: "https://bridalglow.vercel.app",
      returnUrl: "https://bridalglow.vercel.app",
    };
    const paymentLinkData = await payos.createPaymentLink(requestData);
    const tempTransaction = new TempTransaction({
      orderCode: requestData.orderCode,
      user_id: req.user.id,
      service_id: service_id,
      type: "buy_service",
    });
    await tempTransaction.save();
    res.status(200).json({ paymentUrl: paymentLinkData.checkoutUrl });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const createSchedulePayOsUrl = asyncHandler(async (req, res) => {
  try {
    const {
      customer_id,
      artist_id,
      appointment_date,
      slot,
      place,
      service_id,
      amount,
    } = req.body;

    if (
      !customer_id ||
      !artist_id ||
      !appointment_date ||
      !slot ||
      !place ||
      !service_id ||
      !amount
    ) {
      res.status(400);
      throw new Error("Vui lòng cung cấp đầy đủ thông tin lịch hẹn");
    }

    const customer = await User.findById(customer_id);
    if (!customer) {
      res.status(404);
      throw new Error("Khách hàng không tồn tại");
    }
    const artist = await User.findById(artist_id);
    if (!artist) {
      res.status(404);
      throw new Error("Thợ trang điểm không tồn tại");
    }

    const checkExist = await Schedule.findOne({
      appointment_date: appointment_date,
      slot: slot,
      artist_id: artist_id,
    });
    if (checkExist) {
      res.status(400);
      throw new Error("Thợ trang điểm đã có lịch hẹn vào thời gian này");
    }

    // Create payos url
    const requestData = {
      orderCode: Date.now(),
      amount: amount,
      description: `Thanh toán mua dịch vụ`,
      cancelUrl: "https://bridalglow.vercel.app",
      returnUrl: "https://bridalglow.vercel.app",
    };
    const paymentLinkData = await payos.createPaymentLink(requestData);

    // Create Temporary Transaction
    const tempTransaction = new TempTransaction({
      orderCode: requestData.orderCode,
      user_id: req.user.id,
      // Temp Schedule Data
      customer_id: customer_id,
      artist_id: artist_id,
      appointment_date: appointment_date,
      slot: slot,
      place: place,
      service_id: [service_id],
    });
    await tempTransaction.save();

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
      const { amount, orderCode } = req.body.data;
      const tempTransaction = await TempTransaction.findOne({
        orderCode: orderCode,
      });
      if (tempTransaction.type === "buy_service") {
        // create transaction
        const transaction = new Transaction({
          user_id: tempTransaction.user_id,
          service_id: tempTransaction.service_id,
          payment_method: "internet_banking",
          amount: amount,
          transaction_code: orderCode,
        });
        await transaction.save();
      } else {
        const {
          customer_id,
          artist_id,
          appointment_date,
          slot,
          place,
          service_id,
        } = tempTransaction;
        // create schedule
        const schedule = new Schedule({
          customer_id,
          artist_id,
          appointment_date,
          slot,
          place,
          service_id: service_id[0],
        });
        await schedule.save();

        // create transaction
        const transaction = new Transaction({
          user_id: tempTransaction.user_id,
          service_id: tempTransaction.service_id,
          payment_method: "internet_banking",
          amount: amount,
          transaction_code: orderCode,
        });
        await transaction.save();
      }

      // Remove temp Transaction
      await tempTransaction.remove();

      res.status(200).send("Success");
    }
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

module.exports = {
  createBuyServicesPayOsUrl,
  createSchedulePayOsUrl,
  payOsCallBack,
};
