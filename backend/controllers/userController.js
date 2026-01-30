import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";
//A. REGISTER NEW USER

const register = async (req, res) => {
  try {
    const { name, email, password, profilePicture, address, phoneNumber } =
      req.body;
    if (!name || !email || !password || !address || !phoneNumber) {
      return res.status(400).send({
        message: "Please fill all the required fields",
      });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (user) {
      return res.status(400).send({
        message: "User already exists",
      });
    }
    const registeredUser = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: "patient",
      profilePicture,
      address,
      phoneNumber,
    });
    res.status(201).send({
      message: "User registered successfully",
      user: {
        id: registeredUser._id,
        name: registeredUser.name,
        email: registeredUser.email,
        role: registeredUser.role,
        profilePicture: registeredUser.profilePicture,
      },
    });
  } catch (err) {
    res.status(500).send({
      message: "Error Registering User",
      error: err.message,
    });
  }
};

//B. LOGIN USER

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send({
        message: "Please fill all the required fields",
      });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(400).send({
        message: "Please provide valid credentials",
      });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).send({
        message: "Please provide valid credentials",
      });
    }
generateToken(user._id, user.role, res);
    res.status(200).send({
      message: "User logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).send({
      message: "Error Logging In",
      error: err.message,
    });
  }
};

//C. GETALLUSERS (admin)

const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).send({
        message: "Unauthorized",
      });
    }
    const users = await User.find().select("-password");
    res.status(200).send({
      message: "All users fetched successfully",
      users,
    });
  } catch (err) {
    res.status(500).send({
      message: "Error Getting All Users",
      error: err.message,
    });
  }
};

//D. GETUSERBYID (admin)

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).send({
        message: "Access Denied",
      });
    }
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).send({
        message: "User not Found",
      });
    }
    res.status(200).send({
      message: "User fetched successfully",
      user,
    });
  } catch (err) {
    res.status(500).send({
      message: "Error Getting The User",
      error: err.message,
    });
  }
};

//E. UPDATEUSER (admin)

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, profilePicture, address, phoneNumber } = req.body;
    if (req.user.role !== "admin" && req.user._id.toString() !== id) {
      return res.status(403).send({
        message: "Access Denied",
      });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({
        message: "User not found",
      });
    }
    user.name = name || user.name;
    user.email = email ? email.toLowerCase() : user.email;
    user.profilePicture = profilePicture || user.profilePicture;
    user.address = address || user.address;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    await user.save();
    res.status(200).send({
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        address: user.address,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (err) {
    res.status(500).send({
      message: "Error Updating the User",
      error: err.message,
    });
  }
};

//F. CHANGE PASSWORD (logged in user only)

const changePassword = async (req, res) => {
  try {
    const id = req.user._id;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).send({
        message: "Please fill all the required fields",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).send({
        message: "New password must be at least 8 characters long",
      });
    }
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({
        message: "User not found",
      });
    }
    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) {
      return res.status(400).send({
        message: "Old Password is incorrect",
      });
    }

    const isSamePasword = await user.comparePassword(newPassword);
    if (isSamePasword) {
      return res.status(400).send({
        message: "New password cannot be the same as old password",
      });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).send({
      message: "Password changed successfully",
    });
  } catch (err) {
    res.status(500).send({
      message: "Error Changing Password",
      error: err.message,
    });
  }
};

//G. DELETEUSER (admin)

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user.role !== "admin") {
      return res.status(403).send({
        message: "Access Denied",
      });
    }
    if (req.user._id.toString() === id) {
      return res.status(400).send({
        message: "Admin cannot delete their own account",
      });
    }
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return res.status(404).send({
        message: "User not found",
      });
    }
    res.status(200).send({
      message: "User deleted successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).send({
      message: "Error Deleting User",
      error: err.message,
    });
  }
};

//H. LOGOUTUSER (logged in user only)

const logOut = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.status(200).send({
      message: "User logged out successfully",
    });
  } catch (err) {
    res.status(500).send({
      message: "Error Logging Out",
      error: err.message,
    });
  }
};

//I. GET PROFILE OF CURRENT LOGGED IN USER

const getProfile = async (req, res) => {
  try {
    const id = req.user._id;
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).send({
        message: "User not found",
      });
    }
    res.status(200).send({
      message: "User fetched successfully",
      profile: user,
    });
  } catch (err) {
    res.status(500).send({
      message: "Error Getting Profile",
      error: err.message,
    });
  }
};

//J. REQUESTDOCTORAPPROVAL [MARK USER AS REQUESTING DOCTOR APPROVAL]

const requestDoctorApproval = async (req, res) => {
  try {
    const id = req.user._id;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).send({
        message: "User not found",
      });
    }

    if (user.isDoctorRequested) {
      return res.status(400).send({
        message: "Doctor approval already requested",
      });
    }

    user.isDoctorRequested = true;
    await user.save();
    res.status(200).send({
      message: "Doctor approval requested successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).send({
      message: "Error Requesting Doctor Approval",
      error: err.message,
    });
  }
};

export {
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
};
