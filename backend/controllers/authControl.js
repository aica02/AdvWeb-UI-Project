import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Joi from "joi";
import User from "../models/userModel.js";
import crypto from "crypto";

// Fields a user is allowed to change through PUT /api/auth/profile
const PROFILE_FIELDS = [
  "firstName", "lastName", "birthDate", "phone", "gender", "email",
  "province", "postalCode", "city", "barangay", "street",
];

const OTP_TTL_MS = 2 * 60 * 1000;          // OTP valid for 2 minutes
const RESET_TOKEN_TTL_MS = 10 * 60 * 1000; // reset token valid for 10 minutes after OTP check
const MAX_OTP_ATTEMPTS = 5;

const sha256 = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

const safeEqual = (a, b) => {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
};

const normalizeEmail = (email) => (typeof email === "string" ? email.toLowerCase().trim() : "");

// Sends the OTP from the server through EmailJS's REST API, reusing the
// existing EmailJS template (expects {{email}} and {{otp_code}}).
const sendOtpEmail = async (email, otp) => {
  const body = {
    service_id: process.env.EMAILJS_SERVICE_ID || "service_fnv6yy9",
    template_id: process.env.EMAILJS_TEMPLATE_ID || "template_nhz1nbo",
    user_id: process.env.EMAILJS_PUBLIC_KEY || "6_oRF3euZ6rfiEpWB",
    template_params: { email, otp_code: otp },
  };
  if (process.env.EMAILJS_PRIVATE_KEY) body.accessToken = process.env.EMAILJS_PRIVATE_KEY;

  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`EmailJS ${res.status}: ${await res.text()}`);
};

export const register = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      role: Joi.string().valid("user", "admin").optional(), // allow specifying role
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const user = await User.create({ email, password, role: role || "user" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// LOGIN USER
export const login = async (req, res) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
    { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
    { expiresIn: "1d" }
    );
  res.status(200).json({ token, role: user.role });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET CURRENT USER
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    // Only copy fields a user may edit themselves. Anything else in the body
    // (role, password, cart, wishlist, reset tokens, _id...) is ignored.
    const updates = {};
    for (const field of PROFILE_FIELDS) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    if (typeof updates.email === "string") updates.email = updates.email.toLowerCase().trim();
    if (updates.birthDate === "") updates.birthDate = null;

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true }).select("-password");
    res.json({ user });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Email already in use" });
    if (err.name === "ValidationError" || err.name === "CastError")
      return res.status(400).json({ message: err.message });
    res.status(500).json({ message: "Server error" });
  }
};

// CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect current password" });

    user.password = newPassword;
    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
     console.error("Change password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// CHECK EMAIL (for forgot password flow) - secure endpoint
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json({ message: "Email not found in our system" });

    // Return only that email exists (no user data leaked)
    res.json({ exists: true, message: "Email verified. You may proceed." });
  } catch (err) {
    console.error("Check email error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// SEND OTP - the server generates the code and emails it; the code never reaches the browser
export const sendResetOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });
    // Same answer whether or not the account exists
    if (!user) return res.json({ message: "If that email is registered, an OTP has been sent." });

    const otp = crypto.randomInt(100000, 1000000).toString();
    user.resetOtpHash = sha256(otp);
    user.resetOtpExpire = new Date(Date.now() + OTP_TTL_MS);
    user.resetOtpAttempts = 0;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    try {
      await sendOtpEmail(email, otp);
    } catch (mailErr) {
      console.error("Send OTP email error:", mailErr.message);
      user.resetOtpHash = undefined;
      user.resetOtpExpire = undefined;
      await user.save();
      return res.status(502).json({ message: "Failed to send OTP. Try again later." });
    }

    res.json({ message: "If that email is registered, an OTP has been sent.", expiresInMs: OTP_TTL_MS });
  } catch (err) {
    console.error("Send OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// VERIFY OTP - on success returns a one-time reset token used by /reset-password
export const verifyResetOtp = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const otp = typeof req.body.otp === "string" ? req.body.otp.trim() : "";
    if (!email || !otp) return res.status(400).json({ message: "Email and OTP are required" });

    const user = await User.findOne({ email }).select("+resetOtpHash +resetOtpExpire +resetOtpAttempts");
    if (!user || !user.resetOtpHash || !user.resetOtpExpire)
      return res.status(400).json({ message: "Please request an OTP first." });

    if (user.resetOtpExpire.getTime() < Date.now())
      return res.status(400).json({ message: "OTP expired. Please resend." });

    if ((user.resetOtpAttempts || 0) >= MAX_OTP_ATTEMPTS)
      return res.status(429).json({ message: "Too many attempts. Please request a new OTP." });

    if (!safeEqual(sha256(otp), user.resetOtpHash)) {
      user.resetOtpAttempts = (user.resetOtpAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ message: "Incorrect OTP. Please try again." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = sha256(resetToken);
    user.resetPasswordExpire = new Date(Date.now() + RESET_TOKEN_TTL_MS);
    user.resetOtpHash = undefined;
    user.resetOtpExpire = undefined;
    user.resetOtpAttempts = 0;
    await user.save();

    res.json({ message: "OTP verified — you may reset your password now.", resetToken });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// RESET PASSWORD - requires the reset token issued by verifyResetOtp
export const resetPassword = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const { resetToken, newPassword } = req.body;
    if (!email || !resetToken || !newPassword)
      return res.status(400).json({ message: "Email, reset token and new password are required" });
    if (typeof newPassword !== "string" || newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });

    const user = await User.findOne({ email }).select("+resetPasswordToken +resetPasswordExpire");
    if (
      !user ||
      !user.resetPasswordToken ||
      !user.resetPasswordExpire ||
      user.resetPasswordExpire.getTime() < Date.now() ||
      !safeEqual(sha256(resetToken), user.resetPasswordToken)
    ) {
      return res.status(400).json({ message: "Reset link is invalid or has expired. Please start again." });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
