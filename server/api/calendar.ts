import { defineEventHandler } from "h3";
import { format, parseISO, startOfDay, endOfDay } from "date-fns";

interface CalendarPhoto {
  id: string;
  thumbnail: string;
  date: string;
  public_id: string;
}

interface CalendarDay {
  date: string;
  photos: CalendarPhoto[];
}

export default defineEventHandler(async (event): Promise<CalendarDay[]> => {
  // Fetch all photos from our cloudinary endpoint
  const response = await $fetch("/api/cloudinary", {
    method: "POST",
    body: {
      numPhotos: 5000, // Get a lot of photos for the calendar
      onlyPhotoblog: true,
    },
  });

  const photos = response as any[];

  // Group photos by date
  const photosByDate = new Map<string, CalendarPhoto[]>();

  photos.forEach((photo) => {
    const date = format(new Date(photo.created_at), "yyyy-MM-dd");
    const calendarPhoto: CalendarPhoto = {
      id: photo.asset_id,
      thumbnail: photo.secure_url.replace(
        "/upload/",
        "/upload/w_150,h_150,c_fill/",
      ),
      date,
      public_id: photo.public_id,
    };

    if (!photosByDate.has(date)) {
      photosByDate.set(date, []);
    }
    photosByDate.get(date)?.push(calendarPhoto);
  });

  // Convert to sorted array of calendar days
  const calendarDays = Array.from(photosByDate.entries())
    .map(([date, photos]) => ({
      date,
      photos: photos.sort((a, b) => b.date.localeCompare(a.date)),
    }))
    .sort((a, b) => b.date.localeCompare(a.date));

  return calendarDays;
});
