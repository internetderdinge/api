// @ts-nocheck
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from "multer";
import fs from "fs";
import request from "request";

type GetSignedFileUrlParams = {
  fileName: string;
  bucket?: string;
  expiresIn?: number;
};

type UploadImageParams = {
  key: string;
  blob: Buffer | Uint8Array | Blob | string | ReadableStream;
};

const s3 = new S3Client({
  region: "eu-central-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const getSignedFileUrl = async ({
  fileName,
  bucket = process.env.AWS_S3_BUCKET_NAME!,
  expiresIn = 7200,
}: GetSignedFileUrlParams): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: fileName,
  });

  const result = await getSignedUrl(s3, command, { expiresIn });
  return result;
};

export const uploadImage = async ({
  key,
  blob,
}: UploadImageParams): Promise<{ hello: string }> => {
  const target = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: key,
    Body: blob,
  };

  try {
    const parallelUploads3 = new Upload({
      client: s3,
      queueSize: 4,
      leavePartsOnError: false,
      params: target,
    });

    parallelUploads3.on("httpUploadProgress", (progress) => {
      // console.log(progress);
    });

    await parallelUploads3.done();
  } catch (e) {
    console.error(e);
  }

  return { hello: "xx" };
};

export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
): void => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type, only JPEG and PNG is allowed!"), false);
  }
};

const getPhoto = async (
  photoId: string,
  res: Express.Response,
): Promise<void> => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: photoId,
    };

    await s3
      .getObject(params)
      .on("httpHeaders", function (statusCode, headers) {
        res.set("Content-Length", headers["content-length"]);
        res.set("Content-Type", headers["content-type"]);
        this.response.httpResponse.createUnbufferedStream().pipe(res);
      })
      .send();
  } catch (e) {
    throw new Error(`Could not retrieve file from S3: ${e.message}`);
  }
};

const download = (
  uri: string,
  filename: string,
  callback: () => void,
): void => {
  request.head(uri, (err, res, body) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("content-type:", res.headers["content-type"]);
    console.log("content-length:", res.headers["content-length"]);

    request(uri).pipe(fs.createWriteStream(filename)).on("close", callback);
  });
};

const getPhotoFromUserImage = async (
  photoId: string,
  res: Express.Response,
): Promise<void> => {
  try {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: photoId,
    };

    await s3
      .getObject(params)
      .on("httpHeaders", function (statusCode, headers) {
        res.set("Content-Length", headers["content-length"]);
        res.set("Content-Type", headers["content-type"]);
        this.response.httpResponse.createUnbufferedStream().pipe(res);
      })
      .send();
  } catch (e) {
    throw new Error(`Could not retrieve file from S3: ${e.message}`);
  }
};

export default {
  uploadImage,
  getPhoto,
  getPhotoFromUserImage,
  getSignedFileUrl,
};
