import sharp from 'sharp';
import pixelmatch from 'pixelmatch';

/**
 * Compares two image buffers and returns the similarity percentage
 * @param {Buffer} imgBuffer1 - First image buffer
 * @param {Buffer} imgBuffer2 - Second image buffer
 * @returns {Promise<number>} - Percentage of similarity (0-100)
 */
export async function compareImages(imgBuffer1: Buffer, imgBuffer2: Buffer): Promise<number> {
  // Load the images using sharp and resize them to the same size

  const image1 = await sharp(imgBuffer1).raw().ensureAlpha().toBuffer({ resolveWithObject: true });
  const image2 = await sharp(imgBuffer2).raw().ensureAlpha().toBuffer({ resolveWithObject: true });

  // Ensure both images are of the same dimensions
  const width = Math.min(image1.info.width, image2.info.width);
  const height = Math.min(image1.info.height, image2.info.height);

  if (image1.info.width !== image2.info.width || image1.info.height !== image2.info.height) {
    return 0;
  }

  // Resize the images to match in size
  const resizedImage1 = await sharp(imgBuffer1).resize(width, height).raw().ensureAlpha().toBuffer();
  const resizedImage2 = await sharp(imgBuffer2).resize(width, height).raw().ensureAlpha().toBuffer();

  // Create an empty array to store pixel differences
  const diff = new Uint8Array(width * height * 4);

  // Compare the two images pixel by pixel
  const numDiffPixels = pixelmatch(
    resizedImage1,
    resizedImage2,
    diff,
    width,
    height,
    { threshold: 0.3 } // Threshold for pixel comparison
  );

  // Calculate similarity percentage
  const totalPixels = width * height;
  const similarityPercentage = ((totalPixels - numDiffPixels) / totalPixels) * 100;

  return similarityPercentage;
}

export default { compareImages };
