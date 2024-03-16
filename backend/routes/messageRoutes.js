const Router = require("express");
const {
  getPublicMessages,
  getPrivateMessages,
  sendPrivateMessage,
  sendPublicMessage,
} = require("../controllers/messageController");
const { protect } = require("../middleware/authMiddleware");

const router = Router();

router.get("/", protect, getPublicMessages);
router.post("/", protect, sendPublicMessage);
router.post("/private", protect, sendPrivateMessage);
router.get("/private/:recieverId", protect, getPrivateMessages);

module.exports = router;
