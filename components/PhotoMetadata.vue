<template>
  <div class="photo-metadata leading-6 px-4">
    <div class="exif-camera px-4" v-if="exifData">

      <blockquote class="px-4 py-4 image-caption text-2xl font-serif">
        {{ exifData?.caption }}
      </blockquote>

      <div class="uppercase tracking-widest md:flex justify-between items-center text-md">
        <div class="px-2  tracking-widest font-semibold leading-0">
          {{ exifData.date }}
        </div>
        <div class="px-2 inline-block">{{ exifData?.make }} {{ exifData?.model }}</div>
        <div class="px-2 inline-block">{{ exifData?.aperture }}</div>
        <div class="px-2 inline-block">{{ exifData?.focalLength }} lens</div>
        <div class="px-2 inline-block">{{ exifData?.exposure }} </div>
        <div class="px-2 inline-block">ISO {{ exifData?.iso }}</div>

      </div>

      <div class="">
        <div class="" v-if="exifData.model === 'X-Pro3'">
          <img src="/cam_xpro3.png" class=" mx-auto max-h-32 w-auto" />
        </div>

        <div class="" v-if="exifData.model === 'DSC-TX5'">
          <img src="/cam_cybershot.png" class=" mx-auto max-h-32 w-auto" />
        </div>
      </div>
    </div>

    <!-- <div class="max-h-screen overflow-y-auto text-xs monospace">
      <UTable :rows="exifAsRows" :columns="exifColumns" />
    </div> -->



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

const exifAsRows = computed(() => {
  if (!props.photo.exifData) return []
  const exifDataKeys = Object.keys(props.photo.exifData)
  return exifDataKeys.map(key => {
    return { key, value: props.photo.exifData[key] }
  })
})

const exifColumns = [
  { key: 'key', label: 'Key' },
  { key: 'value', label: 'Value' },
]

</script>

<style scoped></style>