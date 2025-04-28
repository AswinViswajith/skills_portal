const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const skillController = require("../controllers/skillController");

router.get("/", skillController.getSkills);
router.post("/", skillController.createSkill);
router.put("/:id", skillController.updateSkill);
router.delete("/:id", skillController.deleteSkill);
router.post("/upload", upload.single("file") ,skillController.uploadSkillcsv);

module.exports = router;