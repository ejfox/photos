<template>
  <div class="dark:bg-black dark:text-white">

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-2 lg:p-4">
      <div v-for="photo in photos" ref="photoRef" class="flex-item p-0 lg:p-1">
        <LibraryPhoto :photo="photo" :cropType="cropType" />
        <!-- <pre>{{photo}}</pre> -->
      </div>
    </div>
  </div>
</template>
<script setup>
const filterScreenshots = ref(true)


const { data: photos } = await useFetch('/api/cloudinary', {
  method: 'POST',
  body: JSON.stringify({ 
    filterOutScreenshots: false, 
    onlyScreenshots: true 
  })
})

const photoRef = ref([])

const cropType = ref('pad')

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