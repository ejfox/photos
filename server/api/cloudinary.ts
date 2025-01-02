// server/api/cloudinary.ts
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
}

export default defineEventHandler(async (event) => {
  setupCloudinary();

  const body = await readBody(event);
  console.log(body);

  const numPhotos = +body.numPhotos || 420;
  const filterOutScreenshots =
    body.filterOutScreenshots !== undefined ? body.filterOutScreenshots : true;
  const onlyScreenshots =
    body.onlyScreenshots !== undefined ? body.onlyScreenshots : false;
  const onlyPhotoblog =
    body.onlyPhotoblog !== undefined ? body.onlyPhotoblog : false;

  // log out the config options
  console.log("numPhotos: ", numPhotos);
  console.log("filterOutScreenshots: ", filterOutScreenshots);
  console.log("onlyScreenshots: ", onlyScreenshots);

  try {
    console.log(
      `Fetching the last ${numPhotos} photos uploaded to Cloudinary...`
    );

    // Fetch the last 100 images uploaded
    const result = await cloudinary.search
      .expression(
        "resource_type:image" + (onlyPhotoblog ? " AND tags=photo-blog" : "")
      )
      .sort_by("uploaded_at", "desc")
      .with_field("tags")
      .with_field("metadata")
      .with_field("context")
      .max_results(numPhotos)
      .execute();

    // Helper function to identify screenshots
    const isScreenshot = (resource: any) => {
      const tags = resource.tags || [];
      const public_id = (resource.public_id || "").toLowerCase();
      return (
        tags.includes("screenshot") ||
        public_id.includes("screenshot") ||
        public_id.includes("screen shot") ||
        public_id.includes("screencap") ||
        public_id.startsWith("screenshots/") ||
        public_id.includes("/screenshots/")
      );
    };

    // Filter resources based on screenshot preferences
    let filteredResources = result.resources.filter((resource: any) => {
      const isScreenshotResource = isScreenshot(resource);
      return (
        (onlyScreenshots && isScreenshotResource) ||
        (filterOutScreenshots && !isScreenshotResource) ||
        (!filterOutScreenshots && !onlyScreenshots)
      );
    });

    // Log results
    console.log(
      "Number of images eligible for return: ",
      filteredResources.length
    );

    // Create a simplified collection of information about the photos to send back to the client
    const photos = filteredResources.map((resource: any) => ({
      href: resource.secure_url,
      public_id: resource.public_id,
      uploaded_at: resource.created_at,
      secure_url: resource.secure_url,
      context: resource.context,
      tags: resource.tags,
      // Include any other fields we need
      ...resource,
    }));

    return photos;
  } catch (err) {
    console.error("Error fetching photos from Cloudinary: ", err);
    return { error: "An error occurred while fetching photos." };
  }
});

// New function to fetch lite-info on all photos
async function fetchLiteInfo() {
  try {
    const result = await cloudinary.api.resources({
      type: "upload",
      max_results: 500, // Adjust as needed, max is 500
      resource_type: "image",
      // Add any additional parameters for filtering or sorting if necessary
    });

    // Process the result to extract necessary lite-info
    const liteInfo = result.resources.map((resource) => ({
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      created_at: resource.created_at,
      // Add any other relevant fields you want to include
    }));

    return liteInfo;
  } catch (err) {
    console.error("Error fetching lite-info from Cloudinary: ", err);
    return { error: "An error occurred while fetching lite-info." };
  }
}

// Export the new function if needed
export { fetchLiteInfo };
