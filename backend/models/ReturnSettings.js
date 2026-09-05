import mongoose from 'mongoose';

const returnSettingsSchema = new mongoose.Schema({
  returnWindow: { type: Number, default: 7 },
  enabled: { type: Boolean, default: true },
  replacementEnabled: { type: Boolean, default: true },
  exchangeEnabled: { type: Boolean, default: false },
  refundEnabled: { type: Boolean, default: true },
  videoRequired: { type: Boolean, default: false },
  imagesRequired: { type: Boolean, default: false },
  maxVideoSizeMB: { type: Number, default: 50 },
  maxImageSizeMB: { type: Number, default: 5 },
  maxImages: { type: Number, default: 5 },
  maxVideos: { type: Number, default: 1 },
  nonReturnableCategories: [{ type: String }],
  returnConditions: { type: String, default: 'Product must be unused unless defective/damaged. Original packaging retained where applicable.' },
  pickupAvailable: { type: Boolean, default: true },
  refundMethod: { type: String, default: 'Original payment method' },
  restockingFee: { type: Number, default: 0 },
  instructions: { type: String, default: 'To verify issues, upload clear unboxing video showing package, label, product and issue.' },
  reasons: [{ type: String }],
}, { timestamps: true });

export default mongoose.model('ReturnSettings', returnSettingsSchema);
