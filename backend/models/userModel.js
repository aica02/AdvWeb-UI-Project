import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
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
    street: { type: String },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    // Forgot-password state (hashed, never returned unless explicitly selected)
    resetOtpHash: { type: String, select: false },
    resetOtpExpire: { type: Date, select: false },
    resetOtpAttempts: { type: Number, default: 0, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
    cart: [
      {
        bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
        quantity: { type: Number, required: true },
        price: { type: Number },
        title: { type: String },
        author: { type: String },
        image: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare passwords
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
