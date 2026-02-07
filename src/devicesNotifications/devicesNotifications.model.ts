import mongoose, { Schema, Document, Model } from 'mongoose';
import type { PaginateModel } from 'mongoose';
import { toJSON, paginate } from '../../src/models/plugins/index';

interface Token {
  token: string;
  deviceId: string;
  plattform: string;
  date: Date;
}

interface Settings {
  intake: { email: boolean; push: boolean };
  'intake-reminder': { email: boolean; push: boolean };
  battery: { email: boolean; push: boolean };
}

export interface DeviceNotificationDocument extends Document {
  user: string;
  tokens: Token[];
  bounceEmail: string;
  settings: Settings;
  createdAt: Date;
  updatedAt: Date;
}

export type DeviceNotificationModel = Model<DeviceNotificationDocument> & PaginateModel<DeviceNotificationDocument>;

const deviceNotificationSchema = new Schema<DeviceNotificationDocument>(
  {
    user: { type: String, required: true },
    tokens: [
      {
        token: { type: String, required: true },
        deviceId: { type: String, required: true },
        plattform: { type: String, required: true },
        date: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    bounceEmail: { type: String },
    settings: {
      intake: { email: { type: Boolean, default: true }, push: { type: Boolean, default: true } },
      'intake-reminder': {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
      },
      battery: { email: { type: Boolean, default: true }, push: { type: Boolean, default: true } },
    },
  },
  {
    timestamps: true,
  },
);

// Add plugins
deviceNotificationSchema.plugin(toJSON);
deviceNotificationSchema.plugin(paginate);

const DeviceNotifications = mongoose.model<DeviceNotificationDocument, DeviceNotificationModel>(
  'DeviceNotification',
  deviceNotificationSchema,
);

export default DeviceNotifications;
