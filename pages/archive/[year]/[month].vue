<template>
  <div class="min-h-screen bg-white dark:bg-black text-black dark:text-white">
    <div class="max-w-7xl mx-auto px-4 py-12 lg:py-16 space-y-16">
      <!-- Header with month/year and navigation -->
      <header class="flex items-center justify-between">
        <div class="space-y-2">
          <h1 class="text-4xl font-bold tracking-tight">{{ formattedDate }}</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-mono">
            {{ data?.totalPhotos }} photos
          </p>
        </div>

        <div class="flex gap-4">
          <UButton v-if="previousMonth" :to="previousMonthLink" variant="ghost" class="text-sm font-mono">
            ← {{ previousMonth }}
          </UButton>
          <UButton v-if="nextMonth" :to="nextMonthLink" variant="ghost" class="text-sm font-mono">
            {{ nextMonth }} →
          </UButton>
        </div>
      </header>

      <!-- Loading state -->
      <div v-if="pending" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900 dark:border-gray-100">
        </div>
      </div>

      <div v-else>
        <!-- No photos message -->
        <div v-if="!data?.photos?.length" class="text-center py-24">
          <p class="text-xl text-gray-500 dark:text-gray-400 mb-6">No photos found for this month</p>
          <UButton to="/archive" variant="ghost" class="font-mono">View All Archives</UButton>
        </div>

        <!-- Photo grid -->
        <div v-else class="photo-list flex flex-wrap">
          <NuxtLink v-for="photo in data.photos" :key="photo.id" :to="`/${photo.public_id}`"
            class="photo-container w-full md:w-2/3 lg:w-1/2 xl:w-1/3 p-8 lg:p-12" :style="randomizedPhotoStyle(photo)">
            <div class="relative bg-gray-100 dark:bg-gray-900 rounded-sm overflow-hidden">
              <img :src="photo.secure_url.replace('/upload/', '/upload/w_1200/')" :alt="formatDate(photo.date)"
                class="w-full h-auto" loading="lazy" />
              <time class="absolute bottom-0 right-0 p-4 text-xs font-mono text-white/50">
                {{ formatDate(photo.date) }}
              </time>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Chance from 'chance'

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

const route = useRoute()
const { month, year } = route.params

// Fetch photos for the month
const { data, pending } = await useFetch<MonthlyArchiveResponse>(`/api/monthly-archive`, {
  query: {
    month,
    year
  }
})

// Format the current month/year for display
const formattedDate = computed(() => {
  const date = new Date(parseInt(year as string), parseInt(month as string) - 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

// Helper for individual photo dates
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

// Navigation between months
const previousMonth = computed(() => {
  const date = new Date(parseInt(year as string), parseInt(month as string) - 2)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
})

const nextMonth = computed(() => {
  const date = new Date(parseInt(year as string), parseInt(month as string))
  const now = new Date()
  return date <= now ? date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : null
})

const previousMonthLink = computed(() => {
  const date = new Date(parseInt(year as string), parseInt(month as string) - 2)
  return `/archive/${date.getFullYear()}/${date.getMonth() + 1}`
})

const nextMonthLink = computed(() => {
  const date = new Date(parseInt(year as string), parseInt(month as string))
  return `/archive/${date.getFullYear()}/${date.getMonth() + 1}`
})

// Randomization function for photo positioning
function randomizedPhotoStyle(photo: MonthlyPhoto) {
  const chance = new Chance(photo.id) // Use photo ID as seed for consistent randomization

  const maxOffsetY = 26
  const maxOffsetX = 12
  const maxAngle = 2.5

  // Skip randomization sometimes for variety
  if (chance.bool({ likelihood: 0.333 })) return {}

  const randomAngle = chance.floating({ min: -maxAngle, max: maxAngle })
  const randomX = chance.floating({ min: -maxOffsetX, max: maxOffsetX })
  const randomY = chance.floating({ min: -maxOffsetY, max: maxOffsetY })
  const scale = chance.floating({ min: 0.92, max: 1 })
  const skewZ = chance.floating({ min: -maxAngle * 0.5, max: maxAngle * 0.5 })

  // Occasionally add skew for extra variety
  if (chance.bool({ likelihood: 0.1 })) {
    return {
      transform: `rotate(${randomAngle}deg) skew(${skewZ}deg)`,
    }
  }

  return {
    transform: `translate(${randomX}px, ${randomY}px) rotate(${randomAngle}deg) scale(${scale})`,
  }
}
</script>

<style scoped>
.photo-list {
  margin: -2rem;
}

.photo-list>* {
  z-index: 1;
}

.photo-list>*:nth-child(odd) {
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