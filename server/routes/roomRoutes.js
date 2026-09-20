const express = require("express");

const {
  initRoom,
  getUserRooms,
} = require("../controllers/roomController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/init", authMiddleware, initRoom);
router.get("/userrooms", authMiddleware, getUserRooms);

module.exports = router;