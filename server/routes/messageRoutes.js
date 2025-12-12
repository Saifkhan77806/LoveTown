// routes/messages.js
import express from "express";
import { Message } from "../models/Message.js";
import { User } from "../models/User.js";

const router = express.Router();

// Get conversation between two users
router.get("/conversation/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    const { limit = 100, skip = 0 } = req.query;

    const messages = await Message.find({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 },
      ],
    })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Message.countDocuments({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 },
      ],
    });

    res.json({
      success: true,
      messages: messages.reverse(), // Reverse to get chronological order
      total,
      hasMore: total > parseInt(skip) + messages.length,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversation",
      error: error.message,
    });
  }
});

// Get message count between two users
router.get("/count/:user1/:user2", async (req, res) => {
  try {
    const { user1, user2 } = req.params;

    const count = await Message.countDocuments({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 },
      ],
    });

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Error counting messages:", error);
    res.status(500).json({
      success: false,
      message: "Failed to count messages",
      error: error.message,
    });
  }
});

// Delete a message (soft delete or hard delete)
router.delete("/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;
    const { userId } = req.body; // User requesting deletion

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only allow sender to delete
    if (message.from !== userId) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message",
      });
    }

    await Message.findByIdAndDelete(messageId);

    // Remove from user's message array
    await User.updateOne(
      { email: message.from },
      { $pull: { messages: { message: messageId } } }
    );

    await User.updateOne(
      { email: message.to },
      { $pull: { messages: { message: messageId } } }
    );

    res.json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: error.message,
    });
  }
});

// Get all conversations for a user
router.get("/user/:email/conversations", async (req, res) => {
  try {
    const { email } = req.params;

    // Get all unique conversation partners
    const sentMessages = await Message.distinct("to", { from: email });
    const receivedMessages = await Message.distinct("from", { to: email });

    const conversationPartners = [
      ...new Set([...sentMessages, ...receivedMessages]),
    ];

    // Get last message for each conversation
    const conversations = await Promise.all(
      conversationPartners.map(async (partner) => {
        const lastMessage = await Message.findOne({
          $or: [
            { from: email, to: partner },
            { from: partner, to: email },
          ],
        }).sort({ timestamp: -1 });

        const unreadCount = await Message.countDocuments({
          from: partner,
          to: email,
          read: false, // You'd need to add this field to schema
        });

        const totalMessages = await Message.countDocuments({
          $or: [
            { from: email, to: partner },
            { from: partner, to: email },
          ],
        });

        return {
          partner,
          lastMessage,
          unreadCount,
          totalMessages,
        };
      })
    );

    // Sort by most recent message
    conversations.sort(
      (a, b) =>
        new Date(b.lastMessage?.timestamp || 0) -
        new Date(a.lastMessage?.timestamp || 0)
    );

    res.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
      error: error.message,
    });
  }
});

export default router;
