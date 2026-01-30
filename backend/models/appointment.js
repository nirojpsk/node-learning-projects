import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    appointmentTime: {
      start: {
        type: String,
        required: true,
        match: [
          /^(?:[01]\d|2[0-3]):[0-5]\d$/,
          "Please enter a valid time range",
        ],
      },
      end: {
        type: String,
        required: true,
        match: [
          /^(?:[01]\d|2[0-3]):[0-5]\d$/,
          "Please enter a valid time range",
        ],
      },
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    paymentId: {
      type: String,
      unique: true,
      trim: true,
      default: null,
    },
    paymentDate: {
      type: Date,
      default: null,
    },
    paymentAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["esewa", "khalti"],
      default: "esewa",
    },
    notes: {
      type: String,
      trim: true,
      maxLength: 500,
    },
  },
  { timestamps: true },
);

appointmentSchema.pre("validate", function () {
  if (
    this.appointmentTime &&
    this.appointmentTime.start >= this.appointmentTime.end
  ) {
    throw new Error("Appointment end time must be after start time");
  }
});

const Appointment = mongoose.model("Appointment", appointmentSchema);

export default Appointment;
