const User = require("../Models/userModel");
const ResetToken = require("../Models/resetTokenModel");
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
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

// ================= LOGIN (USER + ADMIN) =================
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // console.log("Login attempt:", { email });

    const user = await User.findOne({ email });
    if (!user) {
      // console.log(" User not found:", email);
      return res.status(400).json({ msg: "User not found" });
    }

    // console.log(" User found. Password stored in DB:", user.password.substring(0, 20) + "...");
    // console.log(" Password entered:", password);
    // console.log(" Password length:", password.length);

    const isMatch = await bcrypt.compare(password, user.password);
    
    // console.log(" Password match result:", isMatch);

    if (!isMatch) {
      // console.log(" Password mismatch");
      return res.status(400).json({ msg: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // console.log(" Login successful");

    res.json({
      token,
      role: user.role
    });

  } catch (error) {
    // console.error(" Login error:", error.message);
    res.status(500).json({ msg: error.message });
  }
};

// ================= FORGOT PASSWORD =================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // console.log(" Forgot password request for:", email);

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      // console.log(" User not found:", email);
      return res.status(404).json({ msg: "User not found" });
    }

    // console.log(" User found:", user.email);

    // Delete any existing tokens for this user
    await ResetToken.deleteMany({ userId: user._id });

    // Generate plain token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    // Save hashed token to database
    const savedToken = await ResetToken.create({
      userId: user._id,
      token: resetTokenHash,
      expiresAt,
      used: false
    });

    // console.log(" Token saved to DB");

    // Build reset URL
    const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;

    // console.log("🔗 Reset URL:", resetUrl);

    try {
      // Send email using centralized service
      await sendPasswordResetEmail(email, user.name, resetUrl);
      // console.log("Email sent to:", email);
    } catch (emailError) {
      console.warn(" Email sending failed, but token created:", emailError.message);
    }

    res.json({ 
      msg: "Password reset token generated. Check your email for reset link.",
      token: resetToken,
      email: email
    });

  } catch (error) {
    // console.error("Forgot password error:", error.message);
    // console.error("Full error:", error);
    res.status(500).json({ msg: "Failed to send reset email. Please try again later." });
  }
};

// ================= RESET PASSWORD =================
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ msg: "Token and password are required" });
    }

    // console.log(" Reset password attempt");
    // console.log(" Token received length:", token.length);

    // Hash the token to match what's in the database
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // console.log(" Looking for token in database...");

    // Find valid token in database
    const resetToken = await ResetToken.findOne({
      token: resetTokenHash,
      used: false,
      expiresAt: { $gt: new Date() }
    });

    if (!resetToken) {
      // console.log(" Token not found or expired");
      return res.status(400).json({ msg: "Invalid or expired reset link" });
    }

    // console.log("Token found in database");

    // Find user
    const user = await User.findById(resetToken.userId);
    if (!user) {
      // console.log(" User not found");
      return res.status(404).json({ msg: "User not found" });
    }

    // console.log("👤 User found:", user.email);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // console.log(" Password updated successfully");

    // Mark token as used (so it can't be used again)
    resetToken.used = true;
    await resetToken.save();

    // console.log(" Token marked as used");

    res.json({ msg: "Password reset successfully! You can now login." });

  } catch (error) {
    // console.error(" Reset password error:", error);
    res.status(500).json({ msg: "An error occurred. Please try again." });
  }
};

// ================= VERIFY RESET TOKEN =================
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ msg: "Token is required" });
    }

    // Hash the token to match what's in the database
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find valid token in database
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
    // console.error("Verify token error:", error);
    res.status(500).json({ msg: "An error occurred." });
  }
};