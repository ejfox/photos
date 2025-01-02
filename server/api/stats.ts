import { defineEventHandler } from "h3";
import { format } from "date-fns";
import { v2 as cloudinary } from "cloudinary";

interface PhotoStats {
  stats: {
    totalPhotos: number;
    photosThisYear: number;
    photosThisMonth: number;
    averagePerMonth: number;
    mostActiveMonth: {
      month: string;
      count: number;
    };
  };
  contributions: number[];
  dates: string[];
  currentStreak: {
    count: number;
    startDate: string;
    endDate: string;
  };
  longestStreak: {
    count: number;
    startDate: string;
    endDate: string;
  };
  gearStats: {
    cameras: { name: string; count: number; percentage: number }[];
    lenses: { name: string; count: number; percentage: number }[];
    mostUsedSettings: {
      apertures: { value: string; count: number }[];
      shutterSpeeds: { value: string; count: number }[];
      isoValues: { value: number; count: number }[];
      focalLengths: { value: string; count: number }[];
    };
  };
  timeOfDayStats: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
}

function convertExposureTime(exposureTime: string): string {
  if (!exposureTime) return "";
  const [numerator, denominator] = exposureTime.split("/");
  const seconds = parseFloat(numerator) / parseFloat(denominator);
  return seconds > 1 ? `${seconds}s` : `1/${Math.round(1 / seconds)}`;
}

function convertAperture(aperture: string): string {
  if (!aperture) return "";
  const [numerator, denominator] = aperture.split("/");
  const fNumber = parseFloat(numerator) / parseFloat(denominator);
  return `f/${fNumber.toFixed(1)}`;
}

function convertFocalLength(focalLength: string): string {
  if (!focalLength) return "";
  const [numerator, denominator] = focalLength.split("/");
  return `${Math.round(parseFloat(numerator) / parseFloat(denominator))}mm`;
}

function getTimeOfDay(hour: number) {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  if (hour >= 17 && hour < 20) return "evening";
  return "night";
}

