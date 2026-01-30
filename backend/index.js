import app from "./app.js";
import connectDB from "./db/connectDB.js";
import dotenv from "dotenv";
dotenv.config();
connectDB()
  .then(() => {
    app.listen(3000, () => {
      console.log("Server is running on port 3000");
    });
  })
  .catch((error) => {
    console.log("Failed to connect to the database", error);
    process.exit(1);
  });
