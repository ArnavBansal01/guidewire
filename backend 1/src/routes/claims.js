const express = require("express");

const router = express.Router();

const {
  getAllClaims,
  approveClaim,
  rejectClaim,
  simulateClaim,
} = require("../controllers/claimsController");

router.get("/", getAllClaims);
router.post("/simulate", simulateClaim);
router.patch("/:id/approve", approveClaim);
router.patch("/:id/reject", rejectClaim);

module.exports = router;
