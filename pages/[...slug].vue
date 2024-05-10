<template>
  <div class="min-h-screen pb-24">
    <NuxtLink
      class="w-32 block mx-auto text-center bg-gray-300 dark:bg-gray-800 dark:text-white px-3 py-1 rounded-sm my-8 text-sm"
      :to="`/`">Back</NuxtLink>

    <div class="lg:flex items-center justify-center">
      <div class="p-4 lg:px-24">
        <LibraryPhoto :id="`${photo.public_id}`" :key="photo.public_id" :photo="photo" />
      </div>

      <div class="lg:flex flex-col items-center lg:w-48 text-xs text-monospace">
        <div class="p-4 w-auto">
          <PhotoMetadata v-if="photo?.exifData" :photo="photo" />
        </div>

        <div v-if="photo?.exifData" ref="mapContainer" class="
        map-container
        flex flex-col items-center  w-full mt-16 lg:mt-32 lg:min-h-32 rounded-lg shadow-sm overflow-hidden relative">
          <div v-if="photo?.exifData?.GPSLatitude" class="flex flew-row items-center justify-center">
            <img class=""
              :src="`https://api.mapbox.com/styles/v1/ejfox/cl7p0rxav000o15p0dnsl8jen/static/${convertExifCoordinates(photo?.exifData.GPSLongitude, photo?.exifData.GPSLongitudeRef)},${convertExifCoordinates(photo?.exifData.GPSLatitude, photo?.exifData.GPSLatitudeRef)},4,0,0/${width}x${containerWidth}?access_token=pk.eyJ1IjoiZWpmb3giLCJhIjoiY2lyZjd0bXltMDA4b2dma3JzNnA0ajh1bSJ9.iCmlE7gmJubz2RtL4RFzIw`" />

            <img class=""
              :src="`https://api.mapbox.com/styles/v1/ejfox/cl7p0rxav000o15p0dnsl8jen/static/${convertExifCoordinates(photo?.exifData.GPSLongitude, photo?.exifData.GPSLongitudeRef)},${convertExifCoordinates(photo?.exifData.GPSLatitude, photo?.exifData.GPSLatitudeRef)},10,0,0/${width}x${containerWidth}?access_token=pk.eyJ1IjoiZWpmb3giLCJhIjoiY2lyZjd0bXltMDA4b2dma3JzNnA0ajh1bSJ9.iCmlE7gmJubz2RtL4RFzIw`" />

            <!-- write the lat/lng numbers big on top of both of the images -->
            <div class="absolute top-0 left-0 p-2 text-white w-full h-full flex flex-col items-center justify-center">
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

    <a href="https://ejfox.com" class="block p-2 lg:p-8 w-32 h-32 mx-auto">
      <img src="/handdrawn__MadeWithLove.svg" class="dark:invert mx-auto my-8 lg:my-32" alt="Made with love" />
    </a>
  </div>
</template>
<script setup>

const params = useRoute().params
const slug = ref(params.slug[0])

const mapContainer = ref(null)
const { width: containerWidth, height: containerHeight } = useElementSize(mapContainer)

const width = computed(() => {
  return Math.round(containerWidth.value * 0.5)
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

</script>