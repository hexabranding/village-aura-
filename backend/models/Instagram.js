import mongoose from 'mongoose';

const instagramSchema = new mongoose.Schema({
  image: { type: String, required: true, trim: true },
  label: { type: String, default: '', trim: true },
  link: { type: String, default: '' },
  order: { type: Number, default: 1 },
  active: { type: Boolean, default: true },
}, { timestamps: true });

instagramSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
  },
});

export default mongoose.model('Instagram', instagramSchema);
