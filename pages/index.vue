<template>
  <div class="dark:bg-black dark:text-white h-screen overflow-y-auto snap-y snap-mandatory xl:snap-proximity">

    <div class="flex flex-wrap px-2 lg:px-4 ">
      <div v-for="photo in photos" ref="photoRef" class="photo-container mx-auto shadow-lg snap-start snap-always"
        :style="randomizedPhotoStyle(photo)">
        <NuxtLink :to="`/${photo?.public_id}`">
          <LibraryPhoto :id="`${photo.public_id}`" :key="photo.public_id" :photo="photo" class="" />
        </NuxtLink>
      </div>

    </div>



  </div>
</template>
<script setup>
//import chance js
import Chance from 'chance'

const numPhotos = ref(250)


const { data: photos } = await useFetch('/api/cloudinary', {
  method: 'POST',
  body: JSON.stringify({
    numPhotos: numPhotos.value,
    onlyPhotoblog: true
  })
})

const photoRef = ref([])

function randomizedPhotoStyle(photo) {
  const chance = new Chance()
  // we want to pretend we are throwing these photos down on a table
  // so they kinda rotate and move around a bit randomly
  // we are returning a style object that will be applied to the photo div
  // const randomAngle = Math.floor(Math.random() * 360 * 0.025)
  // const randomX = Math.floor(Math.random() * 100)
  // const randomY = Math.floor(Math.random() * 100)  

  const maxOffset = 24
  const maxAngle = 1.33

  // we can do a much better job with chance.js
  const randomAngle = chance.floating({ min: -maxAngle, max: maxAngle })
  const randomX = chance.integer({ min: -maxOffset, max: maxOffset })
  const randomY = chance.integer({ min: -maxOffset, max: maxOffset })

  const skewZ = chance.floating({ min: -maxAngle * 0.5, max: maxAngle * 0.5 })
  return {
    // transform: `rotate(${randomAngle}deg) skew(${skewZ}deg)`,
    // transform: `rotate(${randomAngle}deg)`, // no skew no translate
    transform: `translate(${randomX}px, ${randomY}px) rotate(${randomAngle}deg)`,

  }
}
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

.photo-container {
  transition: all 1200ms cubic-bezier(0.16, 1, 0.3, 1);
}

.photo-container:hover {
  /* transform: rotate(0deg) scale(1) !important; */
  /* transform: scale(1.005) !important; */
}
</style>