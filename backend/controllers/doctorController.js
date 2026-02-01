import mongoose from "mongoose";
import Doctor from "../models/doctor.js";
import User from "../models/user.js";
import Appointment from "../models/appointment.js";

//A. CREATE DOCTOR PROFILE [DOCTOR]

const createDoctorProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user || !user.isDoctorRequested) {
      return res.status(403).send({
        message: "You have not requested to be a doctor",
      });
    }

    const {
      name,
      email,
      phoneNumber,
      address,
      specialization,
      experience,
      consultationFee,
      profilePicture,
      availableSchedule,
      appointmentDuration,
    } = req.body;

    if (
      !specialization ||
      experience === undefined ||
      consultationFee === undefined ||
      appointmentDuration === undefined
    ) {
      return res.status(400).send({
        message: "All fields are required",
      });
    }

    const existingDoctor = await Doctor.findOne({ userId });
    if (existingDoctor) {
      return res.status(400).send({
        message: "Doctor profile already exists",
      });
    }

    const doctor = await Doctor.create({
      userId,
      name: name || user.name,
      email: email || user.email,
      phoneNumber: phoneNumber || user.phoneNumber,
      address: address || user.address,
      specialization,
      experience,
      consultationFee,
      profilePicture:
        profilePicture ||
        user.profilePicture ||
        "https://cdn-icons-png.flaticon.com/512/149/149071.png",
      availableSchedule,
      appointmentDuration,
    });
    res.status(201).send({
      message: "Doctor profile created successfully",
      doctor,
    });
  } catch (err) {
    res.status(500).send({
      message: "Error while creating doctor profile",
      error: err.message,
    });
  }
};

//B. GET DOCTOR BY ID [USERS]
const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    //validate objectId

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "Invalid doctor id",
      });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).send({
        message: "Doctor not found",
      });
    }
    res.status(200).send({
      message: "Doctor found successfully",
      doctor: {
        name: doctor.name,
        phoneNumber: doctor.phoneNumber,
        profilePicture: doctor.profilePicture,
        specialization: doctor.specialization,
        experience: doctor.experience,
        consultationFee: doctor.consultationFee,
        appointmentDuration: doctor.appointmentDuration,
        availableSchedule: doctor.availableSchedule,
      },
    });
  } catch (err) {
    res.status(500).send({
      message: "Error while getting doctor by id",
      error: err.message,
    });
  }
};

//C. GET PENDING DOCTORS [ADMIN]

const getPendingDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isApproved: false });
    if (doctors.length === 0) {
      return res.status(404).send({
        message: "No pending doctors found",
      });
    }
    res.status(200).send({
      message: "Pending doctors found successfully",
      doctors,
    });
  } catch (err) {
    res.status(500).send({
      message: "Error while getting pending doctors",
      error: err.message,
    });
  }
};

//D. APPROVE DOCTOR [ADMIN]

const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "Invalid doctor id",
      });
    }
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).send({
        message: "Doctor not found",
      });
    }
    if (doctor.isApproved) {
      return res.status(400).send({
        message: "Doctor is already approved",
      });
    }
    doctor.isApproved = true;
    await doctor.save();

    //to update the related user

    const user = await User.findById(doctor.userId);
    if (!user) {
      return res.status(404).send({
        message: "User not found",
      });
    }
    user.role = "doctor";
    user.isDoctorRequested = false;
    await user.save();
    res.status(200).send({
      message: "Doctor approved successfully",
    });
  } catch (err) {
    res.status(500).send({
      message: "Error while approving doctor",
      error: err.message,
    });
  }
};

//E. REJECT DOCTOR [ADMIN]
const rejectDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "Invalid doctor id",
      });
    }
    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).send({
        message: "Doctor not found",
      });
    }
    if (!doctor.isApproved) {
      return res.status(400).send({
        message: "Doctor is already unapproved",
      });
    }
    await Doctor.findByIdAndDelete(id);

    const user = await User.findById(doctor.userId);
    if (user) {
      user.isDoctorRequested = false;
      if (user.role === "doctor") {
        user.role = "patient";
      }
      await user.save();
    }
    res.status(200).send({
      message: "Doctor rejected successfully",
    });
  } catch (err) {
    res.status(500).send({
      message: "Error while rejecting doctor",
      error: err.message,
    });
  }
};

//F. GET APPROVED DOCTORS [USERS]

const getApprovedDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({ isApproved: true }).select(
      "name specialization experience consultationFee phoneNumber profilePicture availableSchedule appointmentDuration",
    );
    if (doctors.length === 0) {
      return res.status(404).send({
        message: "Doctor not found",
      });
    }
    res.status(200).send({
      message: "Found Approved Doctors",
      doctors,
    });
  } catch (err) {
    res.status(500).send({
      message: "Error in getting approved doctors",
      error: err.message,
    });
  }
};

//H. UPDATE DOCTOR PROFILE [DOCTOR]

