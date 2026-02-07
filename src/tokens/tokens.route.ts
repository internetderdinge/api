import { Router } from "express";
import buildRouterAndDocs from "../utils/buildRouterAndDocs.js";
import {
  createTokenSchema,
  getTokenSchema,
  deleteTokenSchema,
} from "./tokens.validation.js";
import { tokenResponseSchema } from "./tokens.schemas.js";
import {
  createToken,
  getToken,
  deleteToken,
  getTokens,
} from "./tokens.controller.js";
import auth from "../middlewares/auth.js";
import type { RouteSpec } from "../types/routeSpec";
import { validateParamsToken } from "../middlewares/validateTokens.js";

export const tokensRouteSpecs: RouteSpec[] = [
  {
    method: "get",
    path: "/",
    validate: [auth("manageTokens")],
    requestSchema: {},
    responseSchema: tokenResponseSchema,
    handler: getTokens,
    privateDocs: true,
    summary: "List all tokens of the current user",
  },
  {
    method: "post",
    path: "/",
    validate: [auth("manageTokens")],
    requestSchema: createTokenSchema,
    responseSchema: tokenResponseSchema,
    handler: createToken,
    privateDocs: true,
    summary: "Create a new token",
  },
  {
    method: "get",
    path: "/:tokenId",
    validate: [auth("getTokens"), validateParamsToken],
    requestSchema: getTokenSchema,
    responseSchema: tokenResponseSchema,
    handler: getToken,
    privateDocs: true,
    summary: "Get a token by ID",
  },
  {
    method: "delete",
    path: "/:tokenId",
    validate: [auth("manageTokens"), validateParamsToken],
    requestSchema: deleteTokenSchema,
    responseSchema: tokenResponseSchema,
    handler: deleteToken,
    privateDocs: true,
    summary: "Delete a token by ID",
  },
];

const router: Router = Router();

buildRouterAndDocs(router, tokensRouteSpecs, "/tokens", ["Tokens"]);

export default router;
