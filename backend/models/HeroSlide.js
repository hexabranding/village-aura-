import mongoose from 'mongoose';
const heroSlideSchema = new mongoose.Schema({
  eyebrow: { type: String, default: '' },
  headline: [{ type: String }],
  ctaLabel: { type: String, default: 'Shop the Weave' },
  ctaLink: { type: String, default: '/shop' },
  ctaSecondaryLabel: { type: String, default: '' },
  ctaSecondaryLink: { type: String, default: '' },
  image: { type: String, default: '' },
  order: { type: Number, default: 1 },
  active: { type: Boolean, default: true },
}, { timestamps: true });
heroSlideSchema.set('toJSON', { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; } });
export default mongoose.model('HeroSlide', heroSlideSchema);
