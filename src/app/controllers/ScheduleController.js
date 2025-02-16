const asyncHandler = require("express-async-handler");
const Schedule = require("../models/Schedule");
const SlotEnum = require("../../enum/SlotEnum");
const User = require("../models/User");

const getAllSchedules = asyncHandler(async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate("customer_id")
      .populate("artist_id")
      .exec();
    res.status(200).json(schedules);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const getScheduleById = asyncHandler(async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.schedule_id)
      .populate("customer_id")
      .populate("artist_id")
      .exec();
    if (!schedule) {
      res.status(404);
      throw new Error("Lịch hẹn không tồn tại");
    }
    res.status(200).json(schedule);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const createSchedule = asyncHandler(async (req, res) => {
  try {
    const {
      customer_id,
      artist_id,
      appointment_date,
      slot,
      place,
      service_id,
    } = req.body;

    if (
      !customer_id ||
      !artist_id ||
      !appointment_date ||
      !slot ||
      !place ||
      !service_id
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

    const schedule = new Schedule({
      customer_id,
      artist_id,
      appointment_date,
      slot,
      place,
      service_id,
    });

    const savedSchedule = await schedule.save();
    res.status(201).json(savedSchedule);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

// Cập nhật lịch hẹn theo ID
const updateScheduleById = asyncHandler(async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.schedule_id);
    if (!schedule) {
      res.status(404);
      throw new Error("Lịch hẹn không tồn tại");
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.schedule_id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedSchedule);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

// Xóa lịch hẹn theo ID
const deleteScheduleById = asyncHandler(async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.schedule_id);
    if (!schedule) {
      res.status(404);
      throw new Error("Lịch hẹn không tồn tại");
    }

    await schedule.remove();
    res.status(200).json({ message: "Lịch hẹn đã được xóa" });
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

const getFreeSlot = asyncHandler(async (req, res, next) => {
  try {
    const { artist_id, appointment_date } = req.body;
    const schedules = await Schedule.find({
      artist_id,
      appointment_date,
    });
    const slots = schedules.map((schedule) => schedule.slot);
    const freeSlots = [SlotEnum.MORNING, SlotEnum.AFTERNOON].filter(
      (slot) => !slots.includes(slot)
    );
    res.status(200).json(freeSlots);
  } catch (error) {
    res
      .status(res.statusCode || 500)
      .send(error.message || "Internal Server Error");
  }
});

module.exports = {
  getAllSchedules,
  getScheduleById,
  createSchedule,
  updateScheduleById,
  deleteScheduleById,
  getFreeSlot,
};
