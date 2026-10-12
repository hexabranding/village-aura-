import mongoose from 'mongoose';

// GridFS bucket used for every uploaded file (images + videos).
// Unlike the legacy `Image` collection (single BSON doc, 16MB hard limit),
// GridFS chunks large files so 50MB+ videos store safely in MongoDB.
const BUCKET_NAME = 'uploads';

const getBucket = () => {
  if (!mongoose.connection?.db) {
    throw new Error('MongoDB not connected - cannot access GridFS');
  }
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: BUCKET_NAME,
  });
};

export async function saveToGridFS(filename, buffer, contentType) {
  const bucket = getBucket();
  await new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(filename, { contentType });
    stream.on('error', reject);
    stream.on('finish', resolve);
    stream.end(buffer);
  });
  return filename;
}

export async function findGridFSFile(filename) {
  const bucket = getBucket();
  return bucket.find({ filename }).sort({ uploadDate: -1 }).limit(1).next();
}

export function openGridFSStream(filename, range) {
  const bucket = getBucket();
  return range
    ? bucket.openDownloadStreamByName(filename, range)
    : bucket.openDownloadStreamByName(filename);
}
