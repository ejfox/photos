<template>
  <div class="min-h-screen bg-white dark:bg-black text-black dark:text-white p-4 lg:p-8">
    <h1 class="text-4xl font-bold mb-12">Photo Calendar</h1>

    <!-- Loading state -->
    <div v-if="pending" class="flex items-center justify-center h-64">
      <div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"></div>
    </div>

    <div v-else class="space-y-16">
      <!-- Calendar Grid -->
      <div class="grid gap-8">
        <div v-for="day in data" :key="day.date" class="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <h2 class="text-xl font-bold mb-4">{{ formatDate(day.date) }}</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <NuxtLink v-for="photo in day.photos" :key="photo.id" :to="`/${photo.public_id}`"
              class="aspect-square overflow-hidden rounded hover:opacity-90 transition-opacity">
              <img :src="photo.thumbnail" :alt="photo.date" class="w-full h-full object-cover" loading="lazy" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CalendarPhoto {
  id: string
  thumbnail: string
  date: string
  public_id: string
}

interface CalendarDay {
  date: string
  photos: CalendarPhoto[]
}

const { data, pending } = await useFetch<CalendarDay[]>('/api/calendar')

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>