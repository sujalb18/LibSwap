const SwapRequest = require("../models/SwapRequest");
const Book = require("../models/Book");

// SEND SWAP REQUEST
exports.sendSwapRequest = async (req, res) => {
  try {
    const { requesterId, requestedBookId, offeredBookId, ownerId } = req.body;

    if (!requesterId || !requestedBookId || !offeredBookId || !ownerId) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const swap = await SwapRequest.create({
      requesterId,
      requestedBookId,
      offeredBookId,
      ownerId,
      status: "pending"
    });

    return res.json({ success: true, message: "Swap request sent", data: swap });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ACCEPT SWAP REQUEST
exports.acceptSwapRequest = async (req, res) => {
  try {
    const swapId = req.params.id;

    const swap = await SwapRequest.findById(swapId)
      .populate("requestedBookId")
      .populate("offeredBookId");

    if (!swap) {
      return res.status(404).json({ success: false, message: "Swap request not found" });
    }

    if (swap.status !== "pending") {
      return res.status(400).json({ success: false, message: "Swap already processed" });
    }

    // Swap book ownership
    const requestedBook = swap.requestedBookId;
    const offeredBook = swap.offeredBookId;

    const tempOwner = requestedBook.ownerId;
    requestedBook.ownerId = offeredBook.ownerId;
    offeredBook.ownerId = tempOwner;

    await requestedBook.save();
    await offeredBook.save();

    swap.status = "accepted";
    await swap.save();

    return res.json({ success: true, message: "Swap accepted successfully" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// REJECT SWAP REQUEST
exports.rejectSwapRequest = async (req, res) => {
  try {
    const swapId = req.params.id;

    const swap = await SwapRequest.findById(swapId);

    if (!swap) {
      return res.status(404).json({ success: false, message: "Swap request not found" });
    }

    if (swap.status !== "pending") {
      return res.status(400).json({ success: false, message: "Swap already processed" });
    }

    swap.status = "rejected";
    await swap.save();

    return res.json({ success: true, message: "Swap rejected" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// CANCEL SWAP REQUEST (sender cancels)
exports.cancelSwapRequest = async (req, res) => {
  try {
    const swapId = req.params.id;

    const swap = await SwapRequest.findById(swapId);

    if (!swap) {
      return res.status(404).json({ success: false, message: "Swap request not found" });
    }

    if (swap.status !== "pending") {
      return res.status(400).json({ success: false, message: "Cannot cancel processed swap" });
    }

    swap.status = "cancelled";
    await swap.save();

    return res.json({ success: true, message: "Swap cancelled" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET ALL SWAP REQUESTS (sent + received)
exports.getAllSwapRequests = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Sent requests (you are the requester)
    const sent = await SwapRequest.find({ requesterId: userId })
      .populate("requestedBookId")
      .populate("offeredBookId");

    // Received requests (you are the owner)
    const received = await SwapRequest.find({ ownerId: userId })
      .populate("requestedBookId")
      .populate("offeredBookId");

    return res.json({
      success: true,
      data: { sent, received }
    });

  } catch (err) {
    console.error("Swap fetch error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

