<template>
  <div class="dark:bg-black dark:text-white min-h-screen">

    <div class="flex flex-wrap p-2 lg:p-4">
      <div v-for="photo in photos" ref="photoRef" class="p-4">
        <NuxtLink :to="`/${photo?.public_id}`">View</NuxtLink>
        <LibraryPhoto :id="`${photo.public_id}`" :key="photo.public_id" :photo="photo" />
      </div>

    </div>



  </div>
</template>
<script setup>
const numPhotos = ref(250)


const { data: photos } = await useFetch('/api/cloudinary', {
  method: 'POST',
  body: JSON.stringify({
    numPhotos: numPhotos.value,
    onlyPhotoblog: true
  })
})

const photoRef = ref([])

const cropType = ref('fill')

const cropOptions = [
  { label: 'fill', value: 'fill' },
  { label: 'pad', value: 'pad' }
]


</script>
<style>
.dark a {
  color: #a8dadc !important;
  /* Light links for dark mode */
}

.dark a:visited {
  color: #6a4c93 !important;
  /* Purple for visited links, for dark mode */
}

.dark a:hover {
  color: #457b9d !important;
  /* Dark Blue for hovered links, for dark mode */
}

.dark a:focus {
  outline: 2px dotted #DADADA !important;
  /* Outline for keyboard users */
}

.dark a:active {
  color: #1d3557 !important;
  /* Darker blue color for active links in dark mode */
}

/* make an extremely simple, minimal button */
button {
  /* border: 1px solid #ccc; */
  border: none;
  border-radius: 3px;
  padding: 0.25rem 0.55rem;
  background: transparent;
  color: #333;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* and for dark mode */

.dark button {
  /* border-color: #fff; */
  border: none;
  color: #fff;
}
</style>