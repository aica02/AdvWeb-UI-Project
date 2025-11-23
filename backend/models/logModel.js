import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  actor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  actorName: String,
  action: { type: String, required: true },
  meta: { type: Object },
  createdAt: { type: Date, default: Date.now },
});

const Log = mongoose.model("Log", logSchema);
export default Log;
