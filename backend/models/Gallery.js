import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  subtitle: {
    type: String,
    default: 'VIEW MORE',
  },
  link: {
    type: String,
    default: '',
  },
  order: {
    type: Number,
    default: 1,
  },
  active: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

gallerySchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
  },
});

export default mongoose.model('Gallery', gallerySchema);
