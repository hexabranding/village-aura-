import mongoose from 'mongoose';
const curatedEditSchema = new mongoose.Schema({
  category: { type: String, required: true },
  eyebrow: { type: String, default: 'Curated Edit' },
  title: { type: String, required: true },
  copy: { type: String, default: '' },
  image: { type: String, default: '' },
  order: { type: Number, default: 1 },
  active: { type: Boolean, default: true },
}, { timestamps: true });
curatedEditSchema.set('toJSON', { virtuals: true, transform(doc, ret) { ret.id = ret._id; delete ret.__v; } });
export default mongoose.model('CuratedEdit', curatedEditSchema);
