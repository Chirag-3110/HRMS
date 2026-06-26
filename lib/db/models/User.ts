/**
 * User Model
 * 
 * Mongoose schema and model for User documents in MongoDB.
 * Represents Phelbo platform users managed by superadministrators.
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import type { UserRole, UserStatus } from '../../schemas/user';

/**
 * User Document Interface
 * Extends Document to include MongoDB document methods
 */
export interface IUser extends Document {
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
  registrationDate: Date;
  lastLoginDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Schema Definition
 */
const UserSchema = new Schema<IUser>(
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
      index: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ['Admin', 'Member', 'Guest'],
      required: true,
      default: 'Member',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'deactivated'],
      required: true,
      default: 'active',
      index: true,
    },
    registrationDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    lastLoginDate: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
    collection: 'users',
  }
);

// Indexes for search and filtering
UserSchema.index({ email: 'text', fullName: 'text' });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ registrationDate: -1 });

/**
 * Get or create User model
 * Prevents "OverwriteModelError" in development with hot-reload
 */
const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
