<template>
  <div
    class="dark:bg-black dark:text-white h-screen overflow-y-auto snap-y xl:snap-proximity overflow-x-hidden py-8 lg:py-32 mb-12">

    <a href="https://ejfox.com" class="block p-2 lg:p-8 mx-auto max-w-96 snap-center">
      <img src="/handdrawn__MadeWithLove.svg" class="dark:invert mx-auto my-8 lg:my-32" alt="Made with love" />
    </a>

    <div class="photo-list flex flex-wrap px-2 lg:px-4">
      <div v-for="photo in photos" ref="photoRef"
        class="photo-container rounded-sm mx-auto snap-start snap-always py-12 lg:py-16 relative"
        :style="randomizedPhotoStyle(photo)" :id="`photo-${photo.public_id}`">
        <NuxtLink :to="`/${photo?.public_id}`" class=" overflow-hidden">
          <LibraryPhoto :key="photo.public_id" :photo="photo" class="" />
          <!-- date metadata -->
          <div class="text-right text-xs text-gray-300 dark:text-gray-700/50 font-mono tracking-widest font-light">
            {{ formatDate(photo.created_at) }}
          </div>
        </NuxtLink>
      </div>



    </div>
  </div>
</template>
<script setup>
//import chance js
import Chance from 'chance'
import dayjs from 'dayjs';
import 'dayjs/locale/en'; // or any other locale you prefer

const route = useRoute()
const photoRef = ref([])
const numPhotos = ref(250)

// when the route changes, if it has a hash, scroll to that element
onMounted(async () => {
  await nextTick()
  if (route.hash) {
    scrollToHash()
  }
})

// watch the route hash and when it changes scroll to that element
watch(() => route.hash, scrollToHash, { immediate: true })

async function scrollToHash() {
  const fileName = JSON.parse(JSON.stringify(route.hash)).replace('#photo-', '')

  // find the photoRef with the ID of the hash
  const el = photoRef.value.find(photo => {
    // get the ID of the attribute
    const id = photo.getAttribute('id')
    return id === `photo-${fileName}`
  })
  if (el) {
    // await new Promise(resolve => setTimeout(resolve, 250))
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

function formatDate(date) {
  // return dayjs(date).locale('en').format('MMMM D, YYYY');
  return dayjs(date).locale('en').format('YYYY-MM-DD');
}



const { data: photos } = await useFetch('/api/cloudinary', {
  method: 'POST',
  body: JSON.stringify({
    numPhotos: numPhotos.value,
    onlyPhotoblog: true
  })
})



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
  const maxAngle = 2.5

  // we can do a much better job with chance.js
  const randomAngle = chance.integer({ min: -maxAngle, max: maxAngle })
  const randomX = chance.floating({ min: -maxOffsetX, max: maxOffsetX })
  const randomY = chance.floating({ min: -maxOffsetY, max: maxOffsetY })
  const scale = chance.floating({ min: 0.92, max: 1 })
  // console.log({ randomAngle, randomX, randomY })

  const skewZ = chance.floating({ min: -maxAngle * 0.5, max: maxAngle * 0.5 })
  if (chance.bool({ likelihood: 0.333 })) return {}
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
  /* border-width: 1.2em; */
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


/* makes the photos overlap more like a stack of photos */
.photo-list>* {
  z-index: 1;
}

.photo-list>*:nth-child(odd) {
  z-index: 2;
}
</style>