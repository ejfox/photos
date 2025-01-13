<template>
  <div>
    <SiteNav />
    <NuxtPage />
  </div>
</template>

<script setup>
</script>

<style>
.text-monospace {
  font-family: 'Fira Code', monospace;
}

/* Aggressive link style reset */
:root {
  --link-color: inherit;
}

a,
a:link,
a:visited,
a:hover,
a:active {
  color: var(--link-color) !important;
  text-decoration: none !important;
}

/* Remove default purple from webkit browsers */
:any-link {
  color: var(--link-color);
}

/* Firefox specific reset */
@-moz-document url-prefix() {
  a:visited {
    color: var(--link-color) !important;
  }
}
</style>