const mongoose = require("mongoose");

const SkillSchema = new mongoose.Schema({
  EventId: { type: mongoose.Types.ObjectId, required: true, ref: "Skill" },
  skillName: { type: String, required: true },
  regStartTime: { type: Date, required: true },
  regEndTime: { type: Date, required: true },
  organiser: { type: String, required: true },
  taggedDepartment: [{ type: String }],
  taggedYear: { type: String },
  budget: { type: Number, required: true },
  venueName: [{ type: String, required: true }],
  totalDays: { type: Number, required: true },
  maxCount: { type: Number, required: true },
  acknowledgedDoc: [{ url: { type: String }, name: { type: String } }],
  participants: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  description: { type: String, required: true },
  skillStartTime: { type: String, required: true },
  skillEndTime: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  // numofvenue: { type: Number, required: true },
  // numoffaculties: { type: Number, required: true },
  attendance: [
    {
      date: { type: Date, required: true },
      participants: [
        {
          participantId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
          participantEmail: { type: String, required: true },
          participantName: { type: String, required: true },
          status: {
            type: String,
            enum: ["Present", "Absent", "On-Duty", "Pending"], // Add "On-Duty"
            default: "Pending",
          },
        },
      ],
    },
  ],
  feedbacks:[{
    participantId: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }],
  isOpenForAll: { type: Boolean, default: false },
  state: { type: String, enum: ["Active", "Deactive"], default: "Deactive" },
  status: {
    type: String,
    enum: ["Approved", "Pending", "Rejected", "Draft"],
    default: "Draft",
  },
  message: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

const SkillSchedule = mongoose.model("SkillSchedules", SkillSchema);

module.exports = SkillSchedule;
