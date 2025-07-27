<template>
  <div
    class="min-h-screen bg-white dark:bg-black dark:text-white overflow-y-auto snap-y snap-mandatory xl:snap-proximity overflow-x-hidden"
  >
    <div class="max-w-6xl mx-auto px-4 lg:px-8 py-8 lg:py-16">
      <div
        class="photo-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center justify-center"
      >
        <div v-for="photo in photos" ref="photoRef" class="photo-container">
          <NuxtLink
            :to="`https://res.cloudinary.com/ejf/image/upload/t_ejf_photos_ig/${photo.public_id}`"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              :src="`https://res.cloudinary.com/ejf/image/upload/t_ejf_photos_ig/${photo.public_id}`"
              :alt="photo.public_id"
              class="cloudinary-img w-full h-auto rounded-sm transition-opacity hover:opacity-80"
            />
          </NuxtLink>
        </div>
      </div>

      <!-- Footer -->
      <div class="pt-16">
        <a href="https://ejfox.com" class="block w-28 h-28 opacity-30 mx-auto">
          <img
            src="/handdrawn__MadeWithLove.svg"
            class="dark:invert mx-auto"
            alt="Made with love"
          />
        </a>
      </div>
    </div>
  </div>
</template>
<script setup>
const numPhotos = ref(250);

const { data: photos } = await useFetch("/api/cloudinary", {
  method: "POST",
  body: JSON.stringify({
    numPhotos: numPhotos.value,
    onlyPhotoblog: true,
  }),
});
</script>
<style></style>
