import Visit from "../models/visitModel.js";

export const trackVisit = async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  try {
    const visit = await Visit.findOne({ date: today });
    if (visit) {
      visit.count += 1;
      await visit.save();
    } else {
      await Visit.create({ date: today, count: 1 });
    }
  } catch (err) {
    console.error("Visit tracking failed:", err);
  }
  next();
};
