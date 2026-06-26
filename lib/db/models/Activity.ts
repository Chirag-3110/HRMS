/**
 * Activity Model
 * 
 * Mongoose schema and model for Activity documents in MongoDB.
 * Tracks user actions and events for audit logging.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

/**
 * Activity Document Interface
 */
export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  timestamp: Date;
  actionType: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Activity Schema Definition
 */
const ActivitySchema = new Schema<IActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    actionType: {
      type: String,
      required: true,
      index: true,
      enum: [
        'login',
        'logout',
        'profile_update',
        'role_change',
        'password_reset',
        'email_verified',
        'status_change',
        'created',
        'updated',
        'deleted',
      ],
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    collection: 'activities',
  }
);

// Indexes for querying activities
ActivitySchema.index({ userId: 1, timestamp: -1 });
ActivitySchema.index({ actionType: 1, timestamp: -1 });

/**
 * Get or create Activity model
 */
const Activity: Model<IActivity> =
  mongoose.models.Activity || mongoose.model<IActivity>('Activity', ActivitySchema);

export default Activity;
