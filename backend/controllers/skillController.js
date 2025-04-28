const Skill = require("../models/Skill");

exports.getSkills = async (req, res) => {
  try {
    const skills = await Skill.find();
    res.status(200).json(skills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.createSkill = async (req, res) => {
  try {
    if (!req.body.skillName) {
      return res.status(400).json({ message: "Skill name is required" });
    }
    const skill = new Skill({ skillName: req.body.skillName });
    await skill.save();
    res.status(201).json(skill);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateSkill = async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(skill);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteSkill = async (req, res) => {
  try {
    await Skill.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Skill deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

exports.uploadSkillcsv = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    const filePath = req.file.path;

    const skills = [];

    // Read and parse the CSV file
    fs.createReadStream(filePath)
      .pipe(
        csvParser({
          mapHeaders: ({ header }) => header.trim().toLowerCase(),
        })
      )
      .on("data", (row) => {
        if (row.skillname) {
          skills.push({ departmentName: row.skillname.trim() });
        }
      })
      .on("end", async () => {
        try {
          const processedSkills = await Skill.insertMany(skills, {
            ordered: false,
          });

          res.status(201).json({ message: "Skills uploaded successfully." });
        } catch (error) {
          console.error("Failed to insert Skills:", error);
          res.status(400).json({ message: "Failed to upload Skills.", error });
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
