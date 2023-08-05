<template>
  <div class="cf pa5">
    <h1>hello world</h1>
    <div v-for="photo in photos"
      class="w-third fl"
      >
      <div>
        <img :src="cloudinaryThumb(photo.href)" :alt="photo.service_id">
      </div>
    </div>
  </div>
</template>
<script setup>
const { data: photos } = await useFetch('/api/latest-photos')

function cloudinaryThumb(rawHref) {
  return rawHref.replace('upload/', 'upload/w_300/')
}

</script>
