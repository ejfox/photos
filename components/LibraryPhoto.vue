<template>
  <div :class="['cursor-pointer transition-opacity duration-500', copied ? 'opacity-50' : 'opacity-100']">



    <img :src="cloudinaryThumb(imageUrl)" :alt="photo.public_id"
      class="cloudinary-img w-full h-auto border-2 border-black dark:border-white mx-auto my-0" />

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useClipboard } from '@vueuse/core'
import { toMercator } from '@turf/turf';

const props = defineProps({
  photo: Object,
  cropType: String
})

const cropType = toRef(props, 'cropType')
const { copy, copied } = useClipboard()
// const width = 1080
const width = ref(1080)
// const { width } = useWindowSize()
const isDark = useDark()
const exifData = ref(null)
const route = useRoute()

onMounted(() => {
  const { width: windowWidth } = useWindowSize()
  width.value = windowWidth.value
})



const exifAsRows = computed(() => {
  if (!props.photo.exifData) return []
  console.log(props.photo.exifData)
  const exifDataKeys = Object.keys(props.photo.exifData)
  return exifDataKeys.map(key => {
    return { key, value: props.photo.exifData[key] }
  })
})

const exifColumns = [
  { key: 'key', label: 'Key' },
  { key: 'value', label: 'Value' },
]

onActivated(() => {
  // Check if we already have EXIF data from the photo prop
  if (props.photo?.exifData) {
    exifData.value = props.photo.humanReadableExifData
    console.log('Using existing EXIF data:', exifData.value)
  }
  // Check if we have EXIF data from the API call
  else if (exifApiData.value) {
    exifData.value = exifApiData.value.humanReadableExifData
    console.log('Using API EXIF data:', exifData.value)
  }
  // If we don't have EXIF data and we're not on the home or admin page, fetch it
  else if (route.value?.path !== '/' && route.value?.path !== '/admin' && props.photo?.public_id) {
    console.log('Refreshing EXIF data for:', props.photo.public_id)
    exifApiData.value?.refresh?.()
  }
})

// make a computed that checks the photo tags for 'photo-blog'
const isPhotoBlog = computed(() => {
  return props.photo?.tags?.includes('photo-blog') || false
})

const imageBgColor = computed(() => {
  return isDark.value ? '000000' : 'FFFFFF'
})

const imageUrl = computed(() => {
  // if there is a .href value, use that
  if (props.photo.href) {
    return props.photo.href
  }
  // if there is a .secure_url value, use that
  if (props.photo.secure_url) {
    return props.photo.secure_url
  }
})

function cloudinaryThumb(rawHref) {
  if (!rawHref) return

  if (cropType.value === 'fill') {
    return rawHref.replace('upload/', `upload/g_object,c_fill,w_${width.value},h_${width.value},ar_1:1,z_1.5/`)
  }
  else if (cropType.value === 'pad') {
    return rawHref.replace('upload/', `upload/c_pad,w_${width.value},h_${width.value},b_rgb:${imageBgColor.value}/`)
  } else {
    return rawHref.replace('upload/', `upload/w_${width.value}/dpr_auto/`)
  }
}

const { data: exifApiData, pending: exifPending, error: exifError } = useAsyncData(
  () => {
    // Skip the API call if we don't have a valid photo object or public_id
    if (!props.photo || !props.photo.public_id) {
      console.log('Skipping EXIF fetch - no valid public_id')
      return Promise.resolve(null)
    }

    return $fetch('/api/cloudinary-exif', {
      method: 'POST',
      body: { resourceId: props.photo.public_id }
    }).catch(err => {
      console.error('Error fetching EXIF data:', err)
      return null
    })
  },
  {
    // Add a unique key based on the photo ID
    key: `exif-${props.photo?.public_id || 'unknown'}`,
    // Only run this on the client side
    server: false,
    // Don't immediately fetch on page load
    immediate: false
  }
)

// Only fetch EXIF data when the component is activated and we have a valid photo
onMounted(() => {
  if (props.photo?.public_id && route.value?.path !== '/' && route.value?.path !== '/admin') {
    exifApiData.value?.refresh?.()
  }
})

</script>

<style scoped>
/* img {
  max-height: 88vh;
  width: auto;
} */

.cloudinary-img {
  max-height: 88vh;
  width: auto;
  /* border: 0.5vw solid black; */
  /* border-width: 1.23vw; */
  border-width: 1.618vw;
}
</style>