const express = require("express");
const scheduleRouter = express.Router();

const {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateScheduleById,
  deleteScheduleById,
  getFreeSlot,
} = require("../app/controllers/ScheduleController");

const {
  validateToken,
  validateTokenAdmin,
} = require("../app/middleware/validateTokenHandler");

scheduleRouter.get("/", validateToken, getAllSchedules);
scheduleRouter.get("/free-slot", validateToken, getFreeSlot);
scheduleRouter.get("/:schedule_id", validateToken, getScheduleById);
scheduleRouter.post("/", validateToken, createSchedule);
scheduleRouter.put("/:schedule_id", validateToken, updateScheduleById);
scheduleRouter.delete("/:schedule_id", validateTokenAdmin, deleteScheduleById);

module.exports = scheduleRouter;
