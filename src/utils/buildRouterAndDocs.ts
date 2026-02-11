import type { RequestHandler, Router } from "express";
import { registry } from "../utils/registerOpenApi";

import { validateZod } from "../middlewares/validateZod";
import { bearerAuth, xApiKey } from "../utils/registerOpenApi";

import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";
import type { ZodTypeAny } from "zod";

extendZodWithOpenApi(z);

const roleValidatorNames = ["validateAiRole", "validateAdmin"];
function hasRoleValidation(validators: Function[] = []): boolean {
  return validators.some((fn) => roleValidatorNames.includes(fn.name));
}

export type RouteSpec = {
  method: "get" | "post" | "put" | "patch" | "delete" | "options" | "head";
  path: string;
  validate?: RequestHandler<any, any, any, any, any>[];
  validateWithRequestSchema?: RequestHandler<any, any, any, any, any>[];
  requestSchema?: Partial<Record<string, ZodTypeAny>>;
  responseSchema?: ZodTypeAny;
  handler: RequestHandler<any, any, any, any, any>;
  summary: string;
  description?: string;
  privateDocs?: boolean;
  memoOnly?: boolean;
};

export default function buildAiRouterAndDocs(
  router: Router,
  routeSpecs: any,
  basePath = "/",
  tags: string[] = [],
) {
  routeSpecs.forEach((spec) => {
    // mount Express

    if (!spec.validate) {
      spec.validate = [];
    }

    if (spec.requestSchema) {
      spec.validateWithRequestSchema = [
        validateZod(spec.requestSchema),
        ...spec.validate,
      ];
    }

    if (spec.validateWithRequestSchema) {
      router[spec.method](
        spec.path,
        ...spec.validateWithRequestSchema,
        spec.handler,
      );
    }

    var { body, ...rest } = spec.requestSchema || {};

    if (body) {
      rest.body = {
        content: {
          "application/json": {
            schema: body,
          },
        },
      };
    }

    // console.log('spec.requestSchema', body);

    if (
      spec.responseSchema &&
      !hasRoleValidation(spec.validate) &&
      spec.privateDocs !== true &&
      spec.memoOnly !== true
    ) {
      // collect all middleware fn names (falls back to '<anonymous>' if unnamed)
      const middlewareNames = (spec.validate || []).map(
        (fn) => `\`${fn.name}\`` || "<anonymous>",
      );
      const openApiPath = (basePath + spec.path).replace(
        /:([A-Za-z0-9_]+)/g,
        "{$1}",
      );

      registry.registerPath({
        method: spec.method,
        path: openApiPath,
        summary: spec.summary,
        request: rest,

        // append middleware names to the description
        description: [
          spec.description,
          `\n\nMiddlewares: ${middlewareNames.join(", ")}`,
        ]
          .filter(Boolean)
          .join("\n"),

        // (optionally) expose them as a custom extension instead:
        "x-middlewares": middlewareNames,

        security: [{ [bearerAuth.name]: [] }, { [xApiKey.name]: [] }],
        responses: {
          200: {
            description: "Object with user data.",
            content: {
              "application/json": { schema: spec.responseSchema },
            },
          },
        },
        tags,
      });
    }
    // else: streaming endpoint, we don’t register it in OpenAPI
  });
}
