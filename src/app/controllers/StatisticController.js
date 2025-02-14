const asyncHandler = require("express-async-handler");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

const statisticSales = asyncHandler(async (req, res) => {
  try {
    const now = new Date();

    let startOfPeriod = new Date(now);
    startOfPeriod.setHours(0, 0, 0, 0);
    let endOfPeriod = new Date(now);
    endOfPeriod.setHours(23, 59, 59, 999);

    let startOfPreviousPeriod = new Date(startOfPeriod);
    startOfPreviousPeriod.setDate(startOfPreviousPeriod.getDate() - 1);
    let endOfPreviousPeriod = new Date(endOfPeriod);
    endOfPreviousPeriod.setDate(endOfPreviousPeriod.getDate() - 1);

    const totalTransactionCurrent = await Transaction.find({
      createdAt: { $gte: startOfPeriod, $lte: endOfPeriod },
    });
    let totalIncomeCurrent = 0;
    totalTransactionCurrent.forEach(
      (transaction) => (totalIncomeCurrent += transaction.amount)
    );

    const totalTransactionPrevious = await Transaction.find({
      createdAt: { $gte: startOfPreviousPeriod, $lte: endOfPreviousPeriod },
    });
    let totalIncomePrevious = 0;
    totalTransactionPrevious.forEach(
      (transaction) => (totalIncomePrevious += transaction.amount)
    );

    const incomeDifferencePercent =
      totalIncomePrevious !== 0
        ? ((totalIncomeCurrent - totalIncomePrevious) / totalIncomePrevious) *
          100
        : totalIncomeCurrent !== 0
        ? 100
        : 0;

    const totalNewUserCurrent = await User.find({
      createdAt: { $gte: startOfPeriod, $lte: endOfPeriod },
    });

    const totalNewUserPrevious = await User.find({
      createdAt: { $gte: startOfPreviousPeriod, $lte: endOfPreviousPeriod },
    });

    const newUserDifferencePercent =
      totalNewUserPrevious.length !== 0
        ? ((totalNewUserCurrent.length - totalNewUserPrevious.length) /
            totalNewUserPrevious.length) *
          100
        : totalNewUserCurrent.length !== 0
        ? 100
        : 0;

    res.status(200).json({
      income: {
        totalIncomeCurrent,
        totalIncomePrevious,
        differencePercent: incomeDifferencePercent,
      },
      newUsers: {
        totalNewUsersCurrent: totalNewUserCurrent.length,
        totalNewUsersPrevious: totalNewUserPrevious.length,
        differencePercent: newUserDifferencePercent,
      },
    });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const statisticForMonthly = asyncHandler(async (req, res) => {
  try {
    let countTransactions = Array(12).fill(0);
    let totalAmount = Array(12).fill(0);
    let countUsers = Array(12).fill(0);

    const year = req.params.year;

    const transactions = await Transaction.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    const users = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          },
        },
      },
      {
        $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]);

    transactions.forEach((item) => {
      const monthIndex = item._id.month - 1;
      countTransactions[monthIndex] = item.count;
      totalAmount[monthIndex] = item.totalAmount;
    });

    users.forEach((item) => {
      const monthIndex = item._id.month - 1;
      countUsers[monthIndex] = item.count;
    });

    res.status(200).json({
      countTransactions,
      totalAmount,
      countUsers,
    });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

module.exports = {
  statisticSales,
  statisticForMonthly,
};
