const mongoose = require("mongoose");

const VenueSchema = new mongoose.Schema({
    venueName: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
  });
  
  module.exports = mongoose.model("Venue", VenueSchema);