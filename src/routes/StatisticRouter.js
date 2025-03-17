const express = require("express");
const statisticRouter = express.Router();

const {
  validateTokenAdmin,
} = require("../app/middleware/validateTokenHandler");
const {
  statisticSales,
  statisticForMonthly,
  statisticSalesForMonth,
  statisticUsers,
} = require("../app/controllers/StatisticController");

statisticRouter.get("/users", validateTokenAdmin, statisticUsers);
statisticRouter.get("/sales", validateTokenAdmin, statisticSales);
statisticRouter.get("/sales/month", validateTokenAdmin, statisticSalesForMonth);
statisticRouter.get("/monthly/:year", validateTokenAdmin, statisticForMonthly);

module.exports = statisticRouter;
