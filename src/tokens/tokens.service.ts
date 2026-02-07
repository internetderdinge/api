import crypto from "crypto";
import type { Document } from "mongoose";
import Token from "./tokens.model.js";

export const queryTokens = async (
  filter: Record<string, any>,
  options: { sortBy?: string; limit?: number; page?: number },
): Promise<QueryResult> => {
  return Token.paginate(filter, options);
};

export const createToken = async (
  tokenData: Record<string, any>,
): Promise<{ raw: string } & Document> => {
  // 1. Generate raw token
  const rawToken = crypto.randomBytes(32).toString("hex");
  // 2. Hash the token (e.g., using SHA-256)
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const tokenDataHased = {
    ...tokenData,
    value: hashedToken,
  };

  const newToken = await Token.create(tokenDataHased);
  return {
    ...newToken.toObject(),
    raw: rawToken, // Return the raw token to the user
  };
};

export const getTokenById = async (
  tokenId: string,
): Promise<Document | null> => {
  return Token.findById(tokenId);
};

// Delete a token by ID
export const deleteTokenById = async (
  tokenId: string,
): Promise<Document | null> => {
  return Token.findByIdAndDelete(tokenId);
};
