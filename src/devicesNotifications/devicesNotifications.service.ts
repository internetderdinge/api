import httpStatus from 'http-status';
import { SESv2Client, ListSuppressedDestinationsCommand } from '@aws-sdk/client-sesv2';
import DeviceNotification from './devicesNotifications.model';
import ApiError from '../../src/utils/ApiError';
import { auth0 } from '../accounts/auth0.service';

import type { Notification } from './devicesNotifications.model';
import type { FilterQuery, PaginateOptions, QueryResult } from 'mongoose';

/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<Notification>}
 */
export const createNotificationUser = async ({ user }: { user: string }): Promise<Notification> => {
  const result = await DeviceNotification.findOne({ user });
  if (result) throw new ApiError(httpStatus.NOT_FOUND, 'DevicesNotifications user existing');
  const devicesNotification = await DeviceNotification.create({ user });
  return devicesNotification;
};

/**
 * Set the device token for a user
 * @param {Object} userBody
 * @returns {Promise<Notification>}
 */
export const setDeviceToken = async ({
  user,
  body,
}: {
  user: string;
  body: { token: string; deviceId: string; [key: string]: any };
}): Promise<Notification> => {
  const { token, ...meta } = body;
  let result = await DeviceNotification.findOne({ user });
  if (!result) {
    result = await createNotificationUser({ user });
  }

  result.tokens = [...new Map(result.tokens.map((m) => [m.deviceId, m])).values()];

  if (result.tokens.find((t) => t.token === token)) return result;

  result.tokens = result.tokens.filter((t) => t.deviceId !== meta.deviceId);
  result.tokens.push({ token, ...meta });
  await result.save();
  return result;
};

/**
 * Remove an existing device token usually used when the user is getting logged out
 * @param {Object} userBody
 * @returns {Promise<Notification>}
 */
export const removeDeviceToken = async ({
  user,
  body: { deviceId },
}: {
  user: string;
  body: { deviceId: string };
}): Promise<Notification> => {
  let result = await DeviceNotification.findOne({ user });
  if (!result) {
    result = await createNotificationUser({ user });
  }

  if (result.tokens.find((t) => t.deviceId === deviceId)) {
    result.tokens = result.tokens.filter((t) => t.deviceId !== deviceId);
    await result.save();
  }
  return result;
};

/*
const convertAllTokens = async () => {
  const devicesNotifications = await DeviceNotification.find();

  await Promise.all(
    devicesNotifications.map(async (user) => {
      //const tokenListNewFiltered = user.tokens.filter((v, i, a) => a.findIndex((v2) => v2 === v) === i);

      const tokenListNew = user.tokens.map((ttt) => {
        if (typeof ttt === 'string') {
          return { token: ttt };
        }
        return ttt;
      });

      console.log(tokenListNew);

      const devicesNotification = await updateById(user.id, {
        tokens: [],
      });
    })
  );
};*/

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */

const queryNotificationsByUser = async (filter, options) => {
  return DeviceNotification.paginate(filter, options);
};

const getById = async (id) => {
  return DeviceNotification.findById(id);
};

const getByUser = async (user) => {
  return DeviceNotification.findOne({ user });
};

const updateById = async (notificationId, updateBody) => {
  const user = await getById(notificationId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

const updateByUserId = async (user, updateBody) => {
  const userEntryExists = await DeviceNotification.findOne({ user });
  if (!userEntryExists) {
    const newUser = await createNotification({ user });
    //throw new ApiError(httpStatus.NOT_FOUND, 'DeviceNotification not found');
  }
  const userEntry = await DeviceNotification.findOne({ user });
  Object.assign(userEntry, updateBody);
  await userEntry.save();

  return userEntry;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<Notification>}
 */
const deleteById = async (userId) => {
  const user = await getById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Notification not found');
  }
  await user.deleteOne();
  return user;
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<Notification>}
 */
const cleanup = async () => {
  const deviceNotifications = await DeviceNotification.find();

  const auth0Users = await auth0.getUsers();

  const sesV2 = new SESv2Client({ region: 'eu-central-1' });
  const input = {
    Reasons: ['BOUNCE' || 'COMPLAINT'],
    PageSize: 300,
  };

  const command = new ListSuppressedDestinationsCommand(input);
  const suppressedDestinations = await sesV2.send(command);

  const suppressedEmailList = suppressedDestinations.SuppressedDestinationSummaries.map((a) => a.EmailAddress);
  const suppressedEmailAuth0Users = auth0Users.filter((a) => suppressedEmailList.includes(a.email));
  await Promise.all(
    suppressedEmailAuth0Users.map(async (a) => {
      updateByUserId(a.user_id, { bounceEmail: a.email });
    }),
  );

  return { suppressedEmailList, suppressedEmailAuth0Users };

  /* deviceNotifications.map((d) => {
    d.tokens.forEach((token) => {

      if token 
    });
  });*/

  //const resultJson = result.toJSON();
  //const resultsFiltered = result.filter((e) => e.patientData === null);

  //const idList = resultsFiltered.map((e) => e._id);

  // const deleted = await calendarsService.deleteMany(idList);

  return { deviceNotifications, auth0Users, response };

  /* res.send({
       deleted,
       idList,
       resultsFiltered,
       resultsFilteredLength: resultsFiltered.length,
       resultLength: result.length,
     });*/
};

export default {
  createNotificationUser,
  getById,
  cleanup,
  queryNotificationsByUser,
  setDeviceToken,
  removeDeviceToken,
  getByUser,
  updateById,
  updateByUserId,
  deleteById,
};
