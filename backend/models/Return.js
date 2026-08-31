import mongoose from 'mongoose';

const returnSchema = new mongoose.Schema({
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
  reason: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending',
  },
}, { timestamps: true });

returnSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
  },
});

export default mongoose.model('Return', returnSchema);
