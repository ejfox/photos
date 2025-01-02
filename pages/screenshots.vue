<template>
  <div class="dark:bg-black dark:text-white">
    <div v-if="pending" class="p-4">Loading...</div>
    <div v-else-if="!photos || photos.length === 0" class="p-4">
      No screenshots found. Debug info:
      <pre class="text-xs mt-2">{{ JSON.stringify(photos, null, 2) }}</pre>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-2 lg:p-4">
      <div v-for="photo in photos" :key="photo.public_id" class="flex-item p-0 lg:p-1">
        <div class="space-y-2">
          <LibraryPhoto :photo="photo" :cropType="cropType" />
          <div v-if="photo.context?.custom?.ai_description"
            class="text-[9px] max-h-64 overflow-y-auto font-mono text-gray-500 dark:text-gray-400 p-2">
            {{ photo.context.custom.ai_description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CloudinaryResource {
  public_id: string
  secure_url: string
  created_at: string
  tags?: string[]
  context?: {
    custom?: {
      ai_description?: string
      updated_at?: string
    }
  }
}

const filterScreenshots = ref(true)

const { data: photos, pending, error } = await useFetch<CloudinaryResource[]>('/api/cloudinary', {
  method: 'POST',
  body: {
    filterOutScreenshots: false,
    onlyScreenshots: true,
    includeContext: true,
    includeTags: true,
    numPhotos: 500 // Let's get more photos to make sure we're not missing any
  }
})

// Debug log to check the data
console.log('Screenshots data:', {
  pending,
  error,
  totalPhotos: photos.value?.length,
  firstPhoto: photos.value?.[0],
  photosWithAI: photos.value?.filter(p => p.context?.custom?.ai_description).length,
  allTags: [...new Set(photos.value?.flatMap(p => p.tags || []) || [])]
})

const photoRef = ref([])
const cropType = ref('pad')
</script>

<style>
.dark a {
  color: #a8dadc !important;
}

.dark a:visited {
  color: #6a4c93 !important;
}

.dark a:hover {
  color: #457b9d !important;
}

.dark a:focus {
  outline: 2px dotted #DADADA !important;
}

.dark a:active {
  color: #1d3557 !important;
}

button {
  border: none;
  border-radius: 3px;
  padding: 0.25rem 0.55rem;
  background: transparent;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dark button {
  border: none;
  color: #fff;
}
</style>