export default defineEventHandler(async (event): Promise<PhotoStats> => {
  // Fetch photos from our existing cloudinary endpoint
  const response = await $fetch("/api/cloudinary", {
    method: "POST",
    body: {
      numPhotos: 1000,
      onlyPhotoblog: true,
    },
  });

  const photos = response as any[];

  // Fetch EXIF data for all photos first
  const exifPromises = photos.map((photo) =>
    $fetch("/api/cloudinary-exif", {
      method: "POST",
      body: { resourceId: photo.public_id },
    })
  );

  const exifResults = await Promise.all(exifPromises);

  // Filter out screenshots and non-photos by checking for camera make/model
  const photosWithExif = photos.filter((photo, index) => {
    const exif = exifResults[index]?.exifData;
    return exif?.Make && exif?.Model; // Only include photos with camera metadata
  });

  // Get the full date range
  const dates = photosWithExif.map((p) => new Date(p.created_at));
  const oldestDate = new Date(Math.min(...dates.map((d) => d.getTime())));
  const today = new Date();

  // Basic stats calculation - now for ALL dates
  const photosByDate = new Map<string, number>();

  // Initialize all dates from oldest photo to today
  for (let d = new Date(oldestDate); d <= today; d.setDate(d.getDate() + 1)) {
    photosByDate.set(format(d, "yyyy-MM-dd"), 0);
  }

  photosWithExif.forEach((photo) => {
    const date = format(new Date(photo.created_at), "yyyy-MM-dd");
    if (photosByDate.has(date)) {
      photosByDate.set(date, (photosByDate.get(date) || 0) + 1);
    }
  });

  // Convert Maps to sorted arrays for streak calculation
  const allDates = Array.from(photosByDate.keys()).sort();
  const contributions = allDates.map((date) => photosByDate.get(date) || 0);

  // Calculate streaks with dates
  let currentStreak = { count: 0, startDate: "", endDate: "" };
  let longestStreak = { count: 0, startDate: "", endDate: "" };
  let tempStreak = { count: 0, startDate: "", endDate: "" };

  for (let i = contributions.length - 1; i >= 0; i--) {
    if (contributions[i] > 0) {
      if (tempStreak.count === 0) {
        tempStreak.startDate = allDates[i];
      }
      tempStreak.count++;
      tempStreak.endDate = allDates[i];

      if (i === contributions.length - 1) {
        currentStreak = { ...tempStreak };
      }

      if (tempStreak.count > longestStreak.count) {
        longestStreak = { ...tempStreak };
      }
    } else {
      tempStreak = { count: 0, startDate: "", endDate: "" };
    }
  }

  // Initialize gear stats tracking
  const cameras = new Map<string, number>();
  const lenses = new Map<string, number>();
  const apertures = new Map<string, number>();
  const shutterSpeeds = new Map<string, number>();
  const isoValues = new Map<number, number>();
  const focalLengths = new Map<string, number>();
  const timeOfDay = {
    morning: 0,
    afternoon: 0,
    evening: 0,
    night: 0,
  };

  // Process EXIF data
  exifResults.forEach((result) => {
    if (result.error) return;

    const exif = result.exifData;
    const hr = result.humanReadableExifData;

    if (exif?.Make && exif?.Model) {
      const camera = `${exif.Make} ${exif.Model}`;
      cameras.set(camera, (cameras.get(camera) || 0) + 1);
    }

    if (exif?.LensModel) {
      lenses.set(exif.LensModel, (lenses.get(exif.LensModel) || 0) + 1);
    }

    if (hr?.aperture) {
      apertures.set(hr.aperture, (apertures.get(hr.aperture) || 0) + 1);
    }

    if (hr?.exposure) {
      shutterSpeeds.set(hr.exposure, (shutterSpeeds.get(hr.exposure) || 0) + 1);
    }

    if (exif?.PhotographicSensitivity) {
      isoValues.set(
        exif.PhotographicSensitivity,
        (isoValues.get(exif.PhotographicSensitivity) || 0) + 1
      );
    }

    if (hr?.focalLength) {
      focalLengths.set(
        hr.focalLength,
        (focalLengths.get(hr.focalLength) || 0) + 1
      );
    }

    if (exif?.DateTimeOriginal) {
      const hour = new Date(exif.DateTimeOriginal).getHours();
      timeOfDay[getTimeOfDay(hour)]++;
    }
  });

  // Calculate monthly stats for all time
  const photosByMonth = new Map<string, number>();
  photosWithExif.forEach((photo) => {
    const month = format(new Date(photo.created_at), "yyyy-MM");
    photosByMonth.set(month, (photosByMonth.get(month) || 0) + 1);
  });

  const mostActiveMonth = Array.from(photosByMonth.entries()).reduce(
    (max, [month, count]) =>
      count > (max.count || 0) ? { month, count } : max,
    { month: "", count: 0 }
  );

  // Calculate this year's photos
  const thisYear = new Date().getFullYear();
  const photosThisYear = photosWithExif.filter(
    (photo) => new Date(photo.created_at).getFullYear() === thisYear
  ).length;

  // Calculate this month's photos
  const thisMonth = format(new Date(), "yyyy-MM");
  const photosThisMonth = photosWithExif.filter(
    (photo) => format(new Date(photo.created_at), "yyyy-MM") === thisMonth
  ).length;

  // Helper function to sort and format gear stats
  const formatGearStats = (map: Map<string, number>) => {
    const total = Array.from(map.values()).reduce(
      (sum, count) => sum + count,
      0
    );
    return Array.from(map.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  };

  // Helper function to sort and format setting stats with proper typing
  const formatSettingStats = <T extends string | number>(
    map: Map<T, number>
  ) => {
    return Array.from(map.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  return {
    stats: {
      totalPhotos: photosWithExif.length,
      photosThisYear,
      photosThisMonth,
      averagePerMonth: Math.round(photosWithExif.length / photosByMonth.size),
      mostActiveMonth: {
        month: format(new Date(mostActiveMonth.month), "MMMM yyyy"),
        count: mostActiveMonth.count,
      },
    },
    contributions,
    dates: allDates,
    currentStreak,
    longestStreak,
    gearStats: {
      cameras: formatGearStats(cameras),
      lenses: formatGearStats(lenses),
      mostUsedSettings: {
        apertures: formatSettingStats<string>(apertures),
        shutterSpeeds: formatSettingStats<string>(shutterSpeeds),
        isoValues: formatSettingStats<number>(isoValues),
        focalLengths: formatSettingStats<string>(focalLengths),
      },
    },
    timeOfDayStats: timeOfDay,
  };
});
