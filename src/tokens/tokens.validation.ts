import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import { zGet, zDelete } from "../utils/zValidations.js";

export const createTokenSchema = {
  body: z.object({
    name: z.string().openapi({ example: "my sample token" }),
  }),
};

export const getTokenSchema = zGet("tokenId");

export const deleteTokenSchema = zDelete("tokenId");
