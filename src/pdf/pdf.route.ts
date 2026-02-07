import { Router } from "express";
import buildRouterAndDocs from "../utils/buildRouterAndDocs.js";
import { generatePdfSchema } from "./pdf.validation.js";
import { pdfResponseSchema } from "./pdf.schemas.js";
import { generatePdfFromUrl } from "./pdf.controller.js";
import type { RouteSpec } from "../types/routeSpec";
import auth from "../middlewares/auth.js";

export const pdfRouteSpecs: RouteSpec[] = [
  {
    method: "get",
    path: "/",
    validate: [auth("manageUsers")],
    requestSchema: generatePdfSchema,
    responseSchema: pdfResponseSchema,
    handler: generatePdfFromUrl,
    summary: "Generate a PDF from a provided URL",
    description:
      "This endpoint allows users to generate a PDF document from a specified URL.",
    memoOnly: true,
  },
];

const router: Router = Router();

buildRouterAndDocs(router, pdfRouteSpecs, "/pdf", ["PDF"]);

export default router;
