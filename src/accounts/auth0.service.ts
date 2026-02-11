// @ts-nocheck
import { AuthenticationClient, ManagementClient } from "auth0";
import type { ManagementClientOptions, User } from "auth0";
import { promises as fs, readFileSync } from "fs";
import { config } from "process";

interface TokenManagementClient {
  clientId?: string;
  clientSecret?: string;
  token?: string;
}

type CachedToken = {
  token: string;
  expiresAt: number;
};

let tokenManagementClient: TokenManagementClient = {
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
};

//if (config.env !== 'production') {
try {
  console.warn("Auth0 client: use local token from cache try");
  const token = readFileSync("./token.txt", "utf8");
  console.warn("Auth0 client: use local token from cache");
  tokenManagementClient = { token };
} catch (error) {
  console.log("Auth0 Client: use new token");
}
//}

// IoT Api
/*
export const auth0Management = new ManagementClient({
  ...tokenManagementClient,
  domain: process.env.AUTH0_MANAGEMENT_DOMAIN!,
  grant_type: 'client_credentials',
  audience: process.env.AUTH0_AUDIENCE!,
} as ManagementClientOptions);
 */

// add this AuthenticationClient just for token fetching
export const auth0AuthClient = new AuthenticationClient({
  domain: process.env.AUTH0_MANAGEMENT_DOMAIN!,
  clientId: process.env.AUTH0_MANAGEMENT_CLIENT_ID!,
  clientSecret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET!,
});

// In-memory cache for client-credentials tokens
let cachedToken: string | null = null;
let tokenExpiresAt: number | null = null;
let pendingTokenPromise: Promise<string> | null = null;

let cachedManagementToken: string | null = null;
let managementTokenExpiresAt: number | null = null;
let pendingManagementTokenPromise: Promise<string> | null = null;

const TOKEN_FILE_PATH = "./token.txt";
const MANAGEMENT_TOKEN_FILE_PATH = "./token.management.txt";
const TOKEN_BUFFER_SECONDS = 60; // refresh a minute before expiry
const TOKEN_FALLBACK_TTL_SECONDS = 3300; // ~55 minutes when no expiry metadata exists

const loadTokenFromFile = async (
  filePath: string,
): Promise<CachedToken | null> => {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    try {
      const parsed = JSON.parse(raw);
      if (parsed?.token && parsed?.expiresAt) {
        return { token: parsed.token, expiresAt: parsed.expiresAt };
      }
    } catch (parseError) {
      // Backward compatibility: token.txt previously contained only the token string
      const now = Math.floor(Date.now() / 1000);
      return { token: raw.trim(), expiresAt: now + TOKEN_FALLBACK_TTL_SECONDS };
    }
  } catch (error) {
    return null;
  }
  return null;
};

const writeTokenFile = async (
  filePath: string,
  token: string,
  expiresAt: number,
): Promise<void> => {
  const payload = JSON.stringify({ token, expiresAt });
  await fs.writeFile(filePath, payload, "utf8");
};

const tokenIsValid = (
  token: string | null,
  expiresAt: number | null,
  now: number,
): boolean => {
  if (!token || !expiresAt) return false;
  return now < expiresAt - TOKEN_BUFFER_SECONDS;
};

export const getAuth0Token = async (): Promise<string> => {
  const audience =
    process.env.AUTH0_AUDIENCE ||
    process.env.AUTH0_MANAGEMENT_AUDIENCE ||
    "localhost:3000/";
  const grantOpts = { audience };

  const now = Math.floor(Date.now() / 1000);
  if (tokenIsValid(cachedToken, tokenExpiresAt, now))
    return cachedToken as string;
  if (pendingTokenPromise) return pendingTokenPromise;

  pendingTokenPromise = (async () => {
    // Non-production: try to reuse a file-cached token (for local dev) before minting a new one
    // if (process.env.NODE_ENV !== 'production') {
    const fileToken = await loadTokenFromFile(TOKEN_FILE_PATH);
    if (fileToken && fileToken.expiresAt > now + TOKEN_BUFFER_SECONDS) {
      cachedToken = fileToken.token;
      tokenExpiresAt = fileToken.expiresAt;
      pendingTokenPromise = null;
      return cachedToken;
    }
    //}

    const tokenResponse =
      await auth0AuthClient.oauth.clientCredentialsGrant(grantOpts);
    const expiresIn = tokenResponse.data.expires_in || 3600;
    cachedToken = tokenResponse.data.access_token;
    tokenExpiresAt = now + expiresIn;

    // if (process.env.NODE_ENV !== 'production') {
    await writeTokenFile(TOKEN_FILE_PATH, cachedToken, tokenExpiresAt);
    // }

    pendingTokenPromise = null;
    return cachedToken;
  })();

  return pendingTokenPromise;
};

