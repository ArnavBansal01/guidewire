const express = require("express");
const router = express.Router();
const { getDashboardSummary } = require("../controllers/admin.controller");
const { getSystemIntelligence } = require("../controllers/adminIntelligence.controller");

router.get("/", getDashboardSummary);
router.get("/intelligence", getSystemIntelligence);

module.exports = router;