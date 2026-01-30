import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9.-_]+@[a-zA-Z0-9.-]+\.[a-zA-z]{2,}$/,
        "Please enter a valid email address",
      ],
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
      maxLength: 200,
      validate: {
        validator: function (v) {
          // Only validate complexity if the password is being modified (new or changed)
          if (!this.isModified("password")) return true;
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
            v,
          );
        },
        message:
          "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
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
    phoneNumber: {
      countryCode: {
        type: String,
        default: "+977",
      },
      number: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: [/^[0-9]{10}$/, "Please enter a valid phone number"],
      },
    },
    isDoctorRequested: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

//to hash the password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

//to compare the password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
