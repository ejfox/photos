<template>
  <div class="p-24">
    <NuxtLink :to="`/`">Back</NuxtLink>

    <LibraryPhoto :id="`${photo.public_id}`" :cropType="'pad'" :key="photo.public_id" :photo="photo" />

  </div>
</template>
<script setup>

const params = useRoute().params
const slug = ref(params.slug[0])

const { data: photo } = await useFetch(`/api/cloudinary-exif`, {
  method: 'POST',
  body: JSON.stringify({ resourceId: slug.value })
})
</script>