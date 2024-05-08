// server/api/latest-photos.ts
import { defineEventHandler } from 'h3';
import { v2 as cloudinary } from 'cloudinary';

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
  console.log(body)

  const numPhotos = +body.numPhotos || 420;
  const filterOutScreenshots = body.filterOutScreenshots !== undefined ? body.filterOutScreenshots : true;
  const onlyScreenshots = body.onlyScreenshots !== undefined ? body.onlyScreenshots : false;

  // log out the config options
  console.log('numPhotos: ', numPhotos);
  console.log('filterOutScreenshots: ', filterOutScreenshots);
  console.log('onlyScreenshots: ', onlyScreenshots);
  

  try {
    console.log(`Fetching the last ${numPhotos} photos uploaded to Cloudinary...`);

    // Fetch the last 100 images uploaded
    const result = await cloudinary.search
      .expression('resource_type:image')
      .sort_by('uploaded_at', 'desc')
      .max_results(numPhotos)
      .execute();
  
    // Filter out images that have 'screenshot' or 'private' tags
    let filteredResources = result.resources.filter(resource => {
      const tags = resource.tags || []; // Ensure tags is an array, even if undefined
      const public_id = resource.public_id || ''; // Ensure public_id is a string, even if undefined
      const isScreenshot = tags.includes('screenshot') || public_id.includes('Screenshot') || public_id.includes('screenshot');
      return (onlyScreenshots && isScreenshot) || (filterOutScreenshots && !isScreenshot) || tags.includes('private');
    });

    // Log results
    console.log('Number of images eligible for return: ', filteredResources.length);

    // Create a simplified collection of information about the photos to send back to the client
    const photos = filteredResources.map(resource => ({
      href: resource.secure_url,
      public_id: resource.public_id,
      uploaded_at: resource.created_at,
      // potentially add other relevant fields here
    }));

    return photos;

  } catch (err) {
    console.error("Error fetching photos from Cloudinary: ", err);
    // Return an HTTP error code here for better error handling
    return { error: 'An error occurred while fetching photos.' };
  }
});