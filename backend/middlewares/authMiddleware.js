import User from "../models/user.js";
import jwt from "jsonwebtoken";

const checkAuth = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).send({
      message: "You are not logged in!!!",
    });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decodedToken._id);
    if (!user) {
      return res.status(404).send({
        message: "User not found!!!",
      });
    }
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isDoctorRequested: user.isDoctorRequested,
    };
    next();
  } catch (err) {
    res.status(401).send({
      message: "Invalid Token!!!",
      error: err.message,
    });
  }
};

export default checkAuth;
