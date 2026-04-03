// @ts-nocheck
import httpStatus from "http-status";
import axios from "axios";
import {
  GetThingShadowCommand,
  IoTDataPlaneClient,
  UpdateThingShadowCommand,
} from "@aws-sdk/client-iot-data-plane";
import { deviceKindHasFeature } from "../utils/deviceUtils";
import ApiError from "../utils/ApiError";
import { getAuth0Token } from "../accounts/auth0.service";
import { getSignedFileUrl } from "../files/upload.service";
import IotDevice from "./iotdevice.model";

import type { AxiosRequestConfig } from "axios";
import type { Device } from "../devices/devices.model.js";
import type { AxiosResponse } from "axios";

import iotsdk from "aws-iot-device-sdk-v2";
const iot = iotsdk.iot;
const mqtt = iotsdk.mqtt;

export const SIMILARITY_THRESHOLD = Number(
  process.env.EPAPER_SIMILARITY_THRESHOLD ?? 99.995,
);

const IOT_DATA_ENDPOINT =
  "https://a2vm6rc8xrtk10-ats.iot.eu-central-1.amazonaws.com";

const iotDataClient = new IoTDataPlaneClient({
  endpoint: IOT_DATA_ENDPOINT,
  region: process.env.AWS_REGION ?? "eu-central-1",
});

/**
 * Get events for a device
 * @param {Object} params
 * @returns {Promise<any>}
 */
export const getEvents = async (params: {
  DeviceId: string;
  DateStart: string;
  DateEnd: string;
  TypeFilter?: string;
  createdAt?: string;
}): Promise<any> => {
  const accessToken = await getAuth0Token();
  try {
    const response: AxiosResponse = await axios.get(
      `${process.env.IOT_API_URL}getevent`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: {
          DeviceId: params.DeviceId,
          DateStart: !params.createdAt
            ? params.DateStart
            : params.DateStart < params.createdAt
              ? params.DateStart
              : params.createdAt,
          DateEnd: params.DateEnd,
          TypeFilter: params.TypeFilter,
        },
      },
    );
    return response.data;
  } catch (error) {
    return null;
  }
};

/**
 * Activate a device
 * @param {string} deviceId
 * @param {string} organization
 * @param {boolean} enable
 * @param {boolean} resetDevice
 * @returns {Promise<any>}
 */
export const activateDevice = async (
  deviceId: string,
  organization: string,
  enable = true,
  resetDevice = false,
): Promise<any> => {
  const accessToken = await getAuth0Token();

  console.log(
    `Activating device ${deviceId} for organization ${organization} with enable=${enable} and resetDevice=${resetDevice}`,
  );
  console.log(`Using access token: ${accessToken ? "Yes" : "No"}`);

  try {
    const data = {
      deviceName: deviceId,
      organizationName: organization,
      reset: resetDevice,
      enable,
    };

    const config: AxiosRequestConfig = {
      method: "post",
      url: `${deviceId.slice(0, 3) === "epd" ? process.env.IOT_API_URL_EPAPER : process.env.IOT_API_URL}activatedevice`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data,
    };

    const response: AxiosResponse = await axios(config);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new ApiError(httpStatus.NOT_FOUND, "Device couldn`t get activated");
  }
};

/**
 * Ping device
 * @param {string} deviceId
 * @returns {Promise<Device>}
 */
