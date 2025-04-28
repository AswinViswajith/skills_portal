const mongoose = require("mongoose");
const Department = require("./Department");

const UserSchema = new mongoose.Schema({
  googleId: { type: String, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  collegeId: { type: String, default: "" },
  picture: { type: String },
  userType: { type: String, enum: ["admin", "student", "faculty"], default: "student" },
  department: { type: String, default: "" },
  mode: { type: String, enum: ["Day Scholar", "Hosteller"] },
  batchYear: { type: String, default: ""},
  isActive: { type: Boolean, default: true },
  attendancePoints: { type: Number, default: 0 },
  totalAttendanceHours: { type: Number, default: 0 },
  parentEmail: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
