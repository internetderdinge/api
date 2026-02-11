// @ts-nocheck
import mongoose, { Schema, Document, Model, Types } from "mongoose";
import { toJSON, paginate } from "../models/plugins/index.js";
import { ensureSameOrganization } from "../middlewares/mongooseValidations/ensureSameOrganization.js";

interface IDevice extends Document {
  name?: string;
  meta?: Record<string, any>;
  organization?: mongoose.Types.ObjectId;
  patient?: mongoose.Types.ObjectId;
  paper?: mongoose.Types.ObjectId;
  timezone?: string;
  deviceId?: string;
  kind?: string;
  eventDate?: Date;
  payment?: Record<string, any>;
  loadedAt?: Date;
  patientData?: any; // Replace `any` with the actual type if available
}

const deviceSchema = new Schema(
  {
    name: {
      type: String,
    },
    meta: { type: Object },
    organization: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      immutable: true,
    },
    patient: { type: Schema.Types.ObjectId, ref: "User" },
    paper: { type: mongoose.Schema.Types.ObjectId, ref: "Paper" },
    timezone: { type: String },
    deviceId: { type: String, immutable: true },
    kind: { type: String, immutable: true },
    eventDate: { type: Date },
    payment: { type: Object },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

deviceSchema.virtual("patientData", {
  ref: "User",
  localField: "patient",
  foreignField: "_id",
  justOne: true,
});

function addIotDevice(schema: Schema<IDevice>): void {
  schema
    .virtual("loadedAt")
    .get(function (this: IDevice) {
      return this._loadedAt;
    })
    .set(function (this: IDevice, v: Date) {
      this._loadedAt = v;
    });

  schema.post(["find", "findOne"], function (docs: IDevice | IDevice[] | null) {
    // nothing was found, bail out
    if (!docs) {
      return;
    }

    // normalize to array
    const docsArray = Array.isArray(docs) ? docs : [docs];
    const now = new Date();

    for (const doc of docsArray) {
      if (doc) {
        doc.loadedAt = now;
      }
    }
  });
}

/**
 * Ensure patient is member of the same organization
 */
deviceSchema.pre<IDevice>("save", async function (next) {
  if (!this.patient) return next();
  try {
    await ensureSameOrganization(
      this.patient,
      this.organization!,
      mongoose.model("User"),
    );
    next();
  } catch (err) {
    next(err as Error);
  }
});

deviceSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate() as any;
  if (!update?.patient) return next();
  try {
    // need org from the existing doc
    const device = await this.model
      .findOne(this.getQuery())
      .select("organization");
    await ensureSameOrganization(
      update.patient,
      device!.organization,
      mongoose.model("User"),
    );
    next();
  } catch (err) {
    next(err as Error);
  }
});

// Add the IoT device functionality
addIotDevice(deviceSchema);

// Add plugins that convert mongoose to JSON and enable pagination
deviceSchema.plugin((schema: Schema) => toJSON(schema, true));
deviceSchema.plugin(paginate);

const Devices: Model<IDevice> =
  (mongoose.models.Device as Model<IDevice>) ||
  mongoose.model<IDevice>("Device", deviceSchema);

export default Devices;
