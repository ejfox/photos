import { defineEventHandler } from "h3";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary with your Environment Variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary configuration setup.");

export default defineEventHandler(async (event) => {
  // read the body from the event
  const body = await readBody(event);
  console.log(body);

  const resourceId = body.resourceId;
  const tag = body.tag;

  console.log(`Removing tag ${tag} from asset with resource ID: ${resourceId}`);

  if (!resourceId) {
    return { error: "Resource ID is required." };
  }

  if (!tag || tag.trim() === "") {
    return { error: "Tag must be provided." };
  }

  try {
    console.log(
      `Removing tag ${tag} from asset with resource ID: ${resourceId}`,
    );

    const result = await cloudinary.uploader.remove_tag(tag, [resourceId]);

    console.log("result", result);

    console.log(`Tag removed successfully from asset: ${resourceId}`);

    return { success: true, result };
  } catch (err) {
    console.error("Error removing tag from asset in Cloudinary: ", err);
    return {
      error: "An error occurred while removing the tag from the asset.",
    };
  }
});
