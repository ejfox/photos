<template>
  <nav
    class="sticky top-0 z-50 bg-white/90 dark:bg-black/90 backdrop-blur-sm border-b border-black/10 dark:border-white/10">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center justify-center gap-6 p-4 text-sm font-mono">
        <NuxtLink to="/"
          class="text-black hover:opacity-60 dark:text-white dark:hover:opacity-60 transition-opacity duration-200">
          Photos
        </NuxtLink>
        <span class="select-none text-black/30 dark:text-white/30">/</span>
        <NuxtLink to="/archive"
          class="text-black hover:opacity-60 dark:text-white dark:hover:opacity-60 transition-opacity duration-200">
          Archives
        </NuxtLink>
        <span class="select-none text-black/30 dark:text-white/30">/</span>
        <NuxtLink to="/stats"
          class="text-black hover:opacity-60 dark:text-white dark:hover:opacity-60 transition-opacity duration-200">
          Stats
        </NuxtLink>
        <span class="select-none text-black/30 dark:text-white/30">/</span>
        <a href="/rss.xml"
          class="text-black hover:opacity-60 dark:text-white dark:hover:opacity-60 transition-opacity duration-200 flex items-center gap-1">
          <svg class="w-2.5 h-2.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M6 5c7.18 0 13 5.82 13 13M6 11a7 7 0 017 7m-6 0a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
          <span>RSS</span>
        </a>
      </div>
    </div>
  </nav>
</template>

<style scoped>
a {
  text-decoration: none;
}
</style>