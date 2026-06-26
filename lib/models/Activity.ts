/**
 * Activity Model
 * 
 * Mongoose schema and model for Activity log documents in MongoDB
 */

import mongoose, { Schema, Model } from 'mongoose';

export interface IActivity {
  userId: mongoose.Types.ObjectId;
  timestamp: Date;
  actionType: string;
  description: string;
}

export interface IActivityDocument extends IActivity, mongoose.Document {
  _id: mongoose.Types.ObjectId;
}

const activitySchema = new Schema<IActivityDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    actionType: {
      type: String,
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: false,
    collection: 'activities',
  }
);

// Compound index for efficient user activity queries
activitySchema.index({ userId: 1, timestamp: -1 });

// Prevent model overwrite during hot-reload in development
export const Activity: Model<IActivityDocument> =
  mongoose.models.Activity || mongoose.model<IActivityDocument>('Activity', activitySchema);
