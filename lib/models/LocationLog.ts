import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILocationLog {
  userId: mongoose.Types.ObjectId;
  attendanceId: mongoose.Types.ObjectId;
  latitude: number;
  longitude: number;
  timestamp: Date;
  distanceFromPrev: number; // in kilometers
}

export interface ILocationLogDocument extends ILocationLog, Document {
  _id: mongoose.Types.ObjectId;
}

const locationLogSchema = new Schema<ILocationLogDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    attendanceId: {
      type: Schema.Types.ObjectId,
      ref: 'Attendance',
      required: true,
      index: true,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    distanceFromPrev: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: false,
    collection: 'location_logs',
  }
);

// Compound index for querying logs for a specific attendance session sorted by timestamp
locationLogSchema.index({ attendanceId: 1, timestamp: 1 });

export const LocationLog: Model<ILocationLogDocument> =
  mongoose.models.LocationLog || mongoose.model<ILocationLogDocument>('LocationLog', locationLogSchema);
