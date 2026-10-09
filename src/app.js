const express = require("express");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
const PORT = 5000;



//Routes

const User = require("./routes/user");
const Subject = require("./routes/subject");
const Teacher = require("./routes/teacher");
const Class = require("./routes/class");
const Role= require("./routes/role");
const Period = require("./routes/period");
const Section = require("./routes/section");
const Schedules = require("./routes/schedule");
const verifyToken = require("./middleware/verifyToken");
const Admin = require("./routes/admin");
const Hod = require("./routes/hod");




app.use(cors());

app.use(express.json());
app.use(cookieParser());


//useRoutes
app.use("/user",User);
app.use("/role", Role);
app.use("/class", Class);
app.use("/teacher", Teacher);
app.use("/section", Section);
app.use("/subject", Subject);
app.use("/period", Period);
app.use("/admin", Admin);
app.use("/hod", Hod);
app.use("/schedule" , Schedules);


//Start Server

app.listen(PORT, '0.0.0.0', () => {
  console.log('Server running on port 5000');
});