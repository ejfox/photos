<template>
  <div
    class="dark:bg-black dark:text-white h-screen overflow-y-auto snap-y snap-mandatory xl:snap-proximity overflow-x-hidden">

    <div class="photo-list flex flex-wrap p-2 lg:px-4 items-center justify-left">
      <div v-for="photo in photos" ref="photoRef" class="photo-container bg-white dark:bg-black p-4">
        <NuxtLink :to="`https://res.cloudinary.com/ejf/image/upload/t_ejfoxphotos-springsummer204/${photo.public_id}`">
          <!-- <LibraryPhoto :id="`${photo.public_id}`" :key="photo.public_id" :photo="photo" class="" /> -->

          <!-- https://res.cloudinary.com/ejf/image/upload/t_ejfoxphotos-springsummer204/cld-sample.jpg -->

          <img :src="`https://res.cloudinary.com/ejf/image/upload/t_ejfoxphotos-springsummer204/${photo.public_id}`"
            :alt="photo.public_id" class="cloudinary-img  mx-auto my-0 h-96 w-auto rounded-sm" />
        </NuxtLink>
      </div>

      <a href="https://ejfox.com" class="block p-2 lg:p-8">
        <img src="/handdrawn__MadeWithLove.svg" class="dark:invert mx-auto my-8 lg:my-32" alt="Made with love" />
      </a>

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



</script>
<style></style>