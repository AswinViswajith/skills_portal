const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");
const Department = require("../models/Department");
const path = require("path");

// Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json(departments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new department
exports.createDepartment = async (req, res) => {
  try {
    if (!req.body.departmentName) {
      return res.status(400).json({ message: "Department name is required" });
    }
    const department = new Department({ departmentName: req.body.departmentName });
    await department.save();
    res.status(201).json(department);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Update a department
exports.updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(department);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a department
exports.deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};


exports.uploadDepartmentcsv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const filePath = req.file.path;

    const departments = [];

    // Read and parse the CSV file
    fs.createReadStream(filePath)
      .pipe(csvParser({
          mapHeaders: ({ header }) => header.trim().toLowerCase()
      }))
      .on("data", (row) => {
        if (row.departmentname) {
          departments.push({ departmentName: row.departmentname.trim() });
        }
      })
      .on("end", async () => {
        try {
          // Insert parsed departments into the database
          const processedDepartments = await Department.insertMany(departments, { ordered: false });
          // console.log("Inserted departments:", processedDepartments);

          res.status(201).json({ message: "Departments uploaded successfully." });
        } catch (error) {
          console.error("Failed to insert departments:", error);
          res.status(400).json({ message: "Failed to upload departments.", error });
        } finally {
          // Remove the uploaded file
          fs.unlinkSync(filePath);
        }
      });
  } catch (error) {
    console.error("Error processing CSV:", error);
    res.status(500).json({ message: "Failed to process CSV file.", error });
  }
};