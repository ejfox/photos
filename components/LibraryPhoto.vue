<template>
  <div @click="copy(`![${photo.public_id}](${photo.href})`)"
    :class="['cursor-pointer transition-opacity duration-500', copied ? 'opacity-50' : 'opacity-100']">
    <img :src="cloudinaryThumb(photo.href)" :alt="photo.public_id" />
    <!-- <pre class="overflow-auto text-xs monospace">{{photo}}</pre> -->
  </div>
</template>

<script setup>
// get the window width
// const { width } = useWindowSize()
import { useParentElement } from '@vueuse/core'

const props = defineProps({
  photo: Object,
  cropType: String
})

const cropType = toRef(props, 'cropType')

const { copy, copied } = useClipboard()

// const parentEl = useParentElement()
// const { width } = useElementSize(parentEl)

// const breakPoints = [
//   300,
//   900,
//   1080,
//   2160,
//   3840,
// ]

const width = 1080

const isDark = useDark()

const imageBgColor = computed(() => {
  return isDark.value ? '000000' : 'FFFFFF'
})

function cloudinaryThumb(rawHref) {
  if (!rawHref) return
  // return rawHref.replace('upload/', `upload/w_${breakpointImageWidth.value}/`)

  if (cropType.value === 'fill') {
    return rawHref.replace('upload/', `upload/g_object,c_fill,w_${width},h_${width},ar_1:1,z_1.5/`)
  }
  else if (cropType.value === 'pad') {
    return rawHref.replace('upload/', `upload/c_pad,w_${width},h_${width},b_rgb:${imageBgColor.value}/`)
  } else {
    return rawHref.replace('upload/', `upload/c_fill,w_${width},h_${width}/`)
  }

}
</script>

<style scoped></style>