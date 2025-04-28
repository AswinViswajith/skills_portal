const mongoose = require("mongoose");

const BatchSchema = new mongoose.Schema({
    batchYear: { type: String, required: true, unique: true },
    createdAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model("Batches", BatchSchema);
