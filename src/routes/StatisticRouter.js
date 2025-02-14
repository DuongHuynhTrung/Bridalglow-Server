const express = require("express");
const statisticRouter = express.Router();

const {
  validateTokenAdmin,
} = require("../app/middleware/validateTokenHandler");
const {
  statisticSales,
  statisticForMonthly,
} = require("../app/controllers/StatisticController");

statisticRouter.get("/sales", validateTokenAdmin, statisticSales);
statisticRouter.get("/monthly/:year", validateTokenAdmin, statisticForMonthly);

module.exports = statisticRouter;
