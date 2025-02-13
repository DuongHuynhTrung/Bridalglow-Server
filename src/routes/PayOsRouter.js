const express = require("express");
const payOsRouter = express.Router();

const {
  createBuyServicesPayOsUrl,
  payOsCallBack,
} = require("../app/controllers/PayOsController");
const { validateToken } = require("../app/middleware/validateTokenHandler");

payOsRouter.post(
  "/create-buy-services",
  validateToken,
  createBuyServicesPayOsUrl
);
payOsRouter.post("/callback", payOsCallBack);

module.exports = payOsRouter;
