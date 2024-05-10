<template>
  <div :class="['cursor-pointer transition-opacity duration-500', copied ? 'opacity-50' : 'opacity-100']">



    <img :src="cloudinaryThumb(imageUrl)" :alt="photo.public_id" />
    <!-- <pre v-if="exifData" class="overflow-auto text-xs monospace">{{ exifData }}</pre> -->
    <div v-if="exifData">

      <!-- if we have GPSLatitude and GPSLongitude, display a map -->
      <div v-if="photo.exifData.GPSLatitude && photo.exifData.GPSLongitude">
        {{ photoLat }}, {{ photoLng }}

        <!-- 
        https://api.maptiler.com/maps/streets/static/6.0288,44.3408,3/400x300.png?key=YOUR_MAPTILER_API_KEY

        key = r7rxV4ywyVD4sm1dYKUl
       -->
        <!-- <img
          :src="`https://api.maptiler.com/maps/streets/static/${convertRationalToDecimal(photo.exifData.GPSLatitude)},${convertRationalToDecimal(photo.exifData.GPSLongitude)},3/400x300.png?key=ruILo1e1JzVMEE7ciRe4`" /> -->

        <!-- mapbox access token: pk.eyJ1IjoiZWpmb3giLCJhIjoiY2lyZjd0bXltMDA4b2dma3JzNnA0ajh1bSJ9.iCmlE7gmJubz2RtL4RFzIw 
        
        style url: mapbox://styles/ejfox/cl7p0rxav000o15p0dnsl8jen
      
      -->

        <img class="rounded-lg shadow-sm w-auto h-auto"
          :src="`https://api.mapbox.com/styles/v1/ejfox/cl7p0rxav000o15p0dnsl8jen/static/${photoLng},${photoLat},8,0,0/400x300?access_token=pk.eyJ1IjoiZWpmb3giLCJhIjoiY2lyZjd0bXltMDA4b2dma3JzNnA0ajh1bSJ9.iCmlE7gmJubz2RtL4RFzIw`" />
      </div>

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
        <div class="exif-camera">
          <div v-if="exifData.model === 'X-Pro3'">
            <img src="/cam_xpro3.png" class="h-16 w-auto" />
          </div>

          <div v-if="exifData.model === 'DSC-TX5'">
            <img src="/cam_cybershot.png" class="h-16 w-auto" />
          </div>
        </div>
        <div>{{ exifData.make }} {{ exifData.model }}</div>
        <div>{{ exifData.aperture }} f/{{ exifData.focalLength }}</div>
        <div>{{ exifData.exposure }} at ISO {{ exifData.iso }}</div>
        <div>{{ exifData.date }}</div>

      </div>


    </div>

    <!-- <pre class="h-32 w-full overflow-auto text-xs monospace">{{ photo.exifData }}</pre> -->

    <div v-if="photo?.exifData" class="max-h-96 overflow-y-auto">
      <UTable :rows="exifAsRows" :columns="exifColumns" />
    </div>

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
const width = 1080
const isDark = useDark()
const exifData = ref(null)
const route = useRoute()


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
    return rawHref.replace('upload/', `upload/g_object,c_fill,w_${width},h_${width},ar_1:1,z_1.5/`)
  }
  else if (cropType.value === 'pad') {
    return rawHref.replace('upload/', `upload/c_pad,w_${width},h_${width},b_rgb:${imageBgColor.value}/`)
  } else {
    return rawHref.replace('upload/', `upload/w_${width}/dpr_auto/`)
  }
}

// const { data, pending, error, refresh } = await useFetch('/api/cloudinary-exif', {
//   lazy: true,
//   method: 'POST',
//   body: { resourceId: props.photo.public_id },
// })

// use useAsyncData instead
const { data, pending, error, refresh } = useAsyncData(async () => {
  return await fetch('/api/cloudinary-exif', {
    method: 'POST',
    body: JSON.stringify({ resourceId: props.photo.public_id })
  })
})

// async function fetchExifData() {
//   await refresh()
//   console.log('fetching EXIF data for:', props.photo.public_id)
//   try {


//     console.log('fetchExifData:', data.value, pending.value, error.value)

//     if (error.value) {
//       console.error('Error fetching EXIF data:', error.value)
//       exifData.value = 'Error fetching EXIF data'
//     } else if (data.value) {
//       exifData.value = data.value.humanReadableExifData || 'No EXIF data available'
//     }
//   } catch (err) {
//     console.error('Error fetching EXIF data:', err)
//     exifData.value = 'Error fetching EXIF data'
//   }
// }

function convertExifCoordinates(exifCoordinates, ref) {
  const [degrees, minutes, seconds] = exifCoordinates.split(', ').map(part => {
    const [numerator, denominator] = part.split('/').map(Number);
    return numerator / denominator;
  });

  const decimalDegrees = degrees + (minutes / 60) + (seconds / 3600);
  return ref === 'S' || ref === 'W' ? -decimalDegrees : decimalDegrees;
}

const photoLat = computed(() => {
  if (props.photo.exifData.GPSLatitude && props.photo.exifData.GPSLatitudeRef) {
    return convertExifCoordinates(props.photo.exifData.GPSLatitude, props.photo.exifData.GPSLatitudeRef);
  }
});

const photoLng = computed(() => {
  if (props.photo.exifData.GPSLongitude && props.photo.exifData.GPSLongitudeRef) {
    return convertExifCoordinates(props.photo.exifData.GPSLongitude, props.photo.exifData.GPSLongitudeRef);
  }
});
</script>

<style scoped></style>