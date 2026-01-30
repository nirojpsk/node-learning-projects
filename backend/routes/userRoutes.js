import {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  changePassword,
  deleteUser,
  logOut,
  getProfile,
  requestDoctorApproval,
} from "../controllers/userController.js";
import checkAuth from "../middlewares/authMiddleware.js";
import checkAdmin from "../middlewares/adminMiddleware.js";
import express from "express";

const router = express.Router();

//We should always put static routes like /register, /login, /logout, /profile, /change-password, /doctor-request before dynamic routes like /:id
router.post("/register", register);
router.post("/login", login);
router.post("/logout", checkAuth, logOut);
router.get("/profile", checkAuth, getProfile);
router.put("/change-password", checkAuth, changePassword);
router.post("/doctor-request", checkAuth, requestDoctorApproval);
router.get("/", checkAuth, checkAdmin, getAllUsers);
router.get("/:id", checkAuth, checkAdmin, getUserById);
router.put("/:id", checkAuth, checkAdmin, updateUser);
router.delete("/:id", checkAuth, checkAdmin, deleteUser);

export default router;
