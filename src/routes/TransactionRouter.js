const express = require("express");
const transactionRouter = express.Router();

const {
  getTransactionsOfUser,
  getTransactionsByAdmin,
  getTransactionsById,
  deleteTransactionById,
} = require("../app/controllers/TransactionController");

const {
  validateToken,
  validateTokenAdmin,
} = require("../app/middleware/validateTokenHandler");

transactionRouter.get("/", validateToken, getTransactionsOfUser);
transactionRouter.get("/admin", validateTokenAdmin, getTransactionsByAdmin);
transactionRouter.get("/:transaction_id", validateToken, getTransactionsById);
transactionRouter.delete(
  "/:transaction_id",
  validateTokenAdmin,
  deleteTransactionById
);

module.exports = transactionRouter;
