const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const moment = require("moment");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const masterRoutes = require("./routes/masterRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const batchRoutes = require("./routes/batchRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const venueRoutes = require("./routes/venueRoutes");
const skillRoutes = require("./routes/skillRoutes");
const skillScheduleRoutes = require("./routes/skillScheduleRoutes");
const verifyToken = require("./Middleware/jwtAuth");
const SkillSchedule = require("./models/SkillSchedule");
const User = require("./models/User");


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: "*",
    credentials: true,
  },
});

io.on("connection", (socket) => {
    console.log("User connected:", socket.id);
  
    socket.on("updateAttendance", async (data) => {
      const { skillId, participantId, date, status } = data;

      if (!["Present", "Absent", "On-Duty", "Pending"].includes(status)) {
        return;
      }

      const skill = await SkillSchedule.findById(skillId);
      if (!skill) return;

      const session = skill.attendance.find(
        (a) => moment(a.date).format("YYYY-MM-DD") === date
      );
      if (!session) return;

      const participant = session.participants.find(
        (p) => p.participantId.toString() === participantId
      );
      if (participant) {
        participant.status = status;
        await skill.save();
        io.emit("attendanceUpdated", { skillId, participantId, date, status });
      }
    });
  });
  



app.use(cors({ origin: "*" }));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/master/departments", departmentRoutes);
app.use("/api/master/batch", batchRoutes);
app.use("/api/master/category", categoryRoutes);
app.use("/api/master/skill", skillRoutes);
app.use("/api/master", masterRoutes);
app.use("/api/master/venue", venueRoutes);
app.use("/api/skillSchedule", verifyToken,skillScheduleRoutes);
app.use("/uploads", express.static("public/uploads"));




mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("⚙️ Connected to MongoDB"))
    .catch((error) => console.error("Error connecting to MongoDB:", error));


const PORT = process.env.PORT || 8000;


server.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});




