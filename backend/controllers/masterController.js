const multer = require("multer");
const csvParser = require("csv-parser");
const fs = require("fs");
const MasterUser = require("../models/MasterUser");
const User = require("../models/User");
const upload = multer({ dest: "uploads/" });

exports.getAllUsers = async (req, res) => {
  try {
    const users = await MasterUser.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllFaculty = async (req, res) => {
  try {
    const users = await MasterUser.find({ userType: "faculty" });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    if (req.body.batch === "") {
      req.body.batch = "0000";
    }
    const user = new MasterUser(req.body);
    await user.save();
    const exUser = await User.findOne({ email: user.email });
    if (exUser) {
      exUser.userType = user.userType;
      exUser.department = user.department;
      exUser.batchYear = user.batchYear;
      exUser.collegeId = user.collegeId;
      exUser.parentEmail = user.parentEmail;
      exUser.mode = user.mode;
      await exUser.save();
    }

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await MasterUser.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    if (user.userType || user.department || user.batchYear || user.collegeId || user.parentEmail || user.mode) {
      const exUser = await User.findOne({ email: user.email });
      if(exUser){
      exUser.userType = user.userType;
      exUser.department = user.department;
      exUser.batchYear = user.batchYear;
      exUser.collegeId = user.collegeId;
      exUser.parentEmail = user.parentEmail;
      exUser.mode = user.mode;
      await exUser.save();
          
    }
    }
    res.json(user);
  } catch (error) {
    // console.error(error);
    res.status(400).json({ message: error.message });
  } 
};
 
exports.deleteUser = async (req, res) => {
  try {
    await MasterUser.findOneAndDelete({ _id: req.params.id });
    res.json({ message: "Venue deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.userUploadcsv = async (req, res) => {
  const filePath = req.file.path;

  try {
    const users = [];

    fs.createReadStream(filePath)
      .pipe(
        csvParser({
          mapHeaders: ({ header }) => header.trim().toLowerCase(), // Normalize headers
        })
      )
      .on("data", (row) => {
        const normalizedRow = {
          collegeId: row.collegeid?.trim(),
          name: row.name?.trim(),
          email: row.email?.trim(),
          department: row.department?.trim(),
          batchYear: row.batchyear?.trim(),
          userType: row.usertype?.trim(),
          mode: row.mode?.trim(),
        };
        users.push(normalizedRow);
      })
      .on("end", async () => {
        try {
          const processedUsers = [];
          const errors = [];

          for (const [index, user] of users.entries()) {
            const rowNumber = index + 1;

            // Validate required fields
            const requiredFields = [
              "collegeId",
              "name",
              "email",
              "department",
              "userType",
              "batchYear",
              "mode",
            ];
            const missingFields = requiredFields.filter(
              (field) => !user[field]
            );

            if (missingFields.length > 0) {
              errors.push(
                `Row ${rowNumber}: Missing required fields: ${missingFields.join(
                  ", "
                )}.`
              );
              continue;
            }

            // Check for existing venue ID
            const existingUser = await MasterUser.findOne({
              email: user.email,
            });
            const existingUser2 = await User.findOne({
              email: user.email,
            })
            if(existingUser2){
              existingUser2.userType = user.userType;
              existingUser2.department = user.department;
              existingUser2.batchYear = user.batchYear;
              existingUser2.collegeId = user.collegeId;
              existingUser2.parentEmail = user.parentEmail;
              existingUser2.mode = user.mode;
              await existingUser2.save();
            }
            if (existingUser) {
              errors.push(
                `Row ${rowNumber}: User ID "${user.email}" already exists.`
              );
              continue;
            }

            // Add processed venue to the list
            processedUsers.push({
              collegeId: user.collegeId,
              name: user.name,
              email: user.email,
              department: user.department,
              userType: user.userType,
              batchYear: user.batchYear,
              mode: user.mode,
            });
          }

          // If errors exist, return them without saving data
          if (errors.length > 0) {
            console.log("Validation Errors:", errors);
            return res
              .status(400)
              .json({ message: "Validation failed", errors });
          }

          // Insert validated data into the database
          await MasterUser.insertMany(processedUsers);

          res.status(201).json({ message: "Users uploaded successfully." });
        } catch (error) {
          console.error("Processing Error:", error.message);
          res.status(400).json({ message: error.message });
        } finally {
          // Delete the uploaded file
          fs.unlinkSync(filePath);
        }
      });
  } catch (error) {
    console.error("File Processing Error:", error.message);
    fs.unlinkSync(filePath); // Clean up file in case of error
    res.status(500).json({ message: "Failed to process CSV file.", error });
  }
};
