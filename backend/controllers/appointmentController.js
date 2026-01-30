import Appointment from "../models/appointment.js";
import User from "../models/user.js";
import Doctor from "../models/doctor.js";
import mongoose from "mongoose";
//1.BOOK APPOINTMENT (PATIENT)

const bookAppointment = async (req, res) => {
  try {
    //to check the role of the requested user
    if (req.user.role !== "patient") {
      return res.status(403).send({
        message: "Only Patients can book appointments",
      });
    }
    const { doctorId, appointmentDate, appointmentTime, notes, paymentMethod } =
      req.body;
    const patientId = req.user._id;
    //to check if all fields are filled
    if (!doctorId || !appointmentDate || !appointmentTime || !paymentMethod) {
      return res.status(400).send({
        message: "Please fill all the required fields",
      });
    }
    //to check if doctor exists and is approved
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || !doctor.isApproved) {
      return res.status(404).send({
        message: "Doctor not found or not approved",
      });
    }
    //to check if appointment already exists
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate,
      "appointmentTime.start": appointmentTime.start,
      "appointmentTime.end": appointmentTime.end,
    });
    if (existingAppointment) {
      return res.status(400).send({
        message: "This time Slot is already booked",
      });
    }
    //to create new appointment
    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate,
      appointmentTime,
      notes,
      status: "pending",
      paymentStatus: "pending",
      paymentId: `TEMP-${Date.now()}`,
      paymentDate: new Date(),
      paymentAmount: doctor.consultationFee,
      paymentMethod,
    });
    return res.status(201).send({
      message: "Appointment booked successfully",
      appointment,
    });
  } catch (err) {
    return res.status(500).send({
      message: "Error while booking appointment",
      error: err.message,
    });
  }
};

//2. GET MY APPOINTMENTS (PATIENT)
const patientAppointments = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).send({
        message: "Only patients are authorized",
      });
    }
    const appointments = await Appointment.find({ patientId: req.user._id })
      .populate("doctorId", "name specialization profilePicture")
      .sort({ appointmentDate: -1 });

    if (appointments.length === 0) {
      return res.status(404).send({
        message: "No appointments are found",
      });
    }
    res.status(200).send({
      message: "Found your appointments",
      appointments,
    });
  } catch (err) {
    res.status(500).send({
      message: "Error while getting patient appointments",
      error: err.message,
    });
  }
};

//3. CANCEL APPOINTMENT (PATIENT)
const cancelAppointment = async (req, res) => {
  try {
    if (req.user.role !== "patient") {
      return res.status(403).send({
        message: "You are not authorized to cancel this appointment",
      });
    }
    const { id } = req.params; //appointment id
    //to check if appointment id is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "Invalid appointment id",
      });
    }
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).send({
        message: "Appointment not found",
      });
    }
    //to check if the user is authorized to cancel the appointment
    if (appointment.patientId.toString() !== req.user._id.toString()) {
      return res.status(403).send({
        message: "YOu are not authorized to cancel this appointment",
      });
    }
    if (appointment.status !== "pending") {
      return res.status(400).send({
        message: "Appointment is not in pending state",
      });
    }
    appointment.status = "cancelled";
    await appointment.save();
    res.status(200).send({
      message: "Appointment cancelled successfully",
    });
  } catch (err) {
    res.status(500).send({
      message: "Error while cancelling appointments",
      error: err.message,
    });
  }
};

//4. GET MY APPOINTMENTS (DOCTOR)
const doctorAppointments = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).send({
        message: "Only doctors are authorized",
      });
    }
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).send({
        message: "Doctor profile not found",
      });
    }
    const appointments = await Appointment.find({ doctorId: doctor._id })
      .populate("patientId", "name email profilePicture notes")
      .sort({ appointmentDate: -1 });

    res.status(200).send({
      message: "Found your appointments",
      appointments,
    });
  } catch (err) {
    res.status(500).send({
      message: "Error while getting appointments for doctor",
      error: err.message,
    });
  }
};

