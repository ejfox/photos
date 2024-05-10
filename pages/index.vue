<template>
  <div
    class="dark:bg-black dark:text-white h-screen overflow-y-auto snap-y snap-mandatory xl:snap-proximity overflow-x-hidden py-8 lg:py-24">

    <div class="photo-list flex flex-wrap px-2 lg:px-4">
      <div v-for="photo in photos" ref="photoRef"
        class="photo-container mx-auto snap-start snap-always bg-white dark:bg-black overflow-hidden"
        :style="randomizedPhotoStyle(photo)">
        <NuxtLink :to="`/${photo?.public_id}`">
          <LibraryPhoto :id="`${photo.public_id}`" :key="photo.public_id" :photo="photo" class="" />
        </NuxtLink>
      </div>

      <a href="https://ejfox.com" class="block p-2 lg:p-8">
        <img src="/handdrawn__MadeWithLove.svg" class="dark:invert mx-auto my-8 lg:my-32" alt="Made with love" />
      </a>

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

  const maxOffsetY = 26
  const maxOffsetX = 12
  const maxAngle = 2

  // we can do a much better job with chance.js
  const randomAngle = chance.integer({ min: -maxAngle, max: maxAngle })
  const randomX = chance.floating({ min: -maxOffsetX, max: maxOffsetX })
  const randomY = chance.floating({ min: -maxOffsetY, max: maxOffsetY })
  const scale = chance.floating({ min: 0.96, max: 1.072 })
  // console.log({ randomAngle, randomX, randomY })

  const skewZ = chance.floating({ min: -maxAngle * 0.5, max: maxAngle * 0.5 })
  if (chance.bool({ likelihood: 0.2 })) return {}
  if (chance.bool({ likelihood: 0.1 })) return {
    transform: `rotate(${randomAngle}deg) skew(${skewZ}deg)`,
  }
  return {
    // transform: `rotate(${randomAngle}deg) skew(${skewZ}deg)`,
    // transform: `rotate(${randomAngle}deg)`, // no skew no translate
    // transform: `translate(${randomX}px, ${randomY}px) rotate(${randomAngle}deg)`,
    transform: `translate(${randomX}px, ${randomY}px) rotate(${randomAngle}deg) scale(${scale})`,
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

.photo-container:active {
  transform: rotate(0deg) scale(1.01) !important;
  /* transform: scale(1.005) !important; */
}


/* invert the z-index of the photo-list children */
.photo-list>* {
  z-index: 1;
}

/* invert the z-index of the photo-list children */
.photo-list>*:nth-child(odd) {
  z-index: 2;
}
</style>