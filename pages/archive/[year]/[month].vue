<template>
  <div class="min-h-screen bg-white dark:bg-black text-black dark:text-white">
    <SiteNav />
    <div class="max-w-6xl mx-auto px-4 lg:px-8 py-16">
      <!-- Minimal header with month/year and navigation -->
      <header class="flex items-center justify-between mb-16">
        <div class="space-y-2">
          <h1 class="text-2xl font-light tracking-tight">
            {{ formattedDate }}
          </h1>
          <p class="text-xs font-mono text-gray-500 dark:text-gray-400">
            {{ data?.totalPhotos }} photographs
          </p>
        </div>

        <div class="flex gap-8">
          <NuxtLink
            v-if="previousMonth"
            :to="previousMonthLink"
            class="text-xs font-mono text-gray-500 hover:text-black dark:hover:text-white transition-colors"
          >
            ← {{ previousMonth }}
          </NuxtLink>
          <NuxtLink
            v-if="nextMonth"
            :to="nextMonthLink"
            class="text-xs font-mono text-gray-500 hover:text-black dark:hover:text-white transition-colors"
          >
            {{ nextMonth }} →
          </NuxtLink>
        </div>
      </header>

      <!-- Loading state -->
      <div v-if="pending" class="flex items-center justify-center h-64">
        <div
          class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"
        ></div>
      </div>

      <div v-else>
        <!-- No photos message -->
        <div v-if="!data?.photos?.length" class="text-center py-16">
          <p class="text-sm font-mono text-gray-500 dark:text-gray-400 mb-8">
            No photographs found
          </p>
          <NuxtLink to="/archive" class="text-xs font-mono underline"
            >Return to archives</NuxtLink
          >
        </div>

        <!-- Photo grid - clean and minimal -->
        <div
          v-else
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <div v-for="photo in data.photos" :key="photo.id" class="space-y-2">
            <!-- Photo without text overlay -->
            <NuxtLink :to="`/${photo.public_id}`" class="block">
              <img
                :src="photo.secure_url.replace('/upload/', '/upload/w_1200/')"
                :alt="formatDate(photo.date)"
                class="w-full h-auto"
                loading="lazy"
              />
            </NuxtLink>

            <!-- Metadata below image -->
            <div
              class="text-xs font-mono text-gray-500 dark:text-gray-400 pt-2"
            >
              {{ formatDate(photo.date) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Chance from "chance";

interface MonthlyPhoto {
  id: string;
  thumbnail: string;
  date: string;
  public_id: string;
  secure_url: string;
}

interface MonthlyArchiveResponse {
  photos: MonthlyPhoto[];
  month: string;
  year: string;
  totalPhotos: number;
}

const route = useRoute();
const { month, year } = route.params;

// Fetch photos for the month
const { data, pending } = await useFetch<MonthlyArchiveResponse>(
  `/api/monthly-archive`,
  {
    query: {
      month,
      year,
    },
  },
);

// Format the current month/year for display
const formattedDate = computed(() => {
  const date = new Date(
    parseInt(year as string),
    parseInt(month as string) - 1,
  );
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
});

// Helper for individual photo dates
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
};

// Navigation between months
const previousMonth = computed(() => {
  const date = new Date(
    parseInt(year as string),
    parseInt(month as string) - 2,
  );
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
});

const nextMonth = computed(() => {
  const date = new Date(parseInt(year as string), parseInt(month as string));
  const now = new Date();
  return date <= now
    ? date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;
});

const previousMonthLink = computed(() => {
  const date = new Date(
    parseInt(year as string),
    parseInt(month as string) - 2,
  );
  return `/archive/${date.getFullYear()}/${date.getMonth() + 1}`;
});

const nextMonthLink = computed(() => {
  const date = new Date(parseInt(year as string), parseInt(month as string));
  return `/archive/${date.getFullYear()}/${date.getMonth() + 1}`;
});

// Randomization function for photo positioning
function randomizedPhotoStyle(photo: MonthlyPhoto) {
  const chance = new Chance(photo.id); // Use photo ID as seed for consistent randomization

  const maxOffsetY = 26;
  const maxOffsetX = 12;
  const maxAngle = 2.5;

  // Skip randomization sometimes for variety
  if (chance.bool({ likelihood: 0.333 })) return {};

  const randomAngle = chance.floating({ min: -maxAngle, max: maxAngle });
  const randomX = chance.floating({ min: -maxOffsetX, max: maxOffsetX });
  const randomY = chance.floating({ min: -maxOffsetY, max: maxOffsetY });
  const scale = chance.floating({ min: 0.92, max: 1 });
  const skewZ = chance.floating({ min: -maxAngle * 0.5, max: maxAngle * 0.5 });

  // Occasionally add skew for extra variety
  if (chance.bool({ likelihood: 0.1 })) {
    return {
      transform: `rotate(${randomAngle}deg) skew(${skewZ}deg)`,
    };
  }

  return {
    transform: `translate(${randomX}px, ${randomY}px) rotate(${randomAngle}deg) scale(${scale})`,
  };
}
</script>

<style scoped>
.photo-list {
  margin: -2rem;
}

.photo-list > * {
  z-index: 1;
}

.photo-list > *:nth-child(odd) {
  z-index: 2;
}

.photo-container {
  transition: all 1200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.photo-container:hover {
  z-index: 10;
}

.photo-container:active {
  transform: rotate(0deg) scale(1.01) !important;
}
</style>
