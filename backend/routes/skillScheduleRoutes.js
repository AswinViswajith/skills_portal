const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const skillScheduleController = require("../controllers/skillScheduleController");



// Ensure upload directory exists
const uploadPath = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });

  const fileUrl = `/uploads/${req.file.filename}`;

  return res.status(200).json({ name: req.file.originalname, url: fileUrl });
});

module.exports = router;


router.get('/adminDashboard', skillScheduleController.adminDashboard);
router.get('/facultyDashboard', skillScheduleController.facultyDashboard);
router.post('/attendance/:skillId/create', skillScheduleController.createAttendanceEntry);
router.delete('/attendance/:skillId/delete', skillScheduleController.deleteAttendanceDate);
router.post("/feedback/:skillId/add", skillScheduleController.addFeedback);
router.put("/feedback/:skillId/:feedbackId/mark-read",skillScheduleController.markFeedbackAsRead);
router.get("/fetchOpen", skillScheduleController.fetchOpen);
router.put("/sendRequest/:id", skillScheduleController.sendRequest);
router.put("/approveOrReject/:id", skillScheduleController.approverOrReject);
router.put("/activeOrDeactive/:id", skillScheduleController.activeOrDeactive);
router.put("/enroll/:id", skillScheduleController.enroll);
router.post("/requestData", skillScheduleController.getRequests);
router.put("/moveToDraft/:id", skillScheduleController.moveToDraft);



router.get("/", skillScheduleController.getAllSkillSchedules);
router.post("/", skillScheduleController.createSkillSchedule);
router.put("/:id", skillScheduleController.editSkillSchedule);
router.delete("/:id", skillScheduleController.deleteSkillSchedule);
router.get("/:id", skillScheduleController.getSkillScheduleById);


module.exports = router;