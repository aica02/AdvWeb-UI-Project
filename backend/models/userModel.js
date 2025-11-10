import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  firstName: { type: String },
  lastName: { type: String },
  birthDate: { type: Date },
  phone: { type: String },
  gender: { type: String, enum: ["Male", "Female"] },
  province: { type: String },
  postalCode: { type: String },
  city: { type: String },
  barangay: { type: String },
  street: { type: String }
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

export default mongoose.model("User", userSchema);
