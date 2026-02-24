const User = require("../Models/userModel");
const ResetToken = require("../Models/resetTokenModel");
const Notification = require("../Models/notificationModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../Utils/emailService");

// ================= REGISTER (ONLY USER) =================
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "user" //  Force user role
    });

    res.status(201).json({
      message: "User registered successfully",
      id: user._id,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ================= GET PROFILE (LOGGED IN USER) =================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    res.status(200).json(user);

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ================= LOGIN (USER + ADMIN) =================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      role: user.role
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ msg: "Email is required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        msg: "User not found"
      });
    }

    // Remove old tokens
    await ResetToken.deleteMany({ userId: user._id });

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await ResetToken.create({
      userId: user._id,
      token: hashedToken,
      expiresAt,
      used: false
    });

    // Create reset link
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    // Create In-App Notification
    await Notification.create({
      userId: user._id,
      title: "Password Reset Request",
      message: `A password reset link has been sent to your email: ${user.email}`,
      type: "info",
      data: {
        email: user.email,
        resetLink: resetUrl,
        info: "Click the link below to reset your password. This link will expire in 15 minutes."
      }
    });

    // Send email
    await sendPasswordResetEmail(user.email, user.name, resetUrl);

    res.json({
      msg: "If this email exists, a reset link has been sent."
    });

  } catch (error) {
    res.status(500).json({ msg: "Something went wrong." });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        msg: "Token and new password are required"
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        msg: "Password must be at least 6 characters"
      });
    }
    
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const resetToken = await ResetToken.findOne({
      token: hashedToken,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetToken) {
      return res.status(400).json({
        msg: "Invalid or expired reset link"
      });
    }

    const user = await User.findById(resetToken.userId);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    // Mark token used
    resetToken.used = true;
    await resetToken.save();

    res.json({
      msg: "Password reset successful. Please login."
    });

  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
};

// ================= VERIFY RESET TOKEN =================
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ msg: "Token is required" });
    }

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const resetToken = await ResetToken.findOne({
      token: resetTokenHash,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetToken) {
      return res.status(400).json({ msg: "Invalid or expired reset link" });
    }

    res.json({ msg: "Token is valid", valid: true });

  } catch (error) {
    res.status(500).json({ msg: "An error occurred." });
  }
};

// ================= UPDATE PROFILE (LOGGED IN USER) =================
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, password, profilePic } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ msg: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;
    if (profilePic) user.profilePic = profilePic;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ================= NOTIFICATIONS =================
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ msg: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};
