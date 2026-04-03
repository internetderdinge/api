// @ts-nocheck
import { auth0, mfaDisableAccount, mfaEnrollAccount } from "./auth0.service.js";

type ObjectId = string; // Replace with the actual ObjectId type if available
type Stock = any; // Replace with the actual Stock type if available

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<Stock>}
 */
export const getAccountById = async (id: ObjectId): Promise<Stock> => {
  return auth0.users.get(id);
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<Stock>}
 */
/* 
export const getAccountByEmail = async (email: string): Promise<Stock> => {
  return auth0.getUsersByEmail(email); // Fixed incorrect variable `postID` to `email`
}; */

/**
 * Enroll user in MFA
 * @param {ObjectId} userId
 * @param {string} mfaToken
 * @returns {Promise<Stock>}
 */
export const mfaEnroll = async (
  userId: ObjectId,
  mfaToken: string,
): Promise<Stock> => {
  const params = { id: userId };
  const body = {
    mfa_token: mfaToken,
  };

  return mfaEnrollAccount(userId, body);
};

export const mfaDisable = async (userId: ObjectId): Promise<Stock> => {
  await mfaDisableAccount(userId);
  return { success: true };
};

/**
 * Update user metadata by id
 */
export const updateMetaDataById = async (
  id: ObjectId,
  updateBody: Record<string, any>,
): Promise<Stock> => {
  // now use the generic update and pass app_metadata
  return auth0.users.update(id, { app_metadata: updateBody });
};

/**
 * Update user by id
 */
export const updateUserById = async (
  id: ObjectId,
  updateBody: Record<string, any>,
): Promise<Stock> => {
  // switch to the v3 ManagementClient users.update
  return auth0.users.update(id, updateBody);
};

/**
 * Delete user by id
 */
export const deleteById = async (userId: ObjectId): Promise<Stock> => {
  return auth0.users.delete(userId);
};

export default {
  getAccountById,
  // getAccountByEmail,
  mfaEnroll,
  mfaDisable,
  updateMetaDataById,
  updateUserById,
  deleteById,
};
