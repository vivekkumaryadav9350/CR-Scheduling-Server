const express = require("express");
require("dotenv").config();

const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Routes
const User = require("./routes/user");
const Subject = require("./routes/subject");
const Teacher = require("./routes/teacher");
const Class = require("./routes/class");
const Role = require("./routes/role");
const Period = require("./routes/period");
const Section = require("./routes/section");
const Schedules = require("./routes/schedule");
const Admin = require("./routes/admin");
const Hod = require("./routes/hod");

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/user", User);
app.use("/role", Role);
app.use("/class", Class);
app.use("/teacher", Teacher);
app.use("/section", Section);
app.use("/subject", Subject);
app.use("/period", Period);
app.use("/admin", Admin);
app.use("/hod", Hod);
app.use("/schedule", Schedules);

// Health check
app.get("/", (req, res) => {
  res.status(200).send("Classroom API is running!");
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});