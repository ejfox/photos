import { defineEventHandler } from "h3";
import { v2 as cloudinary } from "cloudinary";

// Track if we've already configured Cloudinary
let isConfigured = false;

function setupCloudinary() {
  if (isConfigured) return;

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  isConfigured = true;
  console.log("Cloudinary configured successfully");
}

// We are limited to 2000 requests per hour, so we should limit the number of photos we fetch

/*
We can get the current rate limit via the API like
cloudinary.v2.api
.resources()
.then(result=>console.log(result.rate_limit_allowed,
        result.rate_limit_remaining,
        result.rate_limit_reset_at));
        

*/
console.log("Cloudinary configuration setup.");

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  created_at: string;
  context?: {
    custom?: {
      ai_description?: string;
      updated_at?: string;
    };
  };
  image_metadata?: {
    ExposureTime?: string;
    FNumber?: string;
    FocalLength?: string;
    Make?: string;
    Model?: string;
    DateTimeOriginal?: string;
    GPSLatitude?: string;
    GPSLongitude?: string;
    GPSLatitudeRef?: string;
    GPSLongitudeRef?: string;
    ImageDescription?: string;
    PhotographicSensitivity?: number;
    Orientation?: number;
  };
}

function convertExposureTime(exposureTime: string | undefined): string {
  if (!exposureTime) return "";
  const [numerator, denominator] = exposureTime.split("/");
  const seconds = parseFloat(numerator) / parseFloat(denominator);
  return seconds > 1 ? `${seconds}s` : `1/${Math.round(1 / seconds)}`;
}

function convertAperture(aperture: string | undefined): string {
  if (!aperture) return "";
  const [numerator, denominator] = aperture.split("/");
  const fNumber = parseFloat(numerator) / parseFloat(denominator);
  return `f/${fNumber.toFixed(1)}`;
}

function convertFocalLength(focalLength: string | undefined): string {
  if (!focalLength) return "";
  const [numerator, denominator] = focalLength.split("/");
  return `${Math.round(parseFloat(numerator) / parseFloat(denominator))}mm`;
}

export default defineEventHandler(async (event) => {
  setupCloudinary();

  const body = await readBody(event);
  const { resourceId } = body;

  if (!resourceId || typeof resourceId !== "string") {
    console.error("Invalid or missing resourceId:", resourceId);
    return {
      error: "Resource ID is required and must be a string.",
      providedValue: resourceId,
    };
  }

  try {
    // Fetch the resource details with EXIF data
    const result = await cloudinary.api.resource(resourceId, {
      image_metadata: true,
      exif: true,
      context: true,
    });

    if (!result) {
      console.error("No result from Cloudinary for resourceId:", resourceId);
      return { error: "No data found for the provided resource ID" };
    }

    // Extract the EXIF data from the result
    const exifData = {
      ...result.image_metadata,
      ...result.exif,
    };

    // Convert specific EXIF values to human-readable format
    const humanReadableExifData = {
      exposure: convertExposureTime(exifData.ExposureTime),
      aperture: convertAperture(exifData.FNumber),
      focalLength: convertFocalLength(exifData.FocalLength),
      caption: exifData.ImageDescription || "",
      iso: exifData.PhotographicSensitivity,
      make: exifData.Make,
      model: exifData.Model,
      date: exifData.DateTimeOriginal,
      orientation: exifData.Orientation,
      latitude: exifData.GPSLatitude,
      longitude: exifData.GPSLongitude,
      latitudeRef: exifData.GPSLatitudeRef,
      longitudeRef: exifData.GPSLongitudeRef,
    };

    return {
      ...result,
      exifData,
      humanReadableExifData,
    };
  } catch (err: any) {
    console.error("Error fetching EXIF data:", err);
    return {
      error: "Failed to fetch EXIF data",
      details: err.message,
    };
  }
});
