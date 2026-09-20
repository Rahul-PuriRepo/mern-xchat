const Room = require("../models/Room");
const User = require("../models/User");

const initRoom = async (req, res) => {
  try {
    const { otheruser } = req.body;

    if (!otheruser) {
      return res.status(400).json({
        success: false,
        message: "Other user is required",
      });
    }

    const otherUserExists = await User.findById(otheruser);

    if (!otherUserExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check whether a room already exists between these two users
    let room = await Room.findOne({
      users: {
        $all: [req.userId, otheruser],
      },
    }).populate("users", "-password");

    if (!room) {
      room = await Room.create({
        users: [req.userId, otheruser],
      });

      room = await room.populate("users", "-password");
    }

    return res.status(200).json({
      success: true,
      data: room,
    });
  } catch (error) {
    console.error("Initialize room error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getUserRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      users: req.userId,
    }).populate("users", "-password");

    return res.status(200).json({
      success: true,
      data: rooms,
    });
  } catch (error) {
    console.error("Get user rooms error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



module.exports = {
  initRoom,
  getUserRooms,
};