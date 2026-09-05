import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['cancellation', 'return', 'order', 'general'],
    default: 'general',
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  orderId: { type: String, default: '' },
  productId: { type: String, default: '' },
  phone: { type: String, default: '' },
  read: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
  },
});

export default mongoose.model('Notification', notificationSchema);
