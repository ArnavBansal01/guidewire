const {
  fetchAllClaims,
  approveClaimService,
  rejectClaimService,
  simulateClaimService,
} = require("../services/claimsService");

const getAllClaims = async (req, res) => {
  try {
    const claims = await fetchAllClaims();

    res.json({
      success: true,
      data: claims,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const approveClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await approveClaimService(id);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const rejectClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await rejectClaimService(id);

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const simulateClaim = async (req, res) => {
  try {
    const { city, triggerSource, amount, status, autoTriggered, createdAt } =
      req.body;

    if (!city || !triggerSource) {
      return res.status(400).json({
        success: false,
        error: "city and triggerSource are required",
      });
    }

    const created = await simulateClaimService({
      city,
      triggerSource,
      amount: amount || 250,
      status: status || "PENDING",
      autoTriggered: autoTriggered ?? true,
      createdAt: createdAt || new Date().toISOString(),
    });

    res.json({
      success: true,
      data: created,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  getAllClaims,
  approveClaim,
  rejectClaim,
  simulateClaim,
};
