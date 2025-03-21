const asyncHandler = require("express-async-handler");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const RoleEnum = require("../../enum/RoleEnum");

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
    let totalIncomeCurrent = totalTransactionCurrent.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const totalTransactionPrevious = await Transaction.find({
      createdAt: { $gte: startOfPreviousPeriod, $lte: endOfPreviousPeriod },
    });
    let totalIncomePrevious = totalTransactionPrevious.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const incomeDifference = totalIncomeCurrent - totalIncomePrevious;

    const totalNewCustomerCurrent = await User.find({
      createdAt: { $gte: startOfPeriod, $lte: endOfPeriod },
      role: RoleEnum.CUSTOMER,
    });

    const totalNewCustomerPrevious = await User.find({
      createdAt: { $gte: startOfPreviousPeriod, $lte: endOfPreviousPeriod },
      role: RoleEnum.CUSTOMER,
    });

    const newCustomerDifference =
      totalNewCustomerCurrent.length - totalNewCustomerPrevious.length;

    const totalNewArtistCurrent = await User.find({
      createdAt: { $gte: startOfPeriod, $lte: endOfPeriod },
      role: RoleEnum.ARTIST,
    });

    const totalNewArtistPrevious = await User.find({
      createdAt: { $gte: startOfPreviousPeriod, $lte: endOfPreviousPeriod },
      role: RoleEnum.ARTIST,
    });

    const newArtistDifference =
      totalNewArtistCurrent.length - totalNewArtistPrevious.length;

    res.status(200).json({
      income: {
        totalIncomeCurrent,
        totalIncomePrevious,
        difference: incomeDifference,
      },
      newCustomers: {
        totalNewCustomerCurrent: totalNewCustomerCurrent.length,
        totalNewCustomerPrevious: totalNewCustomerPrevious.length,
        difference: newCustomerDifference,
      },
      newArtists: {
        totalNewArtistCurrent: totalNewArtistCurrent.length,
        totalNewArtistPrevious: totalNewArtistPrevious.length,
        difference: newArtistDifference,
      },
    });
  } catch (error) {
    res.status(500).send(error.message || "Internal Server Error");
  }
});

const statisticForMonthly = asyncHandler(async (req, res) => {
  try {
    let countTransactions = Array(12).fill(0);
    let totalAmount = Array(12).fill(0);
    let countCustomers = Array(12).fill(0);
    let countArtists = Array(12).fill(0);

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

    const customers = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          },
          role: RoleEnum.CUSTOMER,
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

    const artists = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          },
          role: RoleEnum.ARTIST,
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

    customers.forEach((item) => {
      const monthIndex = item._id.month - 1;
      countCustomers[monthIndex] = item.count;
    });

    artists.forEach((item) => {
      const monthIndex = item._id.month - 1;
      countArtists[monthIndex] = item.count;
    });

    res.status(200).json({
      countTransactions,
      totalAmount,
      countCustomers,
      countArtists,
    });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const statisticSalesForMonth = asyncHandler(async (req, res) => {
  try {
    const now = new Date();

    let startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    let endOfCurrentMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    endOfCurrentMonth.setHours(23, 59, 59, 999);

    let startOfPreviousMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    let endOfPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    endOfPreviousMonth.setHours(23, 59, 59, 999);

    const totalTransactionCurrent = await Transaction.find({
      createdAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
    });
    let totalIncomeCurrent = totalTransactionCurrent.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const totalTransactionPrevious = await Transaction.find({
      createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
    });
    let totalIncomePrevious = totalTransactionPrevious.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    const incomeDifference = totalIncomeCurrent - totalIncomePrevious;

    const totalNewCustomerCurrent = await User.find({
      createdAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
      role: RoleEnum.CUSTOMER,
    });

    const totalNewCustomerPrevious = await User.find({
      createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
      role: RoleEnum.CUSTOMER,
    });

    const newCustomerDifference =
      totalNewCustomerCurrent.length - totalNewCustomerPrevious.length;

    const totalNewArtistCurrent = await User.find({
      createdAt: { $gte: startOfCurrentMonth, $lte: endOfCurrentMonth },
      role: RoleEnum.ARTIST,
    });

    const totalNewArtistPrevious = await User.find({
      createdAt: { $gte: startOfPreviousMonth, $lte: endOfPreviousMonth },
      role: RoleEnum.ARTIST,
    });

    const newArtistDifference =
      totalNewArtistCurrent.length - totalNewArtistPrevious.length;

    res.status(200).json({
      income: {
        totalIncomeCurrent,
        totalIncomePrevious,
        difference: incomeDifference,
      },
      newCustomers: {
        totalNewCustomerCurrent: totalNewCustomerCurrent.length,
        totalNewCustomerPrevious: totalNewCustomerPrevious.length,
        difference: newCustomerDifference,
      },
      newArtists: {
        totalNewArtistCurrent: totalNewArtistCurrent.length,
        totalNewArtistPrevious: totalNewArtistPrevious.length,
        difference: newArtistDifference,
      },
    });
  } catch (error) {
    res.status(500).send(error.message || "Internal Server Error");
  }
});

const statisticUsers = asyncHandler(async (req, res) => {
  try {
    const totalCustomer = await User.countDocuments({
      role: RoleEnum.CUSTOMER,
      status: true,
    });
    const totalArtist = await User.countDocuments({
      role: RoleEnum.ARTIST,
      status: true,
    });
    res.status(200).json({
      totalCustomer,
      totalArtist,
    });
  } catch (error) {
    res.status(500).send(error.message || "Internal Server Error");
  }
});

module.exports = {
  statisticSales,
  statisticSalesForMonth,
  statisticForMonthly,
  statisticUsers,
};
