const csvParser = require("csv-parser");
const fs = require("fs");
const Batch = require("../models/Batches");
const Department = require("../models/Department");
const Venue = require("../models/Venue");

exports.getBatches = async (req, res) => {
  try {
    const batches = await Batch.find();
    res.status(200).json(batches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.createBatch = async (req, res) => {
  try {
    if (!req.body.batchYear) {
      return res.status(400).json({ message: "Batch year is required" });
    }
    const batch = new Batch({ batchYear: req.body.batchYear });
    await batch.save();
    res.status(201).json(batch);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateBatch = async (req, res) => {
  try {
    const Batches = await Batch.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(Batches);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a department
exports.deleteBatch = async (req, res) => {
  try {
    await Batch.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Batch deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};


exports.uploadBatchcsv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const filePath = req.file.path; 

    const Batch = [];

    fs.createReadStream(filePath)
      .pipe(csvParser({
        mapHeaders: ({ header }) => header.trim().toLowerCase()
      }
      ))
      .on("data", (row) => {
        console.log(row);
        if (row.batchyear) {
          console.log("Batch Year:", row.batchyear);
          Batch.push({ batchYear: row.batchyear.trim() });
        }
        
      })
      .on("end", async () => {
        try {
          const processedbatches = await Batch.insertMany(Batch, { ordered: false });
          // console.log("Inserted categories:", processedCategories);

          res.status(201).json({ message: "Batches uploaded successfully." });
        } catch (error) {
          console.error("Failed to insert Batches:", error);
          res.status(400).json({ message: "Failed to upload Batches ", error });
        } finally {
          fs.unlinkSync(filePath);
        }
      });
  } catch (error) {
    console.error("Error processing CSV:", error);
    res.status(500).json({ message: "Failed to process CSV file.", error });
  }
}; 


exports.getBatchData = async (req, res) => {
  try {
    const batches = await Batch.find();
    const departments = await Department.find();
    const venues = await Venue.find();
    res.status(200).json({ batches, departments, venues });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};