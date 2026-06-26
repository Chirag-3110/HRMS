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

// Create text index for search functionality
userSchema.index({ fullName: 'text', email: 'text' });

// Prevent model overwrite during hot-reload in development
export const User: Model<IUserDocument> =
  mongoose.models.User || mongoose.model<IUserDocument>('User', userSchema);
