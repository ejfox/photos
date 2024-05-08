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
  const metadata = body.metadata;

  if (!resourceId) {
    return { error: "Resource ID is required." };
  }

  try {
    console.log(`Updating asset with resource ID: ${resourceId}`);

    const result = await cloudinary.uploader.add_tag(tag, [resourceId]);

    console.log(result);

    console.log(`Asset updated successfully: ${result.public_id}`);

    return { success: true, result };
  } catch (err) {
    console.error("Error updating asset in Cloudinary: ", err);
    return { error: "An error occurred while updating the asset." };
  }
});
