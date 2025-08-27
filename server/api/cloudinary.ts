// server/api/cloudinary.ts
import { defineEventHandler, readBody, createError } from "h3";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary once at module level using environment variable or individual vars
if (!cloudinary.config().cloud_name) {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (cloudinaryUrl) {
    // Use CLOUDINARY_URL if available (recommended)
    cloudinary.config(cloudinaryUrl);
  } else {
    // Fallback to individual env vars
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }
}

interface CloudinaryResource {
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

interface SearchRequestBody {
  numPhotos?: number;
  filterOutScreenshots?: boolean;
  onlyScreenshots?: boolean;
  onlyPhotoblog?: boolean;
  includeContext?: boolean;
  includeTags?: boolean;
}

export default defineEventHandler(async (event) => {
  try {
    const body: SearchRequestBody = await readBody(event);
    
    // Validate and set defaults
    const numPhotos = Math.min(Math.max(Number(body.numPhotos) || 100, 1), 500); // Cloudinary max is 500
    const filterOutScreenshots = body.filterOutScreenshots ?? true;
    const onlyScreenshots = body.onlyScreenshots ?? false;
    const onlyPhotoblog = body.onlyPhotoblog ?? false;
    
    // Validate mutually exclusive options
    if (onlyScreenshots && filterOutScreenshots) {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot filter out screenshots and only show screenshots simultaneously"
      });
    }


    // Build search expression
    let expression = "resource_type:image";
    if (onlyPhotoblog) {
      expression += " AND tags=photo-blog";
    }
    if (onlyScreenshots) {
      expression += " AND (tags=screenshot OR folder=screenshots)";
    }
    
    // Create new search instance for each query (Cloudinary best practice)
    const searchQuery = cloudinary.search
      .expression(expression)
      .sort_by("created_at", "desc") // Use created_at instead of uploaded_at
      .max_results(numPhotos);
    
    // Conditionally add fields to reduce payload size
    if (body.includeTags !== false) searchQuery.with_field("tags");
    if (body.includeContext) searchQuery.with_field("context");
    
    const result = await searchQuery.execute();

    // Optimized screenshot detection function
    const isScreenshot = (resource: CloudinaryResource): boolean => {
      const tags = resource.tags || [];
      const publicId = resource.public_id.toLowerCase();
      
      // Check tags first (fastest)
      if (tags.includes("screenshot")) return true;
      
      // Check public_id patterns
      return (
        publicId.includes("screenshot") ||
        publicId.includes("screen shot") ||
        publicId.includes("screencap") ||
        publicId.startsWith("screenshots/") ||
        publicId.includes("/screenshots/")
      );
    };

    // Apply client-side filtering if needed (only if not handled in search expression)
    let filteredResources = result.resources;
    
    if (!onlyScreenshots && filterOutScreenshots) {
      filteredResources = result.resources.filter((resource: CloudinaryResource) => !isScreenshot(resource));
    }


    // Create optimized response payload
    const photos = filteredResources.map((resource: CloudinaryResource) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      created_at: resource.created_at,
      ...(resource.tags && { tags: resource.tags }),
      ...(resource.context && { context: resource.context }),
      ...(resource.width && { width: resource.width }),
      ...(resource.height && { height: resource.height }),
      ...(resource.format && { format: resource.format })
    }));

    return photos;
  } catch (error) {
    console.error("Cloudinary API error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch photos from Cloudinary",
      data: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
});

// Optimized function to fetch lite-info (unused function - consider removing)
export async function fetchLiteInfo(maxResults = 500) {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      max_results: Math.min(maxResults, 500), // Cloudinary max is 500
      resource_type: "image",
      sort_by: [["created_at", "desc"]]
    });

    return result.resources.map((resource: CloudinaryResource) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      created_at: resource.created_at
    }));
  } catch (error) {
    console.error("Error fetching lite-info from Cloudinary:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch lite-info from Cloudinary"
    });
  }
}
