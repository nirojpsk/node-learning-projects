import fs from "fs";
import path from "path";

const logger = (req, res, next) => {
  const today = new Date();
  const timestamp = `${today.getFullYear()}Y-${today.getMonth() + 1}M-${today.getDate()}D::${today.getHours()}H:${today.getMinutes()}M:${today.getSeconds()}S`;
  const start = Date.now();

  res.on("finish", () => {
    const end = Date.now();
    const duration = start - end;
    const logMessage = `[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms\n`;
    console.log(logMessage.trim());
    fs.appendFile(
      path.join(path.resolve(), "app.log"),
      logMessage + "\n",
      (err) => {
        if (err) {
          console.error("Error writing to log file:", err);
        }
      },
    );
  });
  next();
};

export default logger;
