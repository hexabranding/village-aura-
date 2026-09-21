import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
  filename: { type: String, required: true, unique: true, index: true },
  contentType: { type: String, required: true },
  data: { type: Buffer, required: true },
  size: { type: Number, required: true },
  url: { type: String, required: true, index: true },
}, { timestamps: true });

imageSchema.set('toJSON', {
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret.data;
    delete ret.__v;
  },
});

export default mongoose.model('Image', imageSchema);
