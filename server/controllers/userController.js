const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const registerUser = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedUsername = username.toLowerCase().trim();
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      $or: [
        { email: normalizedEmail },
        { username: normalizedUsername },
      ],
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
  return res.status(401).json({
    success: false,
    message: "User does not exist with this email",
  });
}

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
  return res.status(401).json({
    success: false,
    message: "Invalid password",
  });
}

    const accessToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      data: {
        accessToken,
        user: {
          _id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const searchUsers = async (req, res) => {
  try {
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const users = await User.find({
      $or: [
        {
          username: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          fullName: {
            $regex: searchTerm,
            $options: "i",
          },
        },
        {
          email: {
            $regex: searchTerm,
            $options: "i",
          },
        },
      ],
    }).select("-password");

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Search users error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  searchUsers,
  logoutUser,
};