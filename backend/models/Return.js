import mongoose from 'mongoose';

const returnSchema = new mongoose.Schema({
  returnId: { type: String, unique: true, sparse: true },
  orderId: { type: String, required: true },
  phone: { type: String, required: true },
  productId: { type: String, required: true },
  qty: { type: Number, default: 1, min: 1 },
  reason: { type: String, required: true },
  otherReason: { type: String, default: '' },
  description: { type: String, default: '' },
  images: [{ type: String }],
  video: { type: String, default: '' },
  resolution: { type: String, enum: ['Refund','Replacement','Exchange'], default: 'Refund' },
  exchangeVariant: { type: String, default: '' },
  status: {
    type: String,
    enum: ['Return Requested','Under Review','More Information Required','Approved','Pickup Scheduled','Picked Up','Product Received','Quality Check','Refund Processing','Replacement Processing','Completed','Rejected','Cancelled'],
    default: 'Return Requested',
  },
  tracking: [{
    status: { type: String, required: true },
    message: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  }],
  adminMessage: { type: String, default: '' },
  pickup: {
    required: { type: Boolean, default: true },
    address: { type: String, default: '' },
    date: { type: String, default: '' },
    status: { type: String, default: 'Pending' },
    courier: { type: String, default: '' },
    trackingNo: { type: String, default: '' },
  },
  refund: {
    amount: { type: Number, default: 0 },
    method: { type: String, default: '' },
    status: { type: String, enum: ['Pending','Initiated','Processing','Completed','Failed'], default: 'Pending' },
    transactionId: { type: String, default: '' },
  },
  deliveryDate: { type: Date, default: null },
  returnDeadline: { type: Date, default: null },
}, { timestamps: true });

returnSchema.pre('save', function(next){
  if(!this.returnId){
    this.returnId = 'RTN-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2,6).toUpperCase();
  }
  next();
});

returnSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
  },
});

export default mongoose.model('Return', returnSchema);
