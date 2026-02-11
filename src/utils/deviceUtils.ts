import { readFileSync } from "fs";
import path from "path";

export type DeviceListEntry = {
  id: string;
  features: string[];
  deviceNameDetection?: string;
  [key: string]: any;
};

export interface InitDeviceListOptions {
  list?: DeviceListEntry[];
  listPath?: string;
}

let deviceList: DeviceListEntry[] | null = null;

const parseDeviceList = (value: unknown): DeviceListEntry[] => {
  if (!Array.isArray(value)) {
    throw new Error("Device list must be an array.");
  }
  return value as DeviceListEntry[];
};

const loadDeviceListFromFile = (listPath: string): DeviceListEntry[] => {
  const absolutePath = path.resolve(listPath);
  const raw = readFileSync(absolutePath, "utf8");
  const parsed = JSON.parse(raw) as unknown;
  return parseDeviceList(parsed);
};

export const initDeviceList = (
  options: InitDeviceListOptions = {},
): DeviceListEntry[] => {
  if (options.list) {
    deviceList = options.list;
    return deviceList;
  }
  if (options.listPath) {
    deviceList = loadDeviceListFromFile(options.listPath);
    return deviceList;
  }
  throw new Error("initDeviceList requires list or listPath.");
};

const ensureDeviceList = (): DeviceListEntry[] => {
  if (!deviceList) {
    throw new Error(
      "deviceList is not initialized. Call initDeviceList(...) before using device utilities.",
    );
  }
  return deviceList;
};

export { deviceList as default };

export function deviceByKind(device): any {
  const list = ensureDeviceList();
  const result = list.find((e) => e.id === device);
  return result;
}

export function deviceByDeviceName(deviceName): any {
  if (!deviceName) return false;
  const list = ensureDeviceList();
  const result = list.find((e) => {
    if (!e.deviceNameDetection) return false;

    return deviceName.startsWith(e.deviceNameDetection);
  });
  if (!result) return false;
  return result;
}

/**
 * Returns true if the device kind has the given feature
 */
export function deviceKindHasFeature(
  feature:
    | "analog"
    | "wifi"
    | "epaper"
    | "nbiot"
    | "nouser"
    | "battery-offline"
    | "code7"
    | "sensor"
    | "payment"
    | "anabox-smart"
    | "intakes1"
    | "intakes3"
    | "intakes4"
    | "intakes5"
    | "intakes7"
    | "stationaer"
    | "tray-colors"
    | "nuechtern-bedarf"
    | "week-colors"
    | "day-colors"
    | "alt-device"
    | "battery-level",
  kind?: DeviceListEntry["id"],
): boolean {
  if (!kind) return false;
  const list = ensureDeviceList();
  const result = list.find((e) => e.id === kind);
  if (!result) return false;
  return result.features.includes(feature);
}