const updateDoctorProfile = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).send({
        message: "Unauthorized",
      });
    }
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).send({
        message: "Doctor not found",
      });
    }

    const {
      name,
      email,
      phoneNumber,
      address,
      specialization,
      experience,
      consultationFee,
      profilePicture,
      availableSchedule,
      appointmentDuration,
    } = req.body;
    doctor.name = name ?? doctor.name;
    doctor.email = email ?? doctor.email;
    doctor.phoneNumber = phoneNumber ?? doctor.phoneNumber;
    doctor.address = address ?? doctor.address;
    doctor.specialization = specialization ?? doctor.specialization;
    doctor.experience = experience ?? doctor.experience;
    doctor.consultationFee = consultationFee ?? doctor.consultationFee;
    doctor.profilePicture = profilePicture ?? doctor.profilePicture;
    doctor.availableSchedule = availableSchedule ?? doctor.availableSchedule;
    doctor.appointmentDuration =
      appointmentDuration ?? doctor.appointmentDuration;
    await doctor.save();
    res.status(200).send({
      message: "Doctor profile updated successfully",
    });
  } catch (err) {
    res.status(500).send({
      message: "Error in updating doctor profile",
      error: err.message,
    });
  }
};

//I. GET MY DOCTOR PROFILE [DOCTOR]

const getMyDoctorProfile = async (req, res) => {
  try {
    const id = req.user._id;
    if (req.user.role !== "doctor") {
      return res.status(403).send({
        message: "Unauthorized",
      });
    }
    const doctor = await Doctor.findOne({ userId: id });
    if (!doctor) {
      return res.status(404).send({
        message: "Doctor not found",
      });
    }
    res.status(200).send({
      message: "Doctor profile found successfully",
      doctor,
    });
  } catch (err) {
    res.status(500).send({
      message: "Error in getting your doctor profile",
      error: err.message,
    });
  }
};

//J. DELETE DOCTOR PROFILE [DOCTOR AND ADMIN]

const deleteDoctorProfile = async (req, res) => {
  try {
    let userId;
    if (req.user.role === "doctor") {
      userId = req.user._id;
    } else if (req.user.role === "admin") {
      userId = req.params.id;
    } else {
      return res.status(403).send({
        message: "Unauthorized",
      });
    }
    const doctor = await Doctor.findOne({ userId });
    if (!doctor) {
      return res.status(404).send({
        message: "Doctor not found",
      });
    }
    await Doctor.findByIdAndDelete(doctor._id);
    const user = await User.findById(userId);
    if (user) {
      user.role = "patient";
      user.isDoctorRequested = false;
      await user.save();
    }
    res.status(200).send({
      message: "Doctor profile deleted successfully",
    });
  } catch (err) {
    res.status(500).send({
      message: "Error in deleting doctor profile",
      error: err.message,
    });
  }
};

//K. ADD REVIEW [PATIENT]

const addReview = async (req, res) => {
  try {
    const doctorId = req.params.id;
    const { rating, comment } = req.body;

    //only the patient can add reviews
    if (req.user.role !== "patient") {
      return res.status(403).send({
        message: "Only patients are allowed to review",
      });
    }

    //validate doctorId
    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).send({
        message: "Invalid doctor id",
      });
    }
    // check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).send({
        message: "Doctor not found",
      });
    }
    //to check if the patient has booked an appointment with the doctor
    const appointment = await Appointment.findOne({
      patientId: req.user._id,
      doctorId: req.params.id,
      status: "completed",
    });
    if (!appointment) {
      return res.status(403).send({
        message: "You can only review after a completed appointment",
      });
    }

    //check if review already exists
    const reviewExists = doctor.reviews.find(
      (r) => r.userId.toString() === req.user._id.toString(),
    );
    if (reviewExists) {
      return res.status(400).send({
        message: "You have already reviewed this doctor",
      });
    }

    if (!rating) {
      return res.status(400).send({
        message: "Please provide rating",
      });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).send({
        message: "Rating must be between 1 and 5",
      });
    }

    doctor.reviews.push({
      userId: req.user._id,
      rating,
      comment,
    });
    await doctor.save();
    res.status(200).send({
      message: "Review added successfully",
    });
  } catch (err) {
    res.status(500).send({
      message: "Error while adding review",
      error: err.message,
    });
  }
};

//L. GET ALL REVIEWS [DOCTOR]

const getMyReviews = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).send({
        message: "Unauthorized",
      });
    }
    const doctor = await Doctor.findOne({ userId: req.user._id }).populate(
      "reviews.userId",
      "name profilePicture",
    );
    if (!doctor) {
      return res.status(404).send({
        message: "Doctor not found",
      });
    }
    res.status(200).send({
      message:
        doctor.reviews.length === 0
          ? "No reviews yet"
          : "Reviews fetched successfully",
      totalReviews: doctor.totalReviews,
      averageRating: doctor.averageRating,
      reviews: doctor.reviews,
    });
  } catch (err) {
    res.status(500).send({
      message: "Error while fetching reviews",
      error: err.message,
    });
  }
};

export {
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
};
