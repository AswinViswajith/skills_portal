const express = require("express");
const { getAllUsers, createUser, updateUser, deleteUser, userUploadcsv, getAllEmails, createEmail, updateEmail, deleteEmail, references, uploadEmailcsv, studentDashboard, facultyDashboard, adminDashboard, getAllFaculty } = require("../controllers/masterController");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const path = require("path");



router.get("/", getAllUsers);

router.post("/", createUser);

router.get("/getFaculty", getAllFaculty);

router.put("/:id", updateUser); 

router.delete("/:id", deleteUser);

router.post("/upload", upload.single("file"), userUploadcsv);

 

module.exports = router;
 