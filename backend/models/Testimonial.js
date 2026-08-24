import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  role: { type: String, default: '' },
  category: { type: String, default: '' },
  rating: { type: Number, default: 5, min: 1, max: 5 },
  quote: { type: String, required: true },
  image: { type: String, default: '' },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 1 },
}, { timestamps: true });

testimonialSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) { ret.id = ret._id; delete ret.__v; },
});

export default mongoose.model('Testimonial', testimonialSchema);
