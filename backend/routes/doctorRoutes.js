import express from "express";
import checkAuth from "../middlewares/authMiddleware.js";
import checkAdmin from "../middlewares/adminMiddleware.js";
import {
  createDoctorProfile,
  getDoctorById,
  getPendingDoctors,
  approveDoctor,
  rejectDoctor,
  getApprovedDoctors,
  updateDoctorProfile,
  getMyDoctorProfile,
  deleteDoctorProfile,
  addReview,
  getMyReviews,
} from "../controllers/doctorController.js";

const router = express.Router();

router.post("/", checkAuth, createDoctorProfile);

router.get("/my-profile", checkAuth, getMyDoctorProfile);
router.put("/my-profile", checkAuth, updateDoctorProfile);
router.delete("/my-profile", checkAuth, deleteDoctorProfile);

router.get("/my-reviews", checkAuth, getMyReviews);
router.post("/:id/reviews", checkAuth, addReview);

router.get("/approved", checkAuth, getApprovedDoctors);

router.get("/admin/pending", checkAuth, checkAdmin, getPendingDoctors);
router.put("/admin/approve/:id", checkAuth, checkAdmin, approveDoctor);
router.put("/admin/reject/:id", checkAuth, checkAdmin, rejectDoctor);
router.delete("/admin/delete/:id", checkAuth, checkAdmin, deleteDoctorProfile);

router.get("/:id", checkAuth, getDoctorById);

export default router;
