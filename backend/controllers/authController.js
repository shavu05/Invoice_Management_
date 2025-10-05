
const { Op } = require("sequelize");
const bcrypt   = require("bcryptjs");
const crypto   = require("crypto");
const validator= require("validator");
const User     = require("../models/authModel");
const sendEmail= require("../config/email");

// ─── SIGNUP ───────────────────────────────────────────────────────────────────
exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    //  Check required fields
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    //  Check duplicates
    const existing = await User.findOne({
      where: { [Op.or]: [{ username }, { email }] }
    });
    if (existing) {
      return res.status(400).json({ error: "Username or email already exists." });
    }

    //  Validate email & password strength
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: "Invalid email address." });
    }
    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({ error: "Password is not strong enough." });
    }

    //  Hash and save
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashed, role: "user" });

    res.status(201).json({ message: "Signup successful." });
  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Please enter both username and password." });
    }

    const user = await User.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid username or password." });
    }

    const redirect = user.role === "admin"
      ? "/html/dashboard.html"
      : "/html/logindashboard.html";

    res.status(200).json({
      message: "Login successful.",
      username: user.username,
      role: user.role,
      redirect
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// ─── FORGOT PASSWORD ───────────────────────────────────────────────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !validator.isEmail(email)) {
      return res.status(400).json({ error: "Enter a valid email." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Email not found." });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Store token and expiry (1 hour)
    user.resetToken = hashedToken;
    user.resetTokenExpires = Date.now() + 3600000;
    await user.save();
    console.log(user);

    // Send reset link
    const resetUrl = `http://localhost:3000/html/resetPassword.html?token=${token}&email=${encodeURIComponent(email)}`;
    const html = `
      <h2>Password Reset</h2>
      <p><strong>Username:</strong> ${user.username}</p>
      <p>Click <a href="${resetUrl}">here</a> to reset your password.</p>
      <p>This link expires in 1 hour.</p>
    `;
    await sendEmail(email, "Password Reset Request", html);

    res.json({ message: "Password reset link sent to email." });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};

// ─── RESET PASSWORD ──────────────────────────────────────────────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, newPassword, confirmPassword } = req.body;
    // 1) Validate inputs
    if (!email || !token || !newPassword || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required." });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    // 2) Find user by email + valid token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await User.findOne({
      where: {
        email,
        resetToken: hashedToken,
        resetTokenExpires: { [Op.gt]: Date.now() }
      }
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token." });
    }

    // 3) Update password & clear reset fields
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    res.json({ message: "Password has been reset successfully." });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ error: "Internal server error." });
  }
};
