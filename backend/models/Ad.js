import mongoose from 'mongoose';

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  link: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    enum: ['fixed', 'carousel'],
    default: 'carousel',
  },
  position: {
    type: String,
    enum: ['homepage', 'sidebar', 'banner'],
    default: 'homepage',
  },
  active: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
    default: 1,
  },
}, { timestamps: true });

adSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
  },
});

export default mongoose.model('Ad', adSchema);
