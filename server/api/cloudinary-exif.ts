import { defineEventHandler } from "h3";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with your Environment Variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary configuration setup.");

// Convert raw exposure time into standard photographic format
function convertExposureTime(exposureTime) {
  const [numerator, denominator] = exposureTime.split("/");
  const seconds = parseFloat(numerator) / parseFloat(denominator);

  // return the exposure time as it would appear on the camera
  // like 1/1000 or 1/30 or 5s
  if (seconds > 1) {
    return `${seconds}s`;
  } else {
    return `1/${Math.round(1 / seconds)}`;
  }
}

function convertAperture(aperture) {
  const [numerator, denominator] = aperture.split("/");
  const fNumber = parseFloat(numerator) / parseFloat(denominator);
  return `f/${fNumber.toFixed(1)}`;
}

function convertFocalLength(focalLength) {
  const [numerator, denominator] = focalLength.split("/");
  const millimeters = parseFloat(numerator) / parseFloat(denominator);
  return `${millimeters} mm`;
}

export default defineEventHandler(async (event) => {
  // read the body from the event
  const body = await readBody(event);
  console.log(body);

  const resourceId = body.resourceId;

  if (!resourceId) {
    return { error: "Resource ID is required." };
  }

  try {
    console.log(`Fetching EXIF data for resource ID: ${resourceId}`);

    // Fetch the resource details with EXIF data
    const result = await cloudinary.api.resource(resourceId, { exif: true });

    // Extract the EXIF data from the result
    const exifData = result.exif || {};

    // Convert specific EXIF values to human-readable format
    const humanReadableExifData = {
      exposure: convertExposureTime(exifData.ExposureTime),
      aperture: convertAperture(exifData.FNumber),
      focalLength: convertFocalLength(exifData.FocalLength),
      iso: exifData.PhotographicSensitivity,
      // Add more conversions as needed
      make: exifData.Make,
      model: exifData.Model,
      date: exifData.DateTimeOriginal,
      orientation: exifData.Orientation,
      latitude: exifData.GPSLatitude,
      longitude: exifData.GPSLongitude,
    };

    return { exifData, humanReadableExifData };
  } catch (err) {
    console.error("Error fetching EXIF data from Cloudinary: ", err);
    return { error: "An error occurred while fetching EXIF data." };
  }
});
