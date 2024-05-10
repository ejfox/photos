<template>
  <div :class="['cursor-pointer transition-opacity duration-500', copied ? 'opacity-50' : 'opacity-100']">



    <img :src="cloudinaryThumb(imageUrl)" :alt="photo.public_id"
      class="w-full h-auto border-black dark:border-white border-8 mx-auto" />

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
  // console.log(props.photo.exifData)
  if (props.photo.exifData) {
    exifData.value = props.photo.humanReadableExifData
    console.log(exifData.value)
  } else {
    // make sure we aren't on /
    if (route.value?.path !== '/' && !props.photo.exifData && route.value?.path !== '/admin') {
      // fetchExifData()
    }
  }
})

// make a computed that checks the photo tags for 'photo-blog'
const isPhotoBlog = computed(() => {
  return data.value.tags.includes('photo-blog')
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
const { data, pending, error, refresh } = useAsyncData(async () => {
  return await fetch('/api/cloudinary-exif', {
    method: 'POST',
    body: JSON.stringify({ resourceId: props.photo.public_id })
  })
})

</script>

<style scoped>
img {
  max-height: 90vh;
  width: auto;
}
</style>