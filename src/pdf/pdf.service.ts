import puppeteer from "puppeteer";
import { v4 as uuidv4 } from "uuid";
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl as getS3SignedUrl } from "@aws-sdk/s3-request-presigner";
import path from "path";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials:
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

// Function to upload a file to S3
const uploadBuffer = async (
  buffer: Buffer,
  fileName: string,
): Promise<void> => {
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
      Body: buffer,
      ContentType: "application/pdf",
    }),
  );
};

// Generate a signed URL
const generateSignedUrl = async (fileName: string): Promise<string> => {
  return getS3SignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: fileName,
    }),
    { expiresIn: 60 * 60 },
  );
};

interface GeneratePdfOptions {
  urlPath: string;
  token: string;
}

const generatePdfFromUrl = async ({
  urlPath,
  token,
}: GeneratePdfOptions): Promise<string> => {
  const domain = process.env.FRONTEND_URL!;
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 1300,
      height: 1200,
      deviceScaleFactor: 1,
    },
    executablePath: process.env.CHROME_BIN,
    args: ["--no-sandbox"],
  });

  const page = await browser.newPage();

  await page.goto(domain);

  // Set the token in local storage
  await page.evaluate((token) => {
    localStorage.setItem("print-token", token);
  }, token);

  await page.goto(domain + urlPath, { waitUntil: "networkidle2" });

  await page.waitForSelector(".pdf-render-complete");

  const pdf = await page.pdf({ format: "A4", printBackground: true });

  await page.evaluate(() => {
    localStorage.setItem("print-token", "");
  });

  await browser.close();

  const fileName = `download-${uuidv4()}.pdf`;
  await uploadBuffer(Buffer.from(pdf), fileName);

  console.log(`File uploaded successfully. File Name: ${fileName}`);

  const signedUrl = await generateSignedUrl(path.basename(fileName));
  console.log(`Signed URL: ${signedUrl}`);

  return signedUrl;
};

export default {
  generatePdfFromUrl,
};
