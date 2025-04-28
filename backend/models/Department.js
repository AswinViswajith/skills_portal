const mongoose = require("mongoose");

const DepartmentSchema = new mongoose.Schema({
    departmentName: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model("Department", DepartmentSchema);
  