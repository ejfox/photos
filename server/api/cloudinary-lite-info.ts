import { defineEventHandler } from "h3";
import { fetchLiteInfo } from "./cloudinary"; // Import the fetchLiteInfo function

export default defineEventHandler(async (event) => {
  try {
    const liteInfo = await fetchLiteInfo(); // Call the fetchLiteInfo function
    return liteInfo; // Return the lite-info data
  } catch (err) {
    console.error("Error fetching lite-info: ", err);
    return { error: "An error occurred while fetching lite-info." };
  }
});
