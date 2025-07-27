<template>
  <div ref="container" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import * as d3 from "d3";
import { onMounted, watch } from "vue";
import { useElementSize, usePreferredDark } from "@vueuse/core";

const props = defineProps<{
  dates: string[];
  contributions: number[];
}>();

const container = ref<HTMLElement>();
const { width } = useElementSize(container);
const isDark = usePreferredDark();

const CELL_SIZE = 10;
const CELL_PADDING = 2;
const WEEK_DAYS = 7;
const WEEKS = 53;

// Color scale for contributions
const colorScale = computed(() => {
  const maxContributions = Math.max(...props.contributions);
  return d3
    .scaleSequential()
    .domain([0, maxContributions])
    .interpolator(isDark.value ? d3.interpolateBlues : d3.interpolateYlOrRd);
});

// Format date for tooltip
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const drawCalendar = () => {
  if (!container.value || !width.value) return;

  // Clear previous SVG
  d3.select(container.value).selectAll("svg").remove();

  const height = (CELL_SIZE + CELL_PADDING) * WEEK_DAYS;

  // Create SVG
  const svg = d3
    .select(container.value)
    .append("svg")
    .attr("width", width.value)
    .attr("height", height)
    .attr("viewBox", `0 0 ${width.value} ${height}`)
    .attr("class", "overflow-visible");

  // Create tooltip
  const tooltip = d3
    .select(container.value)
    .append("div")
    .attr(
      "class",
      "absolute hidden bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 p-2 rounded text-sm pointer-events-none transform -translate-y-full",
    );

  // Create cells
  const cells = svg
    .selectAll("rect")
    .data(props.dates)
    .enter()
    .append("rect")
    .attr("width", CELL_SIZE)
    .attr("height", CELL_SIZE)
    .attr("rx", 2)
    .attr("ry", 2)
    .attr("x", (_d: string, i: number) => {
      const week = Math.floor(i / 7);
      return week * (CELL_SIZE + CELL_PADDING);
    })
    .attr("y", (d: string) => {
      const date = new Date(d);
      return date.getDay() * (CELL_SIZE + CELL_PADDING);
    })
    .attr("fill", (_d: string, i: number) =>
      colorScale.value(props.contributions[i]),
    )
    .attr("class", "transition-colors duration-200");

  // Add hover effects
  cells
    .on("mouseover", (event: MouseEvent, d: string) => {
      const i = props.dates.indexOf(d);
      const contributions = props.contributions[i];

      tooltip
        .html(`${formatDate(d)}<br>${contributions} photos`)
        .style("left", `${event.pageX}px`)
        .style("top", `${event.pageY}px`)
        .classed("hidden", false);
    })
    .on("mouseout", () => {
      tooltip.classed("hidden", true);
    });

  // Add month labels
  const months = Array.from(
    new Set(
      props.dates.map((d) => {
        const date = new Date(d);
        return date.toLocaleDateString("en-US", { month: "short" });
      }),
    ),
  );

  svg
    .selectAll(".month-label")
    .data(months)
    .enter()
    .append("text")
    .text((d: string) => d)
    .attr("class", "text-xs fill-current text-gray-500 dark:text-gray-400")
    .attr("x", (_d: string, i: number) => i * (CELL_SIZE + CELL_PADDING) * 4.3)
    .attr("y", -5);
};

// Draw calendar on mount and when width or dark mode changes
onMounted(drawCalendar);
watch(
  [width, isDark, () => props.dates, () => props.contributions],
  drawCalendar,
);
</script>

<style scoped>
.contribution-calendar rect:hover {
  stroke: currentColor;
  stroke-width: 1px;
}
</style>
