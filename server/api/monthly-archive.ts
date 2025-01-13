import { defineEventHandler } from "h3";
import { format, parse } from "date-fns";

interface MonthlyPhoto {
  id: string;
  thumbnail: string;
  date: string;
  public_id: string;
  secure_url: string;
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const { month, year } = query;

  if (!month || !year) {
    throw createError({
      statusCode: 400,
      message: "Month and year are required parameters",
    });
  }

  // Fetch all photos from cloudinary endpoint
  const response = await $fetch("/api/cloudinary", {
    method: "POST",
    body: {
      numPhotos: 5000,
      onlyPhotoblog: true,
    },
  });

  const photos = response as any[];

  // Filter photos for the specified month and year
  const monthlyPhotos = photos.filter((photo) => {
    const photoDate = new Date(photo.created_at);
    return (
      photoDate.getMonth() + 1 === parseInt(month as string) &&
      photoDate.getFullYear() === parseInt(year as string)
    );
  });

  // Format photos for display
  const formattedPhotos = monthlyPhotos.map((photo) => ({
    id: photo.asset_id,
    thumbnail: photo.secure_url.replace(
      "/upload/",
      "/upload/w_400,h_400,c_fill/"
    ),
    date: format(new Date(photo.created_at), "yyyy-MM-dd"),
    public_id: photo.public_id,
    secure_url: photo.secure_url,
  }));

  // Sort by date descending
  formattedPhotos.sort((a, b) => b.date.localeCompare(a.date));

  return {
    photos: formattedPhotos,
    month,
    year,
    totalPhotos: formattedPhotos.length,
  };
});
