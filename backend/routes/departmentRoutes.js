const express = require("express");
const router = express.Router();
const departmentController = require("../controllers/departmentController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });


router.get("/", departmentController.getDepartments);
router.post("/", departmentController.createDepartment);
router.put("/:id", departmentController.updateDepartment);
router.delete("/:id", departmentController.deleteDepartment);
router.post("/upload", upload.single("file"), departmentController.uploadDepartmentcsv);

module.exports = router;
