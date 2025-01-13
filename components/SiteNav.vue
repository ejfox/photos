<template>
  <nav
    class="sticky top-0 backdrop-blur-lg bg-white/80 dark:bg-black/80 border-b border-gray-100 dark:border-gray-900 z-50">
    <div class="max-w-7xl mx-auto">
      <div class="flex items-center justify-center gap-8 p-6 text-sm font-mono tracking-tight">
        <NuxtLink to="/" class="text-gray-800 dark:text-gray-200 hover:opacity-80 transition-opacity no-underline">
          Photos
        </NuxtLink>
        <NuxtLink to="/archive"
          class="text-gray-800 dark:text-gray-200 hover:opacity-80 transition-opacity no-underline">
          Archives
        </NuxtLink>
        <NuxtLink to="/stats" class="text-gray-800 dark:text-gray-200 hover:opacity-80 transition-opacity no-underline">
          Stats
        </NuxtLink>
        <a href="/rss.xml"
          class="text-gray-800 dark:text-gray-200 hover:opacity-80 transition-opacity no-underline flex items-center gap-2">
          <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
          RSS
        </a>
      </div>
    </div>
  </nav>
</template>

<style scoped>
/* Additional safety to prevent link color inheritance */
a,
a:visited {
  color: inherit;
}
</style>