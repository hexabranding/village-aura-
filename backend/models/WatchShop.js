import mongoose from 'mongoose';

const watchShopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: String,
    default: '',
  },
  poster: {
    type: String,
    default: '',
  },
  video: {
    type: String,
    required: true,
  },
  productId: {
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

watchShopSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
  },
});

export default mongoose.model('WatchShop', watchShopSchema);
