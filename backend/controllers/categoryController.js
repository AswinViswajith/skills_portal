const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");
const Department = require("../models/Department");
const path = require("path");
const Category = require("../models/Category");

exports.getCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    if (!req.body.categoryName) {
      return res.status(400).json({ message: "Category name is required" });
    }
    const category = new Category({ categoryName: req.body.categoryName });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

// Delete a department
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};


exports.uploadCategorycsv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const filePath = req.file.path;

    const category = [];

    fs.createReadStream(filePath)
      .pipe(csvParser({
        mapHeaders: ({ header }) => header.trim().toLowerCase()
      }
      ))
      .on("data", (row) => {
        console.log(row);
        if (row.categoryname) {
          console.log("Category Name:", row.categoryname);
          category.push({ categoryName: row.categoryname.trim() });
        }
        
      })
      .on("end", async () => {
        try {
          const processedCategories = await Category.insertMany(category, { ordered: false });
          // console.log("Inserted categories:", processedCategories);

          res.status(201).json({ message: "Categories uploaded successfully." });
        } catch (error) {
          console.error("Failed to insert Categories:", error);
          res.status(400).json({ message: "Failed to upload Categories.", error });
        } finally {
          fs.unlinkSync(filePath);
        }
      });
  } catch (error) {
    console.error("Error processing CSV:", error);
    res.status(500).json({ message: "Failed to process CSV file.", error });
  }
};