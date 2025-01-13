<template>
  <div class="dark:bg-black dark:text-white">
    <SiteNav />
    <div class="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div class="max-w-7xl mx-auto px-4 py-12 lg:py-16 space-y-16">
        <header class="space-y-2">
          <h1 class="text-4xl font-bold tracking-tight">Photo Archives</h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 font-mono">Browse photos by month and year</p>
        </header>

        <!-- Loading state -->
        <div v-if="pending" class="flex items-center justify-center h-64">
          <div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900 dark:border-gray-100">
          </div>
        </div>

        <div v-else class="space-y-24">
          <!-- Group by year -->
          <section v-for="[year, months] in Object.entries(groupedArchives).reverse()" :key="year" class="space-y-8">
            <h2 class="text-2xl font-bold tracking-tight">{{ year }}</h2>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <NuxtLink v-for="month in months" :key="`${year}-${month.number}`"
                :to="`/archive/${year}/${month.number}`"
                class="relative aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg overflow-hidden">
                <!-- Preview image -->
                <img v-if="month.previewImage" :src="month.previewImage" :alt="`${month.name} ${year}`"
                  class="w-full h-full object-cover" />

                <!-- Month info -->
                <div class="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
                  <h3 class="text-white text-lg font-medium mb-1">{{ month.name }}</h3>
                  <span class="text-white/70 text-sm font-mono">{{ month.photoCount }} photos</span>
                </div>
              </NuxtLink>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface MonthArchive {
  name: string;
  number: number;
  photoCount: number;
  previewImage?: string;
}

interface YearlyArchives {
  [year: string]: MonthArchive[];
}

// Fetch all photos
const { data: photos, pending } = await useFetch('/api/cloudinary', {
  method: 'POST',
  body: {
    numPhotos: 5000,
    onlyPhotoblog: true
  }
})

// Group photos by year and month
const groupedArchives = computed<YearlyArchives>(() => {
  if (!photos.value) return {}

  // First, group photos by year and month
  const yearMonthGroups: Record<string, Record<string, { count: number; preview?: string }>> = {}

  // Group photos by year and month
  photos.value.forEach((photo: any) => {
    const date = new Date(photo.created_at)
    const year = date.getFullYear()
    const month = date.getMonth() + 1

    if (!yearMonthGroups[year]) {
      yearMonthGroups[year] = {}
    }

    if (!yearMonthGroups[year][month]) {
      yearMonthGroups[year][month] = {
        count: 0,
        preview: photo.secure_url.replace('/upload/', '/upload/w_800,h_600,c_fill/')
      }
    }

    yearMonthGroups[year][month].count++
  })

  // Convert to final format and sort
  const result: YearlyArchives = {}

  // Sort years in descending order
  const years = Object.keys(yearMonthGroups)
    .map(Number)
    // .sort((a, b) => b - a)
    // the other way
    .sort((a, b) => a - b)

  years.forEach(year => {
    const months = Object.entries(yearMonthGroups[year]).map(([month, data]) => ({
      name: new Date(year, parseInt(month) - 1).toLocaleString('en-US', { month: 'long' }),
      number: parseInt(month),
      photoCount: data.count,
      previewImage: data.preview
    }))

    // Sort months in descending order
    result[year] = months.sort((a, b) => b.number - a.number)
  })

  return result
})
</script>