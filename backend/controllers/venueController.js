const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");
const Venue = require("../models/Venue");
const path = require("path");
const moment = require("moment");
const MasterUser = require("../models/MasterUser");

// Get all venues
exports.getVenues = async (req, res) => {
  try {
    const venues = await Venue.find();
    res.status(200).json(venues);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new venue
exports.createVenue = async (req, res) => { 
  try {
    const { venueName, capacity } = req.body;
    if (!venueName || !capacity) {
      return res.status(400).json({ message: "Venue name and capacity are required" });
    }
    const newVenue = new Venue({ venueName, capacity });
    await newVenue.save();
    res.status(201).json(newVenue);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Update a venue
exports.updateVenue = async (req, res) => {
  try {
    const updatedVenue = await Venue.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedVenue);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a venue
exports.deleteVenue = async (req, res) => {
  try {
    await Venue.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Venue deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Upload venues via CSV
exports.uploadVenuecsv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }
    
    const filePath = req.file.path;
    const venues = [];

    fs.createReadStream(filePath)
      .pipe(csvParser({ mapHeaders: ({ header }) => header.trim().toLowerCase() }))
      .on("data", (row) => {
        if (row.venuename && row.capacity) {
          venues.push({ venueName: row.venuename.trim(), capacity: parseInt(row.capacity, 10) });
        }
      })
      .on("end", async () => {
        try {
          await Venue.insertMany(venues, { ordered: false });
          res.status(201).json({ message: "Venues uploaded successfully." });
        } catch (error) {
          console.error("Failed to insert venues:", error);
          res.status(400).json({ message: "Failed to upload venues.", error });
        } finally {
          fs.unlinkSync(filePath);
        }
      });
  } catch (error) {
    console.error("Error processing CSV:", error);
    res.status(500).json({ message: "Failed to process CSV file.", error });
  }
};


  