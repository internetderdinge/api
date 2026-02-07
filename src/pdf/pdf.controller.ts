import httpStatus from "http-status";
import catchAsync from "../utils/catchAsync.js";
import pdfService from "./pdf.service.js";

export const generatePdfFromUrl = catchAsync(async (req, res) => {
  const fileName = "memo-print";

  const authHeader = req.headers["authorization"];
  const token = authHeader.split(" ")[1];

  const result = await pdfService.generatePdfFromUrl({ ...req.query, token });

  res.status(httpStatus.CREATED).send({ signed: result });
});

export default {
  generatePdfFromUrl,
};
