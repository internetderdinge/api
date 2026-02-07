import mongoose, { Schema, Document, Model } from 'mongoose';
import { toJSON, paginate } from '../models/plugins/index';

interface IotDeviceMeta {
  [key: string]: any;
}

export interface IotDevice extends Document {
  description?: string;
  meta?: IotDeviceMeta;
  deviceId?: string;
}

const iotDeviceSchema: Schema<IotDevice> = new mongoose.Schema(
  {
    description: {
      type: String,
    },
    meta: { type: Object },
    deviceId: { type: String },
  },
  {
    timestamps: true,
  },
);

iotDeviceSchema.plugin(toJSON);
iotDeviceSchema.plugin(paginate);

export const IotDevices: Model<IotDevice> = mongoose.model<IotDevice>('IotDevice', iotDeviceSchema);

export default IotDevices;
