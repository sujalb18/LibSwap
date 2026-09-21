const express = require("express");
const swapController = require("../controllers/swapController");

const router = express.Router();

// Send swap request
router.post("/send", swapController.sendSwapRequest);

// Accept swap
router.post("/accept/:id", swapController.acceptSwapRequest);

// Reject swap
router.post("/reject/:id", swapController.rejectSwapRequest);

// Cancel swap
router.post("/cancel/:id", swapController.cancelSwapRequest);

// Get all swap requests (sent + received)
router.get("/dashboard/swap-all/:userId", swapController.getAllSwapRequests);

module.exports = router;
