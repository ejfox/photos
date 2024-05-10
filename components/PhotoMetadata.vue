<template>
  <div class="photo-metadata">
    <div class="exif-camera" v-if="exifData">
      <div v-if="exifData.model === 'X-Pro3'">
        <img src="/cam_xpro3.png" class="h-16 w-auto" />
      </div>

      <div v-if="exifData.model === 'DSC-TX5'">
        <img src="/cam_cybershot.png" class="h-16 w-auto" />
      </div>
    </div>
    <div>{{ exifData?.make }} {{ exifData?.model }}</div>
    <div>{{ exifData?.aperture }} f/{{ exifData?.focalLength }}</div>
    <div>{{ exifData?.exposure }} at ISO {{ exifData?.iso }}</div>
    <!-- <div>{{ exifData.date }}</div> -->
    <!-- <div>{{ formatDateTime(exifData.date) }}</div> -->

  </div>
</template>

<script setup>
const props = defineProps({
  photo: Object
})

const exifData = computed(() => {
  if (!props.photo.humanReadableExifData) return null
  return props.photo.humanReadableExifData
})

// // photo date time comes in like "2023:08:13 15:52:37"
// function formatDateTime(exifDateTime) {
//   // we want to parse it into a more readable format
//   const [date, time] = exifDateTime.split(' ')
//   const [year, month, day] = date.split(':')
//   const [hour, minute, second] = time.split(':')
//   // then we want to return something like YYYY-MM-DD H:Mam/pm
//   return `${year}-${month}-${day} ${hour}:${minute}${hour > 12 ? 'pm' : 'am'}`
// }

</script>

<style scoped></style>