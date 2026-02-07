import mongoose, { Schema, Document, Model } from "mongoose";
import { toJSON, paginate } from "../models/plugins/index.js";

// Define the interface for the Organization document
export interface IOrganization extends Document {
  name: string;
  meta?: Record<string, any>;
  kind?: string;
  createdAt?: Date;
  updatedAt?: Date;
  usersData?: mongoose.Types.ObjectId[];
  devicesData?: mongoose.Types.ObjectId[];
}

// Define the schema
const organizationSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      // required: true,
    },
    meta: { type: Object },
    kind: { type: String },
  },
  {
    timestamps: true,
    toObject: {
      virtuals: true,
    },
    toJSON: {
      virtuals: true,
    },
  },
);

// Virtuals
organizationSchema.virtual("usersData", {
  ref: "User",
  localField: "_id",
  foreignField: "organization",
  justOne: false,
});

organizationSchema.virtual("devicesData", {
  ref: "Device",
  localField: "_id",
  foreignField: "organization",
  justOne: false,
});

// Add plugins
organizationSchema.plugin(toJSON);
organizationSchema.plugin(paginate);

// Define the model
const Organization: Model<IOrganization> = mongoose.model<IOrganization>(
  "Organization",
  organizationSchema,
);

export default Organization;
