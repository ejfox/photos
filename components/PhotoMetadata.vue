<template>
  <div class="photo-metadata">
    <div class="exif-camera" v-if="exifData">
      <div v-if="exifData.model === 'X-Pro3'">
        <img src="/cam_xpro3.png" class="w-full h-auto" />
      </div>

      <div v-if="exifData.model === 'DSC-TX5'">
        <img src="/cam_cybershot.png" class="w-full h-auto" />
      </div>
    </div>
    <div>
      <div class="px-2 inline-block">{{ exifData?.make }} {{ exifData?.model }}</div>
      <div class="px-2 inline-block">{{ exifData?.aperture }}</div>
      <div class="px-2 inline-block">{{ exifData?.focalLength }}</div>
      <div class="px-2 inline-block">{{ exifData?.exposure }} </div>
      <div class="px-2 inline-block">ISO {{ exifData?.iso }}</div>
      <div class="px-2 my-2 inline-block text-xs tracking-widest">
        {{ exifData.date }}
      </div>
    </div>


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

</script>

<style scoped></style>