//5. CONFIRM APPOINTMENT (DOCTOR)
const confirmAppointment = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).send({
        message: "You are not authorized",
      });
    }
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "Please enter the valid appointment id",
      });
    }
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).send({
        message: "Appointment not found",
      });
    }
    //to find doctor profile of logged-in user
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).send({
        message: "Doctor profile not found",
      });
    }
    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).send({
        message: "You are not authorized to cancel this appointment",
      });
    }
    if (appointment.status !== "pending") {
      return res.status(400).send({
        message: "Appointment is not in pending state",
      });
    }
    appointment.status = "confirmed";
    await appointment.save();
    res.status(200).send({
      message: "Appointment confirmed successfully",
    });
  } catch (err) {
    res.status(500).send({
      message: "Error while Confirming the appointment",
    });
  }
};

//6. REJECT APPOINTMENT (DOCTOR)
const rejectAppointment = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).send({
        message: "You are not authorized",
      });
    }
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "Please enter the valid appointment id",
      });
    }
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).send({
        message: "Appointment not found",
      });
    }
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).send({
        message: "Doctor profile not found",
      });
    }
    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).send({
        message: "You are not authorized to reject this appointment",
      });
    }
    if (appointment.status !== "pending") {
      return res.status(400).send({
        message: "Appointment is not in pending state",
      });
    }
    appointment.status = "cancelled";
    await appointment.save();
    res.status(200).send({
      message: "Appointment Rejected successfully",
    });
  } catch (err) {
    res.status(500).send({
      message: "Error while Rejecting the appointment",
    });
  }
};

//7. COMPLETE APPPOINTMENT (DOCTOR)
const completeAppointment = async (req, res) => {
  try {
    if (req.user.role !== "doctor") {
      return res.status(403).send({
        message: "You are not authorized",
      });
    }
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "Please enter the valid appointment id",
      });
    }
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).send({
        message: "Appointment not found",
      });
    }
    const doctor = await Doctor.findOne({ userId: req.user._id });
    if (!doctor) {
      return res.status(404).send({
        message: "Doctor profile not found",
      });
    }
    if (appointment.doctorId.toString() !== doctor._id.toString()) {
      return res.status(403).send({
        message: "You are not authorized to cancel this appointment",
      });
    }
    if (appointment.status !== "confirmed") {
      return res.status(400).send({
        message: "Only confirmed appointments can be completed",
      });
    }
    appointment.status = "completed";
    await appointment.save();
    res.status(200).send({
      message: "Appointment Completed successfully",
    });
  } catch (err) {
    res.status(500).send({
      message: "Error while completing the appointment",
    });
  }
};

//8. GET ALL APPOINTMENTS (ADMIN)
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("patientId", "name email profilePicture")
      .populate(
        "doctorId",
        "name specialization experience profilePicture consultationFee notes",
      )
      .sort({ appointmentDate: -1 });
    res.status(200).send({
      message: "Found all appointments",
      appointments,
    });
  } catch (error) {
    res.status(500).send({
      message: "Error while getting all appointments",
      error: error.message,
    });
  }
};

//9. UPDATE PAYMENT STATUS [admin]
const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentId } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).send({
        message: "Please enter the valid appointment id",
      });
    }
    if (!["pending", "paid", "failed"].includes(paymentStatus)) {
      return res.status(400).send({
        message: "Invalid payment status",
      });
    }
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).send({
        message: "Appointment not found",
      });
    }
    if (appointment.status === "cancelled") {
      return res.status(400).send({
        message: "Cannot update payment for cancelled Appointment",
      });
    }
    if (appointment.status === "paid") {
      return res.status(400).send({
        message: "Payment already completed",
      });
    }
    if (paymentStatus === "paid" && !paymentId) {
      return res.status(400).send({
        message: "Payment ID is required for paid status",
      });
    }
    //if same payment id is found
    const existingPayment = await Appointment.findOne({ paymentId });
    if (existingPayment) {
      return res.status(400).send({
        message: "Payment ID already exists",
      });
    }
    appointment.paymentStatus = paymentStatus;
    if (paymentStatus === "paid") {
      appointment.paymentId = paymentId;
      appointment.paymentDate = new Date();
    }
    await appointment.save();
    res.status(200).send({
      message: "Payment status updated successfully",
      appointment,
    });
  } catch (err) {
    res.status(500).send({
      message: "Error while updating payment status",
      error: err.message,
    });
  }
};

export {
  bookAppointment,
  patientAppointments,
  cancelAppointment,
  doctorAppointments,
  confirmAppointment,
  rejectAppointment,
  completeAppointment,
  getAllAppointments,
  updatePaymentStatus,
};
