const Message = require("../models/ContactUsModule");

// Add new message
const addMessage = async (req, res, next) => {
  const { name, gmail, Contact, Subject, Message: messageText, userId } = req.body;

  try {
    const message = new Message({
      name,
      gmail,
      Contact,
      Subject,
      Message: messageText,
      userId,
      status: "Open",
      createdAt: new Date(),
    });

    await message.save();
    
    res.status(201).json({
      success: true,
      message: "Support ticket submitted successfully",
      data: message,
    });
  } catch (err) {
    console.error("Error creating message:", err);
    res.status(500).json({
      success: false,
      message: "Failed to submit support ticket",
      error: err.message,
    });
  }
};

// Get messages by email
const getByEmail = async (req, res, next) => {
  const gmail = req.params.gmail;

  try {
    const messages = await Message.find({ gmail }).sort({ createdAt: -1 });
    
    if (!messages || messages.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No messages found for this email",
      });
    }

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: err.message,
    });
  }
};

// Get messages by userId
const getByUserId = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const messages = await Message.find({ userId }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
      error: err.message,
    });
  }
};

// Get message by ID
const getById = async (req, res, next) => {
  const id = req.params.id;

  try {
    const message = await Message.findById(id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (err) {
    console.error("Error fetching message:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch message",
      error: err.message,
    });
  }
};

// Update message
const updateMessage = async (req, res, next) => {
  const id = req.params.id;
  const { name, gmail, Contact, Subject, Message: messageText, status, adminResponse } = req.body;

  try {
    const updateData = {
      updatedAt: new Date(),
    };

    // Only update fields that are provided
    if (name) updateData.name = name;
    if (gmail) updateData.gmail = gmail;
    if (Contact) updateData.Contact = Contact;
    if (Subject) updateData.Subject = Subject;
    if (messageText) updateData.Message = messageText;
    if (status) updateData.status = status;
    if (adminResponse !== undefined) updateData.adminResponse = adminResponse;

    const updatedMessage = await Message.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message updated successfully",
      data: updatedMessage,
    });
  } catch (err) {
    console.error("Error updating message:", err);
    res.status(500).json({
      success: false,
      message: "Failed to update message",
      error: err.message,
    });
  }
};

// Delete message
const deleteMsg = async (req, res, next) => {
  const id = req.params.id;

  try {
    const deletedMessage = await Message.findByIdAndDelete(id);

    if (!deletedMessage) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting message:", err);
    res.status(500).json({
      success: false,
      message: "Failed to delete message",
      error: err.message,
    });
  }
};

module.exports = {
  addMessage,
  getByEmail,
  getByUserId,
  getById,
  updateMessage,
  deleteMsg,
};