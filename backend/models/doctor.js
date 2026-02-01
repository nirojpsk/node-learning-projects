import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const timeRangeSchema = new mongoose.Schema(
  {
    start: {
      type: String,
      required: true,
      match: [/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Please enter a valid time range"],
    },
    end: {
      type: String,
      required: true,
      match: [/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Please enter a valid time range"],
    },
  },
  { _id: false },
);
const doctorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, //one doctor profile per user
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9.-_]+@[a-zA-Z0-9.-]+\.[a-zA-z]{2,}$/,
        "Please enter a valid email address",
      ],
    },
    phoneNumber: {
      countryCode: {
        type: String,
        default: "+977",
      },
      number: {
        type: String,
        required: true,
        trim: true,
        match: [/^[0-9]{10}$/, "Please enter a valid phone number"],
      },
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    experience: {
      type: Number,
      required: true,
      min: 0,
    },
    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },
    availableSchedule: {
      type: Map,
      of: [timeRangeSchema],
      default: {
        monday: [{ start: "09:00", end: "17:00" }],
        tuesday: [{ start: "09:00", end: "17:00" }],
        wednesday: [],
        thursday: [{ start: "09:00", end: "17:00" }],
        friday: [{ start: "09:00", end: "17:00" }],
        saturday: [],
        sunday: [],
      },
    },
    appointmentDuration: {
      type: Number,
      required: true,
      min: 1,
      max: 120, //in minutes
    },

    profilePicture: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    address: {
      state: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      city: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
      zipCode: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{6}$/, "Please enter a valid zip code"],
      },
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    reviews: [reviewSchema],
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

doctorSchema.pre("save", function () {
  if (this.reviews.length > 0) {
    this.totalReviews = this.reviews.length;
    this.averageRating =
      (this.reviews.reduce((acc, review) => acc + review.rating, 0) /
      this.reviews.length).toFixed(2);
  }
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
