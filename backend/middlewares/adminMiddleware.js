const checkAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).send({
      message: "You are not logged in",
    });
  }
  if (req.user.role !== "admin") {
    return res.status(403).send({
      message: "You are not authorized to perform this action",
    });
  }
  next();
};

export default checkAdmin;