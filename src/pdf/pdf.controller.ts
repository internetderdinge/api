import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync.js";
import pdfService from "./pdf.service.js";
import ApiError from "../utils/ApiError.js";

export const generatePdfFromUrl = catchAsync(async (req, res) => {
  const fileName = "memo-print";

  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Missing Authorization header");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Missing bearer token");
  }

  const urlPath =
    typeof req.query.urlPath === "string" ? req.query.urlPath : undefined;
  if (!urlPath) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Missing urlPath query parameter",
    );
  }

  const result = await pdfService.generatePdfFromUrl({ urlPath, token });

  res.status(httpStatus.CREATED).send({ signed: result });
});

export default {
  generatePdfFromUrl,
};
