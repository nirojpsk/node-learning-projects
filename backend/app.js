import userRoutes from "./routes/userRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import cookieParser from "cookie-parser";
import logger from "./middlewares/logger.js";
import errorHandler from "./middlewares/errorHandler.js";
import express from "express";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(logger);
app.use('/api/auth', userRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use(errorHandler);

export default app;
