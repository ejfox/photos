<template>
  <div class="min-h-screen bg-white dark:bg-black text-black dark:text-white px-4 lg:px-8 py-16 lg:py-32">
    <div class="max-w-4xl mx-auto space-y-32">
      <!-- Title -->
      <header class="space-y-4">
        <div class="space-y-1">
          <p class="text-xs font-mono uppercase tracking-wider text-gray-500 dark:text-gray-400">Photography Statistics
          </p>
          <h1 class="text-5xl font-light tracking-tight">{{ dateRange }}</h1>
        </div>
        <p class="font-mono text-sm text-gray-400 dark:text-gray-500">Generated {{ formatDate(new Date()) }}</p>
      </header>

      <!-- Loading state -->
      <div v-if="pending" class="flex items-center justify-center h-64">
        <div class="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900 dark:border-gray-100">
        </div>
      </div>

      <div v-else-if="data" class="space-y-32">
        <!-- Overview Stats -->
        <section class="grid grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16">
          <div v-for="stat in overviewStats" :key="stat.label" class="space-y-2">
            <p class="text-4xl lg:text-5xl font-light font-mono tabular-nums">{{ stat.value }}</p>
            <p class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">{{ stat.label }}</p>
            <p v-if="stat.detail" class="text-sm font-mono text-gray-400 dark:text-gray-500">{{ stat.detail }}</p>
          </div>
        </section>

        <!-- Streaks -->
        <section class="space-y-8">
          <h2 class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Streaks</h2>
          <div class="grid grid-cols-2 gap-x-12">
            <div class="space-y-2">
              <p class="text-4xl lg:text-5xl font-light font-mono tabular-nums">{{ data.currentStreak.count }}</p>
              <p class="text-sm font-mono text-gray-400 dark:text-gray-500">Current Streak (Days)</p>
              <p v-if="data.currentStreak.count > 0" class="text-xs font-mono text-gray-400 dark:text-gray-500">
                {{ formatDate(new Date(data.currentStreak.startDate)) }} — {{ formatDate(new
                  Date(data.currentStreak.endDate)) }}
              </p>
            </div>
            <div class="space-y-2">
              <p class="text-4xl lg:text-5xl font-light font-mono tabular-nums">{{ data.longestStreak.count }}</p>
              <p class="text-sm font-mono text-gray-400 dark:text-gray-500">Longest Streak (Days)</p>
              <p v-if="data.longestStreak.count > 0" class="text-xs font-mono text-gray-400 dark:text-gray-500">
                {{ formatDate(new Date(data.longestStreak.startDate)) }} — {{ formatDate(new
                  Date(data.longestStreak.endDate)) }}
              </p>
            </div>
          </div>
        </section>

        <!-- Camera Gear -->
        <section v-if="data.gearStats" class="space-y-16">
          <h2 class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Equipment</h2>

          <!-- Cameras -->
          <div class="space-y-6">
            <div v-for="camera in data.gearStats.cameras" :key="camera.name"
              class="flex items-baseline justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
              <span class="font-mono">{{ camera.name }}</span>
              <div class="flex items-baseline gap-6">
                <span class="text-sm font-mono tabular-nums text-gray-500">{{ camera.count.toString().padStart(4, '0')
                  }}</span>
                <span class="text-sm font-mono text-gray-400 w-12 text-right">{{ camera.percentage }}%</span>
              </div>
            </div>
          </div>

          <!-- Lenses -->
          <div class="space-y-6">
            <div v-for="lens in data.gearStats.lenses" :key="lens.name"
              class="flex items-baseline justify-between border-b border-gray-100 dark:border-gray-800 pb-2">
              <span class="font-mono">{{ lens.name }}</span>
              <div class="flex items-baseline gap-6">
                <span class="text-sm font-mono tabular-nums text-gray-500">{{ lens.count.toString().padStart(4, '0')
                  }}</span>
                <span class="text-sm font-mono text-gray-400 w-12 text-right">{{ lens.percentage }}%</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Camera Settings -->
        <section v-if="data.gearStats?.mostUsedSettings" class="space-y-16">
          <h2 class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Technical Details</h2>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-16">
            <!-- Apertures -->
            <div class="space-y-8">
              <h3 class="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">Apertures</h3>
              <div class="space-y-4">
                <div v-for="setting in data.gearStats.mostUsedSettings.apertures" :key="setting.value"
                  class="flex items-baseline justify-between">
                  <span class="font-mono">{{ setting.value }}</span>
                  <span class="text-sm font-mono tabular-nums text-gray-500">{{ setting.count.toString().padStart(3,
                    '0') }}</span>
                </div>
              </div>
            </div>

            <!-- Shutter Speeds -->
            <div class="space-y-8">
              <h3 class="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">Shutter Speeds</h3>
              <div class="space-y-4">
                <div v-for="setting in data.gearStats.mostUsedSettings.shutterSpeeds" :key="setting.value"
                  class="flex items-baseline justify-between">
                  <span class="font-mono">{{ setting.value }}</span>
                  <span class="text-sm font-mono tabular-nums text-gray-500">{{ setting.count.toString().padStart(3,
                    '0') }}</span>
                </div>
              </div>
            </div>

            <!-- ISO Values -->
            <div class="space-y-8">
              <h3 class="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">ISO Values</h3>
              <div class="space-y-4">
                <div v-for="setting in data.gearStats.mostUsedSettings.isoValues" :key="setting.value"
                  class="flex items-baseline justify-between">
                  <span class="font-mono">ISO {{ setting.value }}</span>
                  <span class="text-sm font-mono tabular-nums text-gray-500">{{ setting.count.toString().padStart(3,
                    '0') }}</span>
                </div>
              </div>
            </div>

            <!-- Focal Lengths -->
            <div class="space-y-8">
              <h3 class="text-xs uppercase tracking-wider text-gray-400 dark:text-gray-500">Focal Lengths</h3>
              <div class="space-y-4">
                <div v-for="setting in data.gearStats.mostUsedSettings.focalLengths" :key="setting.value"
                  class="flex items-baseline justify-between">
                  <span class="font-mono">{{ setting.value }}</span>
                  <span class="text-sm font-mono tabular-nums text-gray-500">{{ setting.count.toString().padStart(3,
                    '0') }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Time of Day -->
        <section v-if="data.timeOfDayStats" class="space-y-8">
          <h2 class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Time of Day</h2>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-16">
            <div v-for="(count, time) in data.timeOfDayStats" :key="time" class="space-y-2">
              <p class="text-4xl lg:text-5xl font-light font-mono tabular-nums">{{ count }}</p>
              <p class="text-sm font-mono text-gray-400 dark:text-gray-500 capitalize">{{ time }}</p>
            </div>
          </div>
        </section>

        <!-- Contribution Calendar -->
        <section class="space-y-8">
          <h2 class="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Activity</h2>
          <div class="h-48 w-full">
            <ContributionCalendar v-if="data?.dates && data?.contributions" :dates="data.dates"
              :contributions="data.contributions" />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { format } from 'date-fns'

interface PhotoStats {
  stats: {
    totalPhotos: number
    photosThisYear: number
    photosThisMonth: number
    averagePerMonth: number
    mostActiveMonth: {
      month: string
      count: number
    }
  }
  contributions: number[]
  dates: string[]
  currentStreak: {
    count: number
    startDate: string
    endDate: string
  }
  longestStreak: {
    count: number
    startDate: string
    endDate: string
  }
  gearStats: {
    cameras: Array<{ name: string; count: number; percentage: number }>
    lenses: Array<{ name: string; count: number; percentage: number }>
    mostUsedSettings: {
      apertures: Array<{ value: string; count: number }>
      shutterSpeeds: Array<{ value: string; count: number }>
      isoValues: Array<{ value: number; count: number }>
      focalLengths: Array<{ value: string; count: number }>
    }
  }
  timeOfDayStats: {
    morning: number
    afternoon: number
    evening: number
    night: number
  }
}

const { data, pending } = await useFetch<PhotoStats>('/api/stats')

const formatDate = (date: Date) => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatMonthYear = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  })
}