export const pingDevice = async (deviceId, body) => {
  const accessToken = await getAuth0Token();
  try {
    const config = {
      method: "get",
      url: `${process.env.IOT_API_URL}ping`,
      params: {
        DeviceId: deviceId,
        ...body,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    //console.log(error);
    throw new ApiError(httpStatus.NOT_FOUND, "Device couldn`t get pinged");
  }
};

/**
 * Reboot device
 * @param {String} deviveId
 * @returns {Promise<Device>}
 */
export const rebootDevice = async (deviceId) => {
  const accessToken = await getAuth0Token();
  try {
    const config = {
      method: "get",
      url: `${process.env.IOT_API_URL}rebootdevice?DeviceId=${deviceId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw new ApiError(httpStatus.NOT_FOUND, "Device couldn`t reboot");
  }
};

/**
 * Update device meta
 * @param {String} deviveId
 * @returns {Promise<Device>}
 */
export const updateDevice = async (deviceId, meta) => {
  const accessToken = await getAuth0Token();
  try {
    const config = {
      method: "post",
      url: `${process.env.IOT_API_URL}updatedevice`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        deviceName: deviceId,
        ...meta,
      },
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.log(error);
    throw new ApiError(httpStatus.NOT_FOUND, "Device couldn`t update meta");
  }
};

/**
 * Case status of device
 * @param {String} deviveId
 * @returns {Promise<Device>}
 */
const caseStatus = async (deviceId) => {
  const accessToken = await getAuth0Token();
  try {
    const config = {
      method: "get",
      url: `${process.env.IOT_API_URL}getcase?DeviceId=${deviceId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    //console.log(error);
    throw new ApiError(httpStatus.NOT_FOUND, "Device couldn`t get status");
  }
};

/**
 * Case status of device
 * @param {String} deviveId
 * @returns {Promise<Device>}
 */
export const alarmsDevice = async (deviceId) => {
  const accessToken = await getAuth0Token();
  try {
    const config = {
      method: "get",
      url: `${process.env.IOT_API_URL}getcase?DeviceId=${deviceId}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    // console.log(error);
    throw new ApiError(httpStatus.NOT_FOUND, "Device couldn`t get status");
  }
};

/**
 * Get device information
 * @param {Object} userBody
 * @returns {Promise<Device>}
 */
export const getDevice = async (deviceName) => {
  const accessToken = await getAuth0Token();
  try {
    const response = await axios.post(
      `${process.env.IOT_API_URL}getdevicelist`,
      { deviceName },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    return response.data;
  } catch (error) {
    console.error(error.message);
    return null;
  }
};

/**
 * Get device information
 * shows battery level, signal strength, and other information
 * @param {Object} userBody
 * @returns {Promise<Device>}
 */
export const getDeviceStatusList = async (deviceName) => {
  const accessToken = await getAuth0Token();

  try {
    const response = await axios.post(
      `${process.env.IOT_API_URL}getdevicestatuslist`,
      {
        returnAll: true,
        DeviceId: [],
      },
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    //  console.log('response', response.data);
    return response.data.message;
  } catch (error) {
    console.error(error);
    console.error(`getDeviceStatusList device error: ${deviceName}`);
    return null;
  }
};

/**
 * Get device information
 * @param {Object} userBody
 * @returns {Promise<Device>}
 */
export const getDeviceStatus = async (deviceName, kind) => {
  const accessToken = await getAuth0Token();

  try {
    const response = await axios.get(
      `${deviceKindHasFeature("epaper", kind) ? process.env.IOT_API_URL_EPAPER : process.env.IOT_API_URL}getdevicestatus`,
      {
        params: { DeviceId: deviceName },
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    // console.log('getDeviceStatus response', response.data);
    // TODO: Align return values
    return deviceKindHasFeature("epaper", kind)
      ? response.data
      : response.data.message;
  } catch (error) {
    console.error(
      `getDeviceStatus device error: ${deviceName}`,
      error.message,
      error.statusMessage,
    );
    return null;
  }
};

/**
 * Shadow alarm update
 * @param {Object} userBody
 * @returns {Promise<Device>}
 */
export const shadowAlarmGet = async (deviceName, shadowName) => {
  if (!deviceName) return { error: "deviceName is required" };

  try {
    const response = await iotDataClient.send(
      new GetThingShadowCommand({
        thingName: deviceName,
        shadowName,
      }),
    );

    const payload = response.payload
      ? Buffer.from(response.payload).toString("utf8")
      : "{}";
    return JSON.parse(payload);
  } catch (e) {
    // console.log(deviceName, e);
    return "error";
  }
};

/**
 * LED update with Timeout
 * @param {Object} userBody
 * @returns {Promise<Device>}
 */
export const ledLightHint = async (deviceName, body) => {
  const accessToken = await getAuth0Token();
  try {
    const response = await axios.post(
      `${process.env.IOT_API_URL}setled?DeviceId=${deviceName}`,
      body,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * Shadow alarm update
 * @param {Object} userBody
 * @returns {Promise<Device>}
 */
const shadowAlarmUpdate = async (deviceName, alarms, shadowName) => {
  const data = alarms;

  if (!deviceName) {
    return { error: "no deviceId" };
  }

  try {
    const response = await iotDataClient.send(
      new UpdateThingShadowCommand({
        payload: JSON.stringify(data),
        thingName: deviceName,
        shadowName,
      }),
    );

    const payload = response.payload
      ? Buffer.from(response.payload).toString("utf8")
      : "{}";
    return JSON.parse(payload);
  } catch (e) {
    return "error";
  }
};

/**
 * Get device by ID
 * @param {string} id
 * @returns {Promise<Device | null>}
 */
export const getById = async (id: string): Promise<Device | null> => {
  return IotDevice.findById(id);
};

/**
 * Update device by ID
 * @param {string} userId
 * @param {Partial<Device>} updateBody
 * @returns {Promise<Device>}
 */
export const updateById = async (
  userId: string,
  updateBody: Partial<Device>,
): Promise<Device> => {
  const iotDevice = await getById(userId);
  if (!iotDevice) {
    throw new ApiError(httpStatus.NOT_FOUND, "IoT Device not found");
  }
  Object.assign(iotDevice, updateBody);
  await iotDevice.save();
  return iotDevice;
};

/**
 * Delete device by ID
 * @param {string} userId
 * @returns {Promise<Device>}
 */
export const deleteById = async (userId: string): Promise<Device> => {
  const iotDevice = await getById(userId);
  if (!iotDevice) {
    throw new ApiError(httpStatus.NOT_FOUND, "IoT Device not found");
  }
  await iotDevice.deleteOne();
  return iotDevice;
};

export const getApiStatus = async (kind: string): Promise<any> => {
  const accessToken = await getAuth0Token();
  try {
    const response: AxiosResponse = await axios.get(
      `${process.env.IOT_API_URL}status/${kind}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return response.data;
  } catch (error) {
    return null;
  }
};

export const resetDevice = async (deviceId: string): Promise<any> => {
  const accessToken = await getAuth0Token();

  try {
    const response: AxiosResponse = await axios.get(
      `${process.env.IOT_API_URL}resetdevice`,
      {
        params: {
          DeviceId: deviceId,
        },
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );
    return response.data;
  } catch (error) {
    //console.error(error);
    throw new ApiError(httpStatus.NOT_FOUND, "Device couldn`t get reset");
  }
};

export async function subscribeToLiveEvents(deviceName: string) {
  const clientId = `web-client-${deviceName}-${Date.now()}`;

  const client = new mqtt.MqttClient();
  const config =
    iot.AwsIotMqttConnectionConfigBuilder.new_builder_for_websocket()
      .with_clean_session(true)
      .with_client_id(clientId)
      .with_endpoint("a2vm6rc8xrtk10-ats.iot.eu-central-1.amazonaws.com")
      .with_credentials(
        process.env.AWS_REGION,
        process.env.AWS_ACCESS_KEY_ID,
        process.env.AWS_SECRET_ACCESS_KEY,
        // currentCredentials.sessionToken,
      )
      .with_keep_alive_seconds(60)
      .build();

  const mqttClient = client.new_connection(config);

  console.log(`Subscribed to live events for device: ${deviceName}`);

  try {
    // 1) actually start the connection
    await mqttClient.connect();
    console.log(`✓ MQTT connected for device: ${deviceName}`);

    // 2) subscribe to the correct topic

    const topic = `${deviceName}/send`;
    // subscribe to topic; rely on global 'message' handler to forward payloads
    await mqttClient.subscribe(topic, mqtt.QoS.AtLeastOnce);
    console.log(
      `✓ Subscribed to live events for device: ${deviceName} on topic: ${topic}`,
    );
  } catch (err: any) {
    console.error("⚠️  MQTT Unexpected error:", err.message || err);
    throw err;
  }

  mqttClient.on("connect", () => {
    mqttClient.subscribe(`nrf-351358815278525/send`);
  });

  mqttClient.on("message", (topic, payload) => {
    const msg = payload.toString();
    console.log(`🛰 [${topic}]`, msg);
    // emit to your socket server, save to db, whatever…
  });

  mqttClient.on("error", (err) => {
    console.error("MQTT Error", err);
  });

  return mqttClient;
}

// NEW:
export const liveEventsWs = async (
  ws: WebSocket,
  req: Request & { params: { deviceId: string } },
) => {
  console.log("WebSocket connection established for live events");
  // lookup the real Thing name
  /* const device = await devicesService.getById(req.params.deviceId);
  if (!device) {
    ws.send(JSON.stringify({ error: 'device not found' }));
    return ws.close();
  }*/

  // subscribe via MQTT
  const client = await subscribeToLiveEvents(req.params.deviceId);

  client.on("message", (_topic, payload) => {
    // normalize various binary payload types to string
    let msg: string;
    if (payload instanceof ArrayBuffer) {
      msg = Buffer.from(payload).toString("utf8");
    } else if (ArrayBuffer.isView(payload)) {
      // Uint8Array, DataView, etc.
      msg = Buffer.from(payload as Uint8Array).toString("utf8");
    } else {
      msg = payload.toString();
    }
    console.log("🛰 Forwarding MQTT → WS:", msg);
    ws.send(msg);
  });

  // wait 4 1 second before sending a message to the client
  console.log("Waiting 1 second before sending initial message to client...");
  await new Promise((resolve) => setTimeout(resolve, 3000));
  // send initial connection established message and then every 10 seconds
  ws.send(JSON.stringify({ message: "WebSocket connection established" }));
  const intervalId = setInterval(() => {
    ws.send(JSON.stringify({ message: "send message" }));
  }, 10000);

  ws.on("close", () => {
    clearInterval(intervalId);
    client.disconnect();
  });
};

export default {
  activateDevice,
  getEvents,
  getById,
  updateById,
  deleteById,
  getApiStatus,
  getDevice,
  liveEventsWs,
  shadowAlarmGet,
  shadowAlarmUpdate,
  ledLightHint,
  getDeviceStatus,
  getDeviceStatusList,
  subscribeToLiveEvents,
};
