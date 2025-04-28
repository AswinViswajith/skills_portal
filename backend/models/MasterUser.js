const mongoose = require("mongoose");

const MasterUserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  userType: { 
    type: String, 
    enum: ["admin", "student", "faculty"], 
    default: "student",
    required: true
  },
  department: { type: String, required: false },
  collegeId: { type: String, required: true}, 
  batchYear: { type: String, default: "" },
  mode: { type: String, enum: ["Day Scholar", "Hosteller"] },
  parentEmail: { type: String, required: false },
  createdAt: { type: Date, default: Date.now },
});

const MasterUser = mongoose.model("MasterUser", MasterUserSchema);

module.exports = MasterUser;
