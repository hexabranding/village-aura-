import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  productId: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
  },
}, { timestamps: true });

reviewSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
  },
});

export default mongoose.model('Review', reviewSchema);
