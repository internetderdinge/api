// @ts-nocheck
import mongoose, { Schema, Model } from "mongoose";
import crypto from "crypto";
import { toJSON, paginate } from "../models/plugins/index.js";

const tokenSchema: Schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    value: { type: String, required: true, select: false }, // Store hash only
    owner: { type: String, required: true, index: true, trim: true },
    expiresAt: { type: Date, required: false, index: true },
    usedAt: { type: Date, required: false, index: true },
    meta: { type: Schema.Types.Mixed, required: false },
  },
  {
    timestamps: true,
  },
);

tokenSchema.plugin(toJSON, true);
tokenSchema.plugin(paginate);

const Token: Model<any> =
  (mongoose.models.Token as Model<any>) || mongoose.model("Token", tokenSchema);

export default Token;
