const express = require("express");

const {
  registerUser,
  loginUser,
  getMe,
  searchUsers,
  logoutUser,
} = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getMe);
router.get("/search", authMiddleware, searchUsers);
router.get("/logout", logoutUser);

module.exports = router;