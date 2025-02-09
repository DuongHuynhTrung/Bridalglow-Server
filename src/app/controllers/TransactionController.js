const asyncHandler = require("express-async-handler");
const RoleEnum = require("../../enum/RoleEnum");
const Transaction = require("../models/Transaction");

const getTransactionsByAdmin = asyncHandler(async (req, res, next) => {
  try {
    if (req.user.roleName !== RoleEnum.ADMIN) {
      res.status(403);
      throw new Error(
        "Chỉ có Admin có quyền truy xuất thông tin tất cả giao dịch"
      );
    }
    let transactions = await Transaction.find().populate("user_id").exec();
    if (!transactions) {
      res.status(400);
      throw new Error(
        "Có lỗi xảy ra khi Admin truy xuất thông tin tất cả giao dịch"
      );
    }
    res.status(200).json(transactions);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const getTransactionsOfUser = asyncHandler(async (req, res, next) => {
  try {
    let transactions = await Transaction.find({ user_id: req.user.id }).exec();
    if (!transactions) {
      res.status(400);
      throw new Error("Có lỗi xảy ra khi truy xuất thông tin tất cả giao dịch");
    }
    res.status(200).json(transactions);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const getTransactionsById = asyncHandler(async (req, res, next) => {
  try {
    const { transaction_id } = req.params;
    let transaction = await Transaction.findById(transaction_id)
      .populate("user_id")
      .exec();
    if (!transaction) {
      res.status(400);
      throw new Error("Có lỗi xảy ra khi truy xuất thông tin tất cả giao dịch");
    }
    res.status(200).json(transaction);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const deleteTransactionById = asyncHandler(async (req, res, next) => {
  try {
    const { transaction_id } = req.params;
    const transaction = await Transaction.findById(transaction_id);
    if (!transaction) {
      res.status(400);
      throw new Error("Có lỗi xảy ra khi truy xuất thông tin tất cả giao dịch");
    }
    await transaction.remove();
    res.status(200).json(transaction);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

module.exports = {
  getTransactionsOfUser,
  getTransactionsByAdmin,
  getTransactionsById,
  deleteTransactionById,
};
