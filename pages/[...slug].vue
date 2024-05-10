<template>
  <div class="p-4 lg:px-24 min-h-screen pb-24">
    <NuxtLink
      class="w-32 block mx-auto text-center bg-gray-300 dark:bg-gray-800 dark:text-white px-3 py-1 rounded-sm my-8 text-sm"
      :to="`/`">Back</NuxtLink>

    <div class="flex items-center justify-center">
      <LibraryPhoto :id="`${photo.public_id}`" :key="photo.public_id" :photo="photo" />

      <div class="flex flex-col items-center w-48 p-8 text-xs text-monospace">
        <PhotoMetadata v-if="photo?.exifData" :photo="photo" />

        <div v-if="photo?.exifData" class="flex flex-col items-center  w-full h-32">
          <div v-if="photo?.exifData?.GPSLatitude">

            <!-- <img class="rounded-lg shadow-sm w-auto h-auto"
              :src="`https://api.mapbox.com/styles/v1/ejfox/cl7p0rxav000o15p0dnsl8jen/static/${photoLng},${photoLat},8,0,0/400x300?access_token=pk.eyJ1IjoiZWpmb3giLCJhIjoiY2lyZjd0bXltMDA4b2dma3JzNnA0ajh1bSJ9.iCmlE7gmJubz2RtL4RFzIw`" /> -->

            <!-- finally, generate the image -->

            <img class="rounded-lg shadow-sm w-auto h-auto"
              :src="`https://api.mapbox.com/styles/v1/ejfox/cl7p0rxav000o15p0dnsl8jen/static/${convertExifCoordinates(photo?.exifData.GPSLongitude, photo?.exifData.GPSLongitudeRef)},${convertExifCoordinates(photo?.exifData.GPSLatitude, photo?.exifData.GPSLatitudeRef)},10,0,0/200x150?access_token=pk.eyJ1IjoiZWpmb3giLCJhIjoiY2lyZjd0bXltMDA4b2dma3JzNnA0ajh1bSJ9.iCmlE7gmJubz2RtL4RFzIw`" />

          </div>

        </div>
      </div>
    </div>

  </div>
</template>
<script setup>

const params = useRoute().params
const slug = ref(params.slug[0])

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