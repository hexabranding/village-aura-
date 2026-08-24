import mongoose from 'mongoose';

const productVariantSchema = new mongoose.Schema({
  colorName: { type: String, required: true },
  hex: { type: String, default: '#000000' },
  images: [{ type: String }],
}, { _id: false });

const productSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
    default: '',
  },
  fabric: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  mrp: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    default: '',
  },
  details: [{
    type: String,
  }],
  care: [{
    type: String,
  }],
  variants: [productVariantSchema],
  featured: {
    type: Boolean,
    default: false,
  },
  isNew: {
    type: Boolean,
    default: false,
  },
  isBestSeller: {
    type: Boolean,
    default: false,
  },
  inStock: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true, suppressReservedKeysWarning: true });

productSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;
    delete ret.__v;
  },
});

export default mongoose.model('Product', productSchema);
