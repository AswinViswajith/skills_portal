const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    categoryName: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model("Category", CategorySchema);
  