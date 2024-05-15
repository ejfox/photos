<template>
  <div class="pb-8">

    <!-- we are gonna take the image and make it huge and in the background and very very blurry -->
    <div ref="bgImage"
      class="bg-image absolute top-0 left-0 w-full h-full bg-cover -z-10 blur-3xl bg-center bg-no-repeat opacity-25"
      :style="{
        backgroundImage: `url(${smallBgImage(photo?.secure_url)})`
      }"> </div>


    <!-- <NuxtLink class="w-32 block mx-auto text-center bg-gray-800 text-white px-3 py-1 rounded-sm my-8 text-sm" :to="`/`">
      Back</NuxtLink> -->
    <div class="pl-4 lg:pl-24">
      <UButton :to="`/#${photo?.public_id}`" class="mt-4 max-w-32 text-center block text-balance" color="white">Back to
        all photos
      </UButton>
    </div>

    <div class="">
      <div class="p-4 lg:px-24">
        <LibraryPhoto :id="`${photo.public_id}`" :key="photo.public_id" :photo="photo" />
      </div>

      <div class="lg:flex flex-col items-center text-xs text-monospace">
        <div class="p-4 lg:px-24 w-auto">
          <PhotoMetadata v-if="photo?.exifData" :photo="photo" />
        </div>

        <!-- map -->
        <div v-if="false" ref="mapContainer"
          class="
        map-container
        flex flex-col items-center  w-full mt-16 lg:mt-0 lg:min-h-32 rounded-lg shadow-sm overflow-hidden relative md:opacity-20 hover:opacity-100 transition-opacity duration-200">
          <div v-if="photo?.exifData?.GPSLatitude" class="flex flew-row">
            <img class="lg:brightness-125 lg:contrast-125 lg:opacity-50"
              :src="`https://api.mapbox.com/styles/v1/ejfox/${modeStyle}/static/${convertExifCoordinates(photo?.exifData.GPSLongitude, photo?.exifData.GPSLongitudeRef)},${convertExifCoordinates(photo?.exifData.GPSLatitude, photo?.exifData.GPSLatitudeRef)},4.5,0,0/${width}x${containerWidth}?access_token=pk.eyJ1IjoiZWpmb3giLCJhIjoiY2lyZjd0bXltMDA4b2dma3JzNnA0ajh1bSJ9.iCmlE7gmJubz2RtL4RFzIw`" />

            <!-- <img class="lg:brightness-125 lg:contrast-125 lg:opacity-50"
              :src="`https://api.mapbox.com/styles/v1/ejfox/${modeStyle}/static/${convertExifCoordinates(photo?.exifData.GPSLongitude, photo?.exifData.GPSLongitudeRef)},${convertExifCoordinates(photo?.exifData.GPSLatitude, photo?.exifData.GPSLatitudeRef)},10,0,0/${width}x${containerWidth}?access_token=pk.eyJ1IjoiZWpmb3giLCJhIjoiY2lyZjd0bXltMDA4b2dma3JzNnA0ajh1bSJ9.iCmlE7gmJubz2RtL4RFzIw`" /> -->

            <!-- write the lat/lng numbers big on top of both of the images -->
            <div
              class="coordinates absolute bottom-0 left-0 p-2 text-gray-700 dark:text-gray-300 w-full flex flex-col tracking-tighter leading-0 text-shadow-md">
              <span class="text-3xl lg:text-sm white:bg-white/10 dark:bg-black/20 rounded-sm">{{
        photo?.exifData.GPSLatitude }}
                {{ photo?.exifData.GPSLatitudeRef }}</span>
              <span class="text-3xl lg:text-sm">{{ photo?.exifData.GPSLongitude }}
                {{ photo?.exifData.GPSLongitudeRef }}
              </span>
            </div>

          </div>

        </div>
      </div>
    </div>

    <div class="px-12 lg:px-24">
      <a href="https://ejfox.com" class="block w-28 h-28  opacity-30 mx-auto">
        <img src="/handdrawn__MadeWithLove.svg" class="dark:invert mx-auto my-8 lg:my-32" alt="Made with love" />
      </a>
    </div>
  </div>
</template>
<script setup>
import { animate } from '~/anime.esm.js'
const isDark = useDark()
const params = useRoute().params
const slug = ref(params.slug[0])

const mapContainer = ref(null)
const { width: containerWidth, height: containerHeight } = useElementSize(mapContainer)

const width = computed(() => {
  // return Math.round(containerWidth.value * 0.5)
  return containerWidth.value
})

const modeStyle = computed(() => {
  console.log(isDark.value)
  return isDark.value ? 'cl7p0rxav000o15p0dnsl8jen' : 'cjsmod10v5ace1fqdn3ceptif'
})

const { data: photo } = await useFetch(`/api/cloudinary-exif`, {
  method: 'POST',
  body: JSON.stringify({ resourceId: slug.value })
})

function convertExifCoordinates(exifCoordinates, ref) {
  const [degrees, minutes, seconds] = exifCoordinates.split(', ').map(part => {
    const [numerator, denominator] = part.split('/').map(Number);
    return numerator / denominator;
  });

  const decimalDegrees = degrees + (minutes / 60) + (seconds / 3600);
  return ref === 'S' || ref === 'W' ? -decimalDegrees : decimalDegrees;
}




const bgImage = ref(null)

onActivated(() => {
  animate(bgImage.value, {
    opacity: [0, 1],
    duration: 1200,
    delay: 300,
    easing: 'easeOutQuad',
  })
})



function smallBgImage(rawHref) {
  if (!rawHref) return
  return rawHref.replace('upload/', `upload/w_200/dpr_auto/`)
}

</script>
<style>
.coordinates {
  text-shadow: 0 0 3px rgba(0, 0, 0, 0.21);
}


@media (prefers-color-scheme: dark) {
  .coordinates {
    text-shadow: 0 0 3px rgba(255, 255, 255, 0.21);
  }
}
</style>