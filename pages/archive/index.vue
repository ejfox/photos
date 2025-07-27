<template>
  <div class="dark:bg-black dark:text-white">
    <SiteNav />
    <div class="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <div class="max-w-6xl mx-auto px-4 lg:px-8 py-16 space-y-16">
        <!-- Simple, minimal header -->
        <header>
          <h1 class="text-2xl font-light tracking-tight">Archives</h1>
        </header>

        <!-- Loading state -->
        <div v-if="pending" class="flex items-center justify-center h-64">
          <div
            class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 dark:border-gray-100"
          ></div>
        </div>

        <div v-else class="space-y-16">
          <!-- Group by year -->
          <section
            v-for="[year, months] in Object.entries(groupedArchives).reverse()"
            :key="year"
            class="space-y-8"
          >
            <h2
              class="text-sm font-mono tracking-wide text-gray-500 dark:text-gray-400"
            >
              {{ year }}
            </h2>

            <div
              class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              <NuxtLink
                v-for="month in months"
                :key="`${year}-${month.number}`"
                :to="`/archive/${year}/${month.number}`"
                class="group space-y-2"
              >
                <!-- Clean image presentation without overlays -->
                <div
                  class="aspect-video bg-gray-100 dark:bg-gray-900 overflow-hidden transition-all duration-500"
                >
                  <img
                    v-if="month.previewImage"
                    :src="month.previewImage"
                    :alt="`${month.name} ${year}`"
                    class="w-full h-full object-cover transition-all duration-700 group-hover:scale-102"
                  />
                </div>

                <!-- Metadata below the image instead of overlaid -->
                <div class="flex justify-between items-baseline pt-2">
                  <h3 class="text-sm font-mono">{{ month.name }}</h3>
                  <span
                    class="text-xs font-mono text-gray-500 dark:text-gray-400"
                    >{{ month.photoCount }}</span
                  >
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
const { data: photos, pending } = await useFetch("/api/cloudinary", {
  method: "POST",
  body: {
    numPhotos: 5000,
    onlyPhotoblog: true,
  },
});

// Group photos by year and month
const groupedArchives = computed<YearlyArchives>(() => {
  if (!photos.value) return {};

  // First, group photos by year and month
  const yearMonthGroups: Record<
    string,
    Record<string, { count: number; preview?: string }>
  > = {};

  // Group photos by year and month
  photos.value.forEach((photo: any) => {
    const date = new Date(photo.created_at);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    if (!yearMonthGroups[year]) {
      yearMonthGroups[year] = {};
    }

    if (!yearMonthGroups[year][month]) {
      yearMonthGroups[year][month] = {
        count: 0,
        preview: photo.secure_url.replace(
          "/upload/",
          "/upload/w_800,h_600,c_fill/",
        ),
      };
    }

    yearMonthGroups[year][month].count++;
  });

  // Convert to final format and sort
  const result: YearlyArchives = {};

  // Sort years in descending order
  const years = Object.keys(yearMonthGroups)
    .map(Number)
    .sort((a, b) => a - b);

  years.forEach((year) => {
    const months = Object.entries(yearMonthGroups[year]).map(
      ([month, data]) => ({
        name: new Date(year, parseInt(month) - 1).toLocaleString("en-US", {
          month: "long",
        }),
        number: parseInt(month),
        photoCount: data.count,
        previewImage: data.preview,
      }),
    );

    // Sort months in descending order
    result[year] = months.sort((a, b) => b.number - a.number);
  });

  return result;
});
</script>

<style scoped>
.scale-102 {
  transform: scale(1.02);
}
</style>
