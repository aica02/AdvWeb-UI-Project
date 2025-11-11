import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description:  {
    type: String,
    required: true,
  },
  category:  {
    type: String,
    required: true,
  },
  trending: {
    type: Boolean,
    required: true,
  },
  coverImage: {
    type: String,
    required: true,
  },
  oldPrice: {
    type: Number,
    required: true,
  },
  newPrice: {
    type: Number,
    required: true,
  },

  // ✅ New fields
  recommendedAge: {
    type: [String],   // Allow multiple selections
    enum: ['19+ Years', '12–18 Years', '8–11 Years', '3–7 Years'],
    required: true,
  },

  bookLanguage: {
    type: [String],   // Allow multiple languages
    enum: ['English', 'Tagalog'],
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
}, { 
  timestamps: true,
});

const Book = mongoose.model("Book", bookSchema);
export default Book;