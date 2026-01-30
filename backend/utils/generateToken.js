import jwt from "jsonwebtoken";

const generateToken = (_id, role, res) => {
  const token = jwt.sign({ _id, role }, process.env.JWT_SECRET_KEY, {
    expiresIn: "3d",
  });
  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 3* 24 * 60 * 60 * 1000,
  });
  return token;
};

export default generateToken;