export const getAuth0ManagementToken = async (): Promise<string> => {
  const audience = process.env.AUTH0_MANAGEMENT_AUDIENCE;
  if (!audience) {
    throw new Error(
      "Missing AUTH0_MANAGEMENT_AUDIENCE; cannot mint Management API token",
    );
  }

  const grantOpts = { audience };
  const now = Math.floor(Date.now() / 1000);

  if (tokenIsValid(cachedManagementToken, managementTokenExpiresAt, now))
    return cachedManagementToken as string;
  if (pendingManagementTokenPromise) return pendingManagementTokenPromise;

  pendingManagementTokenPromise = (async () => {
    const fileToken = await loadTokenFromFile(MANAGEMENT_TOKEN_FILE_PATH);
    if (fileToken && fileToken.expiresAt > now + TOKEN_BUFFER_SECONDS) {
      cachedManagementToken = fileToken.token;
      managementTokenExpiresAt = fileToken.expiresAt;
      pendingManagementTokenPromise = null;
      return cachedManagementToken;
    }

    const tokenResponse =
      await auth0AuthClient.oauth.clientCredentialsGrant(grantOpts);
    const expiresIn = tokenResponse.data.expires_in || 3600;
    cachedManagementToken = tokenResponse.data.access_token;
    managementTokenExpiresAt = now + expiresIn;

    await writeTokenFile(
      MANAGEMENT_TOKEN_FILE_PATH,
      cachedManagementToken,
      managementTokenExpiresAt,
    );

    pendingManagementTokenPromise = null;
    return cachedManagementToken;
  })();

  return pendingManagementTokenPromise;
};

export const auth0 = new ManagementClient({
  domain: process.env.AUTH0_MANAGEMENT_DOMAIN!,
  audience: process.env.AUTH0_MANAGEMENT_AUDIENCE!,
  token: getAuth0ManagementToken,
});

export const getUserIdByEmail = async (email: string): Promise<User[]> => {
  // use the users resource to look up by email
  return auth0.usersByEmail.getByEmail({ email });
};

export const sendVerificationEmail = async (userID: string): Promise<any> => {
  return auth0.jobs.verifyEmail({ user_id: userID });
};

export const getUserById = async (userId: string): Promise<User> => {
  return auth0.users.get({ id: userId });
};

export const avatar = async (userId: string): Promise<User> => {
  return auth0.users.get({ id: userId });
};

export const mfaEnrollAccount = async (
  userId: string,
  mfaToken: string,
): Promise<any> => {
  const ticketResponse = await auth0.guardian.createEnrollmentTicket({
    user_id: userId,
    send_mail: false,
  });

  return ticketResponse;
};

export const mfaDisableAccount = async (userId: string): Promise<any> => {
  await auth0.users.deleteAuthenticationMethods({ id: userId });
  return { success: true };
};

export const getUsersByIds = async (postIDs: string[]): Promise<User[]> => {
  let q = "";
  postIDs.forEach((e, i) => {
    if (e) q = `${q} ${i >= 2 ? " OR " : ""} user_id:"${e}"`;
  });

  const params = {
    search_engine: "v3",
    q,
    per_page: 100,
    page: 0,
  };

  return auth0.users.getAll(params);
};

export default {
  auth0,
  avatar,
  getAuth0Token,
  getUsersByIds,
  getUserIdByEmail,
  getUserById,
  mfaEnrollAccount,
  sendVerificationEmail,
};
