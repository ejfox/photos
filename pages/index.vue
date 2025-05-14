<template>
  <div
    class="dark:bg-black dark:text-white snap-y xl:snap-proximity overflow-x-hidden py-4 md:py-8 lg:py-32 mb-4 md:mb-8 lg:mb-12"
  >
    <div class="flex flex-col items-center gap-3 mb-8">
      <!-- Keyboard navigation indicator -->
      <div
        class="text-xs font-mono text-gray-500 dark:text-gray-400 flex items-center gap-3"
      >
        <span class="flex items-center gap-1">
          <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">←</kbd>
          <span>prev</span>
        </span>
        <span class="flex items-center gap-1">
          <kbd class="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">→</kbd>
          <span>next</span>
        </span>
      </div>
    </div>

    <div class="photo-list flex flex-wrap px-2 lg:px-4">
      <div
        v-for="(photo, idx) in photos"
        ref="photoRef"
        :class="[
          'photo-container rounded-sm mx-auto snap-start snap-always py-12 lg:py-16 relative transition-opacity ease-out duration-1000',
          visibleIndices.has(idx) ? 'opacity-100' : 'opacity-0',
        ]"
        :style="randomizedPhotoStyle(photo)"
        :id="`photo-${photo.public_id}`"
      >
        <NuxtLink
          :to="`/${photo?.public_id}`"
          class="overflow-hidden"
          :data-photo-id="photo.public_id"
          @click="storePhotoState(photo.public_id)"
        >
          <LibraryPhoto :key="photo.public_id" :photo="photo" class="" />
          <!-- date metadata -->
          <div
            class="text-right text-xs text-gray-300 dark:text-gray-700/50 font-mono tracking-widest font-light"
          >
            {{ formatDate(photo.created_at) }}
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Footer row: photos by EJ Fox + SVG -->
    <div
      class="flex flex-col items-center justify-center gap-2 py-4 lg:flex-row lg:justify-center lg:items-center lg:gap-4"
    >
      <span class="font-mono text-xs text-gray-500 dark:text-gray-400"
        >photos by EJ Fox</span
      >
      <img
        src="/handdrawn__MadeWithLove.svg"
        class="dark:invert h-6"
        alt="Made with love"
      />
    </div>

    <!-- Fixed navigation at bottom -->
    <div class="fixed bottom-0 left-0 right-0 z-50">
      <SiteNav />
    </div>
  </div>
</template>
<script setup>
//import chance js
import Chance from "chance";
import dayjs from "dayjs";
import "dayjs/locale/en"; // or any other locale you prefer
import { useIntersectionObserver } from "@vueuse/core";

const route = useRoute();
const photoRef = ref([]);
const currentIndex = ref(0); // Track current photo index directly
const visibleIndices = ref(new Set()); // Track which photos have entered the viewport

// set bodyAttrs to black/white depending on dark mode
const isDark = useDark();

useHead({
  bodyAttrs: {
    class: isDark.value ? "bg-black" : "",
  },
});

// Set up keyboard navigation when component is mounted
onMounted(() => {
  // Add keyboard event listener
  window.addEventListener("keydown", handleKeyDown);

  // If there's a hash, find that photo
  if (route.hash) {
    const id = route.hash.replace("#photo-", "");
    const index = photos.value?.findIndex((p) => p.public_id === id) || 0;
    if (index >= 0) {
      currentIndex.value = index;
      // Wait for DOM to be ready
      nextTick(() => {
        scrollToCurrentPhoto();
      });
    }
  }

  // Restore scroll position if coming back from detail view
  const id = sessionStorage.getItem("lastPhotoId");
  const scroll = sessionStorage.getItem("lastScroll");
  if (id && scroll) {
    const el = document.querySelector(`[data-photo-id="${id}"]`);
    if (el) el.scrollIntoView({ behavior: "auto", block: "center" });
    window.scrollTo(0, Number(scroll));
    sessionStorage.removeItem("lastPhotoId");
    sessionStorage.removeItem("lastScroll");
  }

  // Set up fade-in intersection observers once DOM is ready
  nextTick(() => {
    photoRef.value.forEach((el, idx) => {
      if (!el) return;
      useIntersectionObserver(
        el,
        ([entry]) => {
          if (entry.isIntersecting) {
            // Mark as seen for fade-in
            visibleIndices.value.add(idx);
            // Update active index for keyboard nav
            currentIndex.value = idx;
          }
        },
        {
          threshold: 0.6, // more than half visible counts as active
        },
      );
    });
  });
});

