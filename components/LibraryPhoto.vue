<template>
  <div @click="fetchExifData"
    :class="['cursor-pointer transition-opacity duration-500', copied ? 'opacity-50' : 'opacity-100']">
    <img :src="cloudinaryThumb(photo.href)" :alt="photo.public_id" />
    <!-- <pre v-if="exifData" class="overflow-auto text-xs monospace">{{ exifData }}</pre> -->
    <div v-if="exifData">

      <!--

      We need a beautiful metadata display for the exif data:

      {
        "exposure": "1/500",
        "aperture": "f/5.6",
        "focalLength": "23 mm",
        "iso": "800",
        "make": "FUJIFILM",
        "model": "X-Pro3",
        "date": "2023:08:12 17:19:50",
        "orientation": "6"
      }

    -->
      <div class="photo-metadata">
        <div>{{ exifData.make }} {{ exifData.model }}</div>
        <div>{{ exifData.aperture }} f/{{ exifData.focalLength }}</div>
        <div>{{ exifData.exposure }} at ISO {{ exifData.iso }}</div>
        <div>{{ exifData.date }}</div>

      </div>

      <div v-if="exifData.model === 'X-Pro3'">
        <img src="/cam_xpro3.png" class="h-16 w-auto" />
      </div>

      <div v-if="exifData.model === 'DSC-TX5'">
        <img src="/cam_cybershot.png" class="h-16 w-auto" />
      </div>
    </div>

    <pre class="h-32 w-full overflow-auto text-xs monospace">{{ photo }}</pre>

    <!-- <button @click="markForPhotoBlog"
      :class="['rounded-sm mt-2 px-4 py-2', photo.tags && photo.tags.includes('photo-blog') ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white']">
      {{ photo.tags && photo.tags.includes('photo-blog') ? 'Remove from Photo Blog' : 'Add to Photo Blog' }}
    </button> -->

    <button v-if="photo.tags && photo.tags.includes('photo-blog')" @click="removePhotoblogTag"
      class="rounded-sm mt-2 px-4 py-2 bg-blue-500 text-white">
      Remove from Photo Blog
    </button>

    <button v-else @click="markForPhotoBlog" class="rounded-sm mt-2 px-4 py-2 bg-gray-500 text-white">
      Add to Photo Blog
    </button>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useClipboard } from '@vueuse/core'

const props = defineProps({
  photo: Object,
  cropType: String
})

const cropType = toRef(props, 'cropType')
const { copy, copied } = useClipboard()
const width = 1080
const isDark = useDark()
const exifData = ref(null)

const imageBgColor = computed(() => {
  return isDark.value ? '000000' : 'FFFFFF'
})

function cloudinaryThumb(rawHref) {
  if (!rawHref) return

  if (cropType.value === 'fill') {
    return rawHref.replace('upload/', `upload/g_object,c_fill,w_${width},h_${width},ar_1:1,z_1.5/`)
  }
  else if (cropType.value === 'pad') {
    return rawHref.replace('upload/', `upload/c_pad,w_${width},h_${width},b_rgb:${imageBgColor.value}/`)
  } else {
    return rawHref.replace('upload/', `upload/c_fill,w_${width},h_${width}/`)
  }
}

async function fetchExifData() {
  console.log('fetching EXIF data for:', props.photo.public_id)
  try {
    const { data, pending, error, refresh } = await useFetch('/api/cloudinary-exif', {
      method: 'POST',
      body: { resourceId: props.photo.public_id },
    })

    console.log('fetchExifData:', data.value, pending.value, error.value)

    if (error.value) {
      console.error('Error fetching EXIF data:', error.value)
      exifData.value = 'Error fetching EXIF data'
    } else if (data.value) {
      exifData.value = data.value.humanReadableExifData || 'No EXIF data available'
    }
  } catch (err) {
    console.error('Error fetching EXIF data:', err)
    exifData.value = 'Error fetching EXIF data'
  }
}

async function markForPhotoBlog() {
  console.log('Marking photo for photo blog:', props.photo.public_id)
  try {
    const { data, pending, error, refresh } = await useFetch('/api/cloudinary-add-tag', {
      method: 'POST',
      body: {
        resourceId: props.photo.public_id,
        tag: 'photo-blog',
      },
    })

    if (error.value) {
      console.error('Error marking photo for photo blog:', error.value)
    } else if (data.value && data.value.success) {
      // Update the photo metadata in the component
      props.photo.metadata = data.value.result.metadata
    }
  } catch (err) {
    console.error('Error marking photo for photo blog:', err)
  }
}

async function removePhotoblogTag() {
  console.log('Removing photo from photo blog:', props.photo.public_id)
  try {
    const { data, pending, error, refresh } = await useFetch('/api/cloudinary-remove-tag', {
      method: 'POST',
      body: {
        resourceId: props.photo.public_id,
        tag: 'photo-blog',
      },
    })

    if (error.value) {
      console.error('Error removing photo from photo blog:', error.value)
    } else if (data.value && data.value.success) {
      // Update the photo metadata in the component
      props.photo.metadata = data.value.result.metadata
    }
  } catch (err) {
    console.error('Error removing photo from photo blog:', err)
  }
}
</script>

<style scoped></style>