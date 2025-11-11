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
  },
  recommendedAge: {
    type: [String],  
    enum: ['19+ Years', '12–18 Years', '8–11 Years', '3–7 Years'],
    required: true,
  },
  bookLanguage: {
    type: [String], 
    enum: ['English', 'Tagalog'],
    required: true,
  },
}, { 
  timestamps: true,
  toJSON: { virtuals: true },   // include virtuals when converting to JSON
  toObject: { virtuals: true },
});

// Virtual field to map _id to id
bookSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const Book = mongoose.model("Book", bookSchema);
export default Book;
