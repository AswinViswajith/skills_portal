const express = require("express");
const router = express.Router();
const batchController = require("../controllers/batchController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });


router.get("/", batchController.getBatches);
router.post("/", batchController.createBatch);
router.put("/:id", batchController.updateBatch);
router.delete("/:id", batchController.deleteBatch);
router.get("/batchData", batchController.getBatchData);
router.post("/upload", upload.single("file"), batchController.uploadBatchcsv);

module.exports = router;
