/**
 * User Model
 * 
 * Mongoose schema and model for User documents in MongoDB
 */

import mongoose, { Schema, Model } from 'mongoose';
import type { UserRole, UserStatus } from '../schemas/user';

export interface IUser {
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
  registrationDate: Date;
  lastLoginDate?: Date;
  password?: string;
  tenantId?: string;
}

export interface IUserDocument extends IUser, mongoose.Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    tenantId: {
      type: String,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: ['Admin', 'Member', 'Guest', 'FieldWorker'],
      default: 'Member',
    },
    password: {
      type: String,
    },
    status: {
      type: String,
      required: true,
      enum: ['active', 'deactivated'],
      default: 'active',
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    lastLoginDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Text index for search functionality
userSchema.index({ fullName: 'text', email: 'text' });

// Compound indexes for common query patterns
// tenantId + status — used in countDocuments and analytics aggregations
userSchema.index({ tenantId: 1, status: 1 });
// tenantId + role — used in role-breakdown aggregation
userSchema.index({ tenantId: 1, role: 1 });
// tenantId + registrationDate — used in registration trends and newUsersLast30Days
userSchema.index({ tenantId: 1, registrationDate: -1 });
// tenantId + createdAt — used for sorting in paginated user list
userSchema.index({ tenantId: 1, createdAt: -1 });

// Prevent model overwrite during hot-reload in development
export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', userSchema);
