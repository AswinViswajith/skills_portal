const express = require("express");
const router = express.Router();
const venueController = require("../controllers/venueController");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.get("/", venueController.getVenues);
router.post("/", venueController.createVenue);
router.put("/:id", venueController.updateVenue);
router.delete("/:id", venueController.deleteVenue);
router.post("/upload", upload.single("file"), venueController.uploadVenuecsv);

module.exports = router;
