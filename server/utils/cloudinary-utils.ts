// server/utils/cloudinary-utils.ts
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary once
let isConfigured = false;

export function setupCloudinary() {
  if (isConfigured) return;
  
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (cloudinaryUrl) {
    cloudinary.config(cloudinaryUrl);
  } else {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
  
  isConfigured = true;
}

// Shared interfaces
export interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  created_at: string;
  tags?: string[];
  context?: {
    custom?: {
      ai_description?: string;
      updated_at?: string;
    };
  };
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
}

export interface SearchOptions {
  numPhotos?: number;
  filterOutScreenshots?: boolean;
  onlyScreenshots?: boolean;
  onlyPhotoblog?: boolean;
  includeContext?: boolean;
  includeTags?: boolean;
}

// Common search function
export async function searchPhotos(options: SearchOptions = {}) {
  setupCloudinary();
  
  const {
    numPhotos = 50,
    filterOutScreenshots = true,
    onlyScreenshots = false,
    onlyPhotoblog = false,
    includeContext = false,
    includeTags = false,
  } = options;

  let expression = "resource_type:image";
  
  if (onlyScreenshots) {
    expression += " AND tags=screenshot";
  } else if (filterOutScreenshots) {
    expression += " AND -tags=screenshot";
  }
  
  if (onlyPhotoblog) {
    expression += " AND tags=photoblog";
  }

  const fields = ["public_id", "secure_url", "created_at", "width", "height", "format", "bytes"];
  if (includeContext) fields.push("context");
  if (includeTags) fields.push("tags");

  const result = await cloudinary.search
    .expression(expression)
    .sort_by("created_at", "desc")
    .max_results(numPhotos)
    .with_field(fields.join(","))
    .execute();

  return result.resources;
}

// Get lite info for a specific photo
export async function getLiteInfo(publicId: string) {
  setupCloudinary();
  
  const result = await cloudinary.api.resource(publicId, {
    colors: true,
    faces: true,
    image_metadata: true,
  });
  
  return result;
}

// Get EXIF data
export async function getExifData(publicId: string) {
  setupCloudinary();
  
  const result = await cloudinary.api.resource(publicId, {
    exif: true,
    image_metadata: true,
  });
  
  return result.exif || {};
}

// Add tag to photo
export async function addTag(publicId: string, tag: string) {
  setupCloudinary();
  
  const result = await cloudinary.uploader.add_tag(tag, [publicId]);
  return result;
}

// Remove tag from photo
export async function removeTag(publicId: string, tag: string) {
  setupCloudinary();
  
  const result = await cloudinary.uploader.remove_tag(tag, [publicId]);
  return result;
}

// Update asset context/metadata
export async function updateAsset(publicId: string, context: any) {
  setupCloudinary();
  
  const result = await cloudinary.uploader.explicit(publicId, {
    type: "upload",
    context: context,
  });
  
  return result;
}

// Get monthly archive
export async function getMonthlyArchive(year: number, month: number) {
  setupCloudinary();
  
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  const expression = `resource_type:image AND created_at>="${startDate.toISOString()}" AND created_at<="${endDate.toISOString()}"`;
  
  const result = await cloudinary.search
    .expression(expression)
    .sort_by("created_at", "desc")
    .max_results(500)
    .with_field("public_id,secure_url,created_at,tags,width,height")
    .execute();
    
  return result.resources;
}

// Get stats for calendar
export async function getPhotoStats() {
  setupCloudinary();
  
  const result = await cloudinary.search
    .expression("resource_type:image")
    .aggregate("created_at")
    .max_results(5000)
    .execute();
    
  return result;
}

export { cloudinary };