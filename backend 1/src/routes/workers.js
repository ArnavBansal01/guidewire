const express = require("express");
const router = express.Router();
const { getAllWorkers, flagWorker, unflagWorker } = require("../controllers/workersController");

router.get("/", getAllWorkers);
router.patch("/:id/flag", flagWorker);
router.patch("/:id/unflag", unflagWorker);

module.exports = router;
