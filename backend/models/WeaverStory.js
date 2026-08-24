import mongoose from 'mongoose';
const weaverStorySchema = new mongoose.Schema({
  eyebrow: { type: String, default: 'By Hand, By Name' },
  title: { type: String, default: 'Every saree is signed by the loom that made it.' },
  description: { type: String, default: 'We work directly with 40 weaving families across Kanchipuram, Banaras, Chanderi and rural Bengal. No middle warehouses, no mass reproduction — a saree isn\'t cut from a bolt here, it\'s finished only when you order it.' },
  buttonText: { type: String, default: 'Meet the Weaves →' },
  buttonLink: { type: String, default: '/shop' },
  image1: { type: String, default: '' },
  image2: { type: String, default: '' },
}, { timestamps: true });
export default mongoose.model('WeaverStory', weaverStorySchema);
