<template>
  <div class="dark:bg-black dark:text-white">

    <div class="flex flex-wrap p-2 lg:p-4">
      <div v-for="photo in photos" ref="photoRef" class="w-1/3 flex-item p-0 lg:p-1">
        <LibraryPhoto :photo="photo" :cropType="cropType" />
      </div>
    </div>

    <div>
      <!-- make a v-model dropdown for cropOptions -->
      <select v-model="cropType" class="p-2">
        <option v-for="option in cropOptions" :selected="option.value === cropType" :value="option.value">{{ option.label
        }}</option>
      </select>
    </div>

  </div>
</template>
<script setup>

const { data: photos } = await useFetch('/api/only-latest-photos')

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