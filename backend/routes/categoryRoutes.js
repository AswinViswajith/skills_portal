const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });


router.get("/", categoryController.getCategory);
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);
router.post("/upload", upload.single("file"), categoryController.uploadCategorycsv);

module.exports = router;
