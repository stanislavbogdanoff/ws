const { Message } = require("../models/messageSchema");

//@route  POST /messages

const sendPublicMessage = async (req, res) => {
  try {
    const io = req.app.get("io");

    const senderId = req.user._id; // Assuming req.user contains user data

    const message = await Message.create({
      ...req.body,
      sender: senderId,
      isPublic: true,
    });

    const newMessage = await Message.findById(message._id).populate("sender");

    // Отправляет событие всем подключенным клиентам
    io.emit("public_message", newMessage);

    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

//@rotue  GET /messages

const getPublicMessages = async (req, res) => {
  try {
    const messages = await Message.find({ isPublic: true })
      .populate("sender")
      .sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

//@route  POST /messages/private

const sendPrivateMessage = async (req, res) => {
  try {
    const io = req.app.get("io");

    const { recieverId } = req.body;
    const senderId = String(req.user._id);

    const message = await Message.create({
      ...req.body,
      sender: senderId,
      reciever: recieverId,
    });

    const newMessage = await Message.findById(message._id)
      .populate("reciever")
      .populate("sender");

    io.to(senderId).to(recieverId).emit("message", newMessage);

    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

//@route GET /messages/private/:recieverId

const getPrivateMessages = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { recieverId } = req.params;

    const messages = await Message.find({
      $or: [
        {
          sender: senderId,
          reciever: recieverId,
        },
        {
          sender: recieverId,
          reciever: senderId,
        },
      ],
    })
      .populate("sender")
      .populate("reciever")
      .sort({ timestamp: 1 });
    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  sendPrivateMessage,
  sendPublicMessage,
  getPrivateMessages,
  getPublicMessages,
};
