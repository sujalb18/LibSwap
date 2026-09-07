import mongoose from "mongoose";
import SwapRequest from "../models/SwapRequest.js";
import Book from "../models/Book.js";

// Fetch all incoming swap requests for a book owner
export const getIncomingRequests = async (req, res) => {
  try {
    const { userId } = req.params;

    const requests = await SwapRequest.find({ ownerId: userId })
      .populate("bookId", "title author")
      .populate("requesterId", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error("Fetch incoming requests error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// Accept or reject a swap request with atomic ownership transfer
export const respondToSwapRequest = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const { requestId } = req.params;
    const { status } = req.body; // "accepted" or "rejected"

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    session.startTransaction();

    const swapRequest = await SwapRequest.findById(requestId).session(session);

    if (!swapRequest) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Swap request not found"
      });
    }

    if (swapRequest.status !== "pending") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "This request has already been processed"
      });
    }

    // Update request status within transaction session
    swapRequest.status = status;
    await swapRequest.save({ session });

    // Transfer book ownership if request is accepted
    if (status === "accepted") {
      const updatedBook = await Book.findByIdAndUpdate(
        swapRequest.bookId,
        { ownerId: swapRequest.requesterId },
        { session, new: true }
      );

      if (!updatedBook) {
        throw new Error("Book not found for ownership transfer");
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: `Swap request ${status} successfully. Ownership updated atomically.`,
      data: swapRequest
    });

  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    console.error("Respond swap transaction error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during swap transaction"
    });
  }
};