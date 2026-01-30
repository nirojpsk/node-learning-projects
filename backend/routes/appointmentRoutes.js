import {
  bookAppointment,
  patientAppointments,
  cancelAppointment,
  doctorAppointments,
  confirmAppointment,
  rejectAppointment,
  completeAppointment,
  getAllAppointments,
  updatePaymentStatus,
} from "../controllers/appointmentController.js";
import checkAuth from "../middlewares/authMiddleware.js";
import checkAdmin from "../middlewares/adminMiddleware.js";
import express from "express";

const router = express.Router();

router.post("/", checkAuth, bookAppointment);
router.get("/my-appointments", checkAuth, patientAppointments);
router.get("/doctor/my-appointments", checkAuth, doctorAppointments);
router.get("/admin/appointments", checkAuth, checkAdmin, getAllAppointments);
router.put("/doctor/confirm/:id", checkAuth, confirmAppointment);
router.put("/doctor/reject/:id", checkAuth, rejectAppointment);
router.put("/doctor/complete/:id", checkAuth, completeAppointment);
router.put("/payment/:id", checkAuth, checkAdmin, updatePaymentStatus);
router.delete("/cancel/:id", checkAuth, cancelAppointment);

export default router;
