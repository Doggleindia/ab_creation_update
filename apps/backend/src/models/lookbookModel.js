import mongoose from 'mongoose';

const lookbookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ['image', 'video'],
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    position: {
      type: Number,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Lookbook', lookbookSchema);
