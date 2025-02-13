const asyncHandler = require("express-async-handler");
const RoleEnum = require("../../enum/RoleEnum");
const Transaction = require("../models/Transaction");
const PayOS = require("@payos/node");
const TempTransaction = require("../models/TempTransaction");
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

      // create transaction
      const transaction = new Transaction({
        user_id: tempTransaction.user_id,
        service_id: tempTransaction.service_id,
        payment_method: "internet_banking",
        amount: amount,
        transaction_code: orderCode,
      });
      await transaction.save();

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
  payOsCallBack,
};
