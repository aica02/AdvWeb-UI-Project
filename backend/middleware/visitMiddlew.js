import Visit from "../models/visitModel.js";

// POST /api/visit - the frontend calls this once per browser session
export const trackVisit = async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  try {
    await Visit.findOneAndUpdate({ date: today }, { $inc: { count: 1 } }, { upsert: true });
  } catch (err) {
    console.error("Visit tracking failed:", err);
  }
  res.sendStatus(204);
};
