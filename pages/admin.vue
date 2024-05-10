<template>
  <div class="dark:bg-black dark:text-white">
    <div>
      <div class="flex flex-wrap p-2 lg:p-4">
        <div v-for="photo in photos" ref="photoRef" class="w-1/3 flex-item p-0 lg:p-1">
          <NuxtLink :to="`/${photo?.public_id}`">View</NuxtLink>
          <LibraryPhoto :id="`${photo.public_id}`" :key="photo.public_id" :photo="photo" />

          <button v-if="photoBlogPresentMap[photo.public_id]" @click="removePhotoblogTag(photo)"
            class="rounded-sm mt-2 px-4 py-2 bg-blue-500 text-white">
            Remove from Photo Blog
          </button>

          <button v-else @click="markForPhotoBlog(photo)" class="rounded-sm mt-2 px-4 py-2 bg-gray-500 text-white">
            Add to Photo Blog
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const numPhotos = ref(250)

const { data: photos } = await useFetch('/api/cloudinary', {
  method: 'POST',
  body: JSON.stringify({ numPhotos: numPhotos.value })
})

const photoRef = ref([])

const photoBlogPresentMap = ref({})

// watch(photos, (newPhotos) => {
//   if (newPhotos.length === 0) return
//   newPhotos.forEach((photo) => {
//     photoBlogPresentMap.value[photo.public_id] = photo.tags.includes('photo-blog')
//   })
// })

async function markForPhotoBlog(photo) {
  console.log('Marking photo for photo blog:', photo.public_id)
  try {
    const { result: data, success } = await $fetch('/api/cloudinary-add-tag', {
      method: 'POST',
      body: {
        resourceId: photo.public_id,
        tag: 'photo-blog',
      },
    })

    console.log(data, success)

    if (success) {
      // photoBlogPresentMap.value[photo.public_id] = true // Update addedToPhotoblog after successful API response
      // this is not reactive because we are not overwriting the object, we are just updating the value of the key
      // so we will overwrite the object with the new value instead
      photoBlogPresentMap.value = {
        ...photoBlogPresentMap.value,
        [photo.public_id]: true,
      }
    } else {
      console.error('Error marking photo for photo blog:', data)
    }
  } catch (err) {
    console.error('Error marking photo for photo blog:', err)
  }
}

async function removePhotoblogTag(photo) {
  console.log('Removing photo from photo blog:', photo.public_id)
  const { result: data, success } = await $fetch('/api/cloudinary-remove-tag', {
    method: 'POST',
    body: {
      resourceId: photo.public_id,
      tag: 'photo-blog',
    },
  })

  console.log(data)

  if (success) {
    photoBlogPresentMap.value = {
      ...photoBlogPresentMap.value,
      [photo.public_id]: false,
    }
  } else {
    console.error('Error removing photo from photo blog:', data)
  }
}
</script>