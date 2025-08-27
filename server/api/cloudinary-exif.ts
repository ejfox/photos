// server/api/cloudinary-exif.ts
import { defineEventHandler, readBody } from "h3";
import { getExifData } from "../utils/cloudinary-utils";

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { publicId } = body;
    
    if (!publicId) {
      throw new Error("publicId is required");
    }
    
    const exifData = await getExifData(publicId);
    return exifData;
  } catch (error) {
    console.error("Error fetching EXIF data:", error);
    throw error;
  }
});