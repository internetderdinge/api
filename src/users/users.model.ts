// @ts-nocheck
import mongoose, { Schema, Document, Model, Types } from "mongoose";
import validator from "validator";
import { toJSON, paginate } from "../models/plugins/index.js";
import { roles } from "../config/roles.js";

export interface IUser {
  name?: string;
  avatar?: string;
  timezone: string;
  owner?: string;
  organization?: Types.ObjectId;
  organizationData?: any;
  inviteCode?: string;
  email?: string;
  role: (typeof roles)[number];
  category: string;
  status?: string;
  meta?: Record<string, any>;
}

export interface IUserDocument extends IUser, Document {
  isPasswordMatch(password: string): Promise<boolean>;
}

export interface IUserModel extends Model<IUserDocument> {
  isEmailTaken(email: string, excludeUserId?: Types.ObjectId): Promise<boolean>;
}

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    name: { type: String, trim: true },
    avatar: { type: String },
    timezone: { type: String, default: "Europe/Berlin" },
    owner: { type: String },
    organization: { type: Schema.Types.ObjectId, ref: "User", immutable: true },
    inviteCode: { type: String },
    email: { type: String },
    role: { type: String, default: "patient" /* , enum: Object.keys(roles) */ },
    category: { type: String, default: "patient" },
    status: { type: String },
    meta: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  },
);

userSchema.virtual("organizationData", {
  ref: "Organization",
  localField: "organization",
  foreignField: "_id",
  justOne: true,
});

// plugins
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (
  email: string,
  excludeUserId?: Types.ObjectId,
): Promise<boolean> {
  const user = await this.findOne({ email, _id: { $ne: excludeUserId } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (
  password: string,
): Promise<boolean> {
  // TODO: implement with bcrypt
  return false;
};

export const User =
  (mongoose.models.User as IUserModel) ||
  mongoose.model<IUserDocument, IUserModel>("User", userSchema);
