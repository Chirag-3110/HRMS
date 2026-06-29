import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendance {
  userId: mongoose.Types.ObjectId;
  checkInTime: Date;
  checkOutTime?: Date;
  checkInLocation: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  checkOutLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  date: string; // Format: YYYY-MM-DD
  totalDistanceKm: number;
  status: 'checked_in' | 'checked_out';
  tenantId?: string;
}

export interface IAttendanceDocument extends IAttendance, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendanceDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    tenantId: {
      type: String,
      index: true,
    },
    checkInTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    checkOutTime: {
      type: Date,
    },
    checkInLocation: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
      address: { type: String },
    },
    checkOutLocation: {
      latitude: { type: Number },
      longitude: { type: Number },
      address: { type: String },
    },
    date: {
      type: String,
      required: true,
      index: true, // For querying a worker's shift on a specific day
    },
    totalDistanceKm: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      required: true,
      enum: ['checked_in', 'checked_out'],
      default: 'checked_in',
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'attendance',
  }
);

// Index for getting shifts for a user on a given date
attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Attendance: Model<IAttendanceDocument> =
  mongoose.models.Attendance || mongoose.model<IAttendanceDocument>('Attendance', attendanceSchema);
