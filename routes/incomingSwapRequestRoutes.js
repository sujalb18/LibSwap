import express from "express";
import {
  getIncomingRequests,
  respondToSwapRequest
} from "../controllers/incomingSwapRequestController.js";

const router = express.Router();

// GET /swap/incoming/:userId
router.get("/:userId", getIncomingRequests);

// PUT /swap/incoming/respond/:requestId
router.put("/respond/:requestId", respondToSwapRequest);

export default router;


//app.use("/swap/incoming", incomingSwapRoutes);
//add this to server.js after branches for swaps and student dashboard have been merged