// Clean up event listener when component is unmounted
onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
});

// Handle keyboard navigation - extremely simple version
function handleKeyDown(e) {
  if (e.key === "ArrowRight") {
    e.preventDefault();
    // Only increment if not at the end
    if (currentIndex.value < (photos.value?.length || 0) - 1) {
      currentIndex.value++;
      scrollToCurrentPhoto();
    }
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    // Only decrement if not at the beginning
    if (currentIndex.value > 0) {
      currentIndex.value--;
      scrollToCurrentPhoto();
    }
  }
}

// Scroll to the current photo
function scrollToCurrentPhoto() {
  if (!photoRef.value || photoRef.value.length === 0) return;

  const el = photoRef.value[currentIndex.value];
  if (el) {
    // Get the current photo's public_id
    const currentPhoto = photos.value?.[currentIndex.value];
    if (currentPhoto?.public_id) {
      // Update the URL hash without triggering a page reload
      const newHash = `photo-${currentPhoto.public_id}`;
      if (window.location.hash !== `#${newHash}`) {
        window.history.replaceState(null, "", `#${newHash}`);
      }
    }

    // Scroll to the element
    el.scrollIntoView({ behavior: "smooth" });
  }
}

function formatDate(date) {
  return dayjs(date).locale("en").format("YYYY-MM-DD");
}

const { data: photos } = await useFetch("/api/cloudinary", {
  method: "POST",
  body: {
    filterOutScreenshots: true,
    onlyPhotoblog: true,
    numPhotos: 1000,
    includeContext: true,
    includeTags: true,
  },
});

function randomizedPhotoStyle(photo) {
  const chance = new Chance();
  // we want to pretend we are throwing these photos down on a table
  // so they kinda rotate and move around a bit randomly
  // we are returning a style object that will be applied to the photo div
  // const randomAngle = Math.floor(Math.random() * 360 * 0.025)
  // const randomX = Math.floor(Math.random() * 100)
  // const randomY = Math.floor(Math.random() * 100)

  const maxOffsetY = 6;
  const maxOffsetX = 2;
  const maxAngle = 1.5;

  // we can do a much better job with chance.js
  const randomAngle = chance.integer({ min: -maxAngle, max: maxAngle });
  const randomX = chance.floating({ min: -maxOffsetX, max: maxOffsetX });
  const randomY = chance.floating({ min: -maxOffsetY, max: maxOffsetY });
  const scale = chance.floating({ min: 0.89, max: 1 });
  // console.log({ randomAngle, randomX, randomY })

  // 33% of the time, its normal
  if (chance.bool({ likelihood: 0.333 })) return {};

  return {
    // transform: `rotate(${randomAngle}deg) skew(${skewZ}deg)`,
    // transform: `rotate(${randomAngle}deg)`, // no skew no translate
    // transform: `translate(${randomX}px, ${randomY}px) rotate(${randomAngle}deg)`,
    transform: `translate(${randomX}px, ${randomY}px) rotate(${randomAngle}deg) scale(${scale})`,
  };
}

function storePhotoState(id) {
  sessionStorage.setItem("lastPhotoId", id);
  sessionStorage.setItem("lastScroll", window.scrollY);
}

useHead({
  title: "EJ Fox Photography",
  meta: [
    {
      name: "description",
      content:
        "A collection of photographs by EJ Fox - capturing moments in NYC and beyond.",
    },
    { property: "og:title", content: "EJ Fox Photography" },
    {
      property: "og:description",
      content:
        "A collection of photographs by EJ Fox - capturing moments in NYC and beyond.",
    },
    { property: "og:type", content: "website" },
    { property: "og:image", content: photos.value?.[0]?.secure_url || "" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:site", content: "@mrejfox" },
    { name: "twitter:creator", content: "@mrejfox" },
  ],
  link: [{ rel: "canonical", href: "https://photos.ejfox.com" }],
});
</script>
<style>
/* Remove dark mode link overrides */
.photo-container {
  transition: all 1200ms cubic-bezier(0.16, 1, 0.3, 1);
}

/* makes the photos overlap more like a stack of photos */
.photo-list > * {
  z-index: 1;
}

.photo-list > *:nth-child(odd) {
  z-index: 2;
}
</style>
