import puppeteer from 'puppeteer';
import { v4 as uuidv4 } from 'uuid';
import AWS from 'aws-sdk';
import path from 'path';

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Function to upload a file to S3
const uploadBuffer = async (buffer: Buffer, fileName: string): Promise<string> => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: fileName,
    Body: buffer,
    ContentType: 'application/pdf',
    ACL: 'private',
  };

  const data = await s3.upload(params).promise();
  return data.Location;
};

// Generate a signed URL
const generateSignedUrl = (fileName: string): string => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: fileName,
    Expires: 60 * 60, // URL expiration time in seconds
  };

  return s3.getSignedUrl('getObject', params);
};

interface GeneratePdfOptions {
  urlPath: string;
  token: string;
}

const generatePdfFromUrl = async ({ urlPath, token }: GeneratePdfOptions): Promise<string> => {
  const domain = process.env.FRONTEND_URL!;
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 1300,
      height: 1200,
      deviceScaleFactor: 1,
    },
    executablePath: process.env.CHROME_BIN,
    args: ['--no-sandbox'],
  });

  const page = await browser.newPage();

  await page.goto(domain);

  // Set the token in local storage
  await page.evaluate((token) => {
    localStorage.setItem('print-token', token);
  }, token);

  await page.goto(domain + urlPath, { waitUntil: 'networkidle2' });

  await page.waitForSelector('.pdf-render-complete');

  const pdf = await page.pdf({ format: 'A4', printBackground: true });

  await page.evaluate(() => {
    localStorage.setItem('print-token', '');
  });

  await browser.close();

  const fileUrl = await uploadBuffer(pdf, `download-${uuidv4()}.pdf`);

  console.log(`File uploaded successfully. File URL: ${fileUrl}`);

  const fileName = path.basename(fileUrl);
  const signedUrl = generateSignedUrl(fileName);
  console.log(`Signed URL: ${signedUrl}`);

  return signedUrl;
};

export default {
  generatePdfFromUrl,
};