const dateRange = computed(() => {
  if (!data.value?.dates || data.value.dates.length === 0) return ''

  const dates = data.value.dates.map(d => new Date(d))
  const oldestDate = new Date(Math.min(...dates.map(d => d.getTime())))
  const newestDate = new Date(Math.max(...dates.map(d => d.getTime())))
  const today = new Date()

  // If we have photos from this year, include it in the range
  const endYear = Math.max(newestDate.getFullYear(), today.getFullYear())
  const startYear = oldestDate.getFullYear()

  return `${startYear}—${endYear}`
})

const seoMeta = computed(() => {
  const baseTitle = 'Photo Stats · EJ Fox'
  const baseDescription = 'Photography statistics and analytics dashboard'

  if (!data.value?.stats || !data.value?.gearStats) {
    return {
      title: baseTitle,
      meta: [
        { name: 'description', content: baseDescription },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: baseTitle },
        { property: 'og:description', content: baseDescription },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:site', content: '@ejfox' },
        { name: 'twitter:title', content: baseTitle },
        { name: 'twitter:description', content: baseDescription }
      ]
    }
  }

  const title = `Photo Stats ${dateRange.value} · EJ Fox`
  const description = `Photography statistics and analytics: ${data.value.stats.totalPhotos.toLocaleString()} photos taken between ${dateRange.value}, using ${data.value.gearStats.cameras.length} different cameras and ${data.value.gearStats.lenses.length} lenses.`

  return {
    title,
    meta: [
      { name: 'description', content: description },
      { property: 'og:type', content: 'website' },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@ejfox' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description }
    ]
  }
})

useHead(seoMeta)

const overviewStats = computed(() => {
  if (!data.value) return []

  const now = new Date()
  const thisMonth = format(now, 'yyyy-MM')
  const thisYear = now.getFullYear()

  return [
    {
      label: 'Total Photos',
      value: data.value.stats.totalPhotos.toLocaleString(),
    },
    {
      label: `Photos in ${thisYear}`,
      value: data.value.stats.photosThisYear.toLocaleString(),
    },
    {
      label: `Photos in ${format(now, 'MMMM yyyy')}`,
      value: data.value.stats.photosThisMonth.toLocaleString(),
    },
    {
      label: 'Most Active Month',
      value: data.value.stats.mostActiveMonth.count.toLocaleString(),
      detail: formatMonthYear(data.value.stats.mostActiveMonth.month)
    }
  ]
})
</script>