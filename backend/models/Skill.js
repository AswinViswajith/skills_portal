const mongoose = require("mongoose");

const SkillSchema = new mongoose.Schema({
  skillName: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const Skill = mongoose.model("Skill", SkillSchema);

module.exports = Skill;