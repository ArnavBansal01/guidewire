const { fetchAllWorkers, flagWorkerService, unflagWorkerService } = require("../services/workersService");

const getAllWorkers = async (req, res) => {
  try {
    const workers = await fetchAllWorkers();
    res.json({ success: true, data: workers });
  } catch (error) {
    console.error("[WORKERS] Error fetching workers:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const flagWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await flagWorkerService(id);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("[WORKERS] Error flagging worker:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

const unflagWorker = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await unflagWorkerService(id);
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("[WORKERS] Error unflagging worker:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getAllWorkers, flagWorker, unflagWorker };
