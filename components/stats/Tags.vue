<template>
    <div class="treemap-wrapper">
        <div v-if="currentFocus" class="breadcrumb">
            <button @click="resetFocus">All Tags</button>
            <span>→ {{ currentFocus }}</span>
        </div>
        <div ref="container" class="treemap-container">
            <div
                v-for="item in treemapData"
                :key="item.data[0]"
                class="treemap-item"
                :style="{
                    left: `${item.x0}px`,
                    top: `${item.y0}px`,
                    width: `${item.x1 - item.x0}px`,
                    height: `${item.y1 - item.y0}px`,
                    backgroundColor: item.color,
                }"
                @click="focusOnItem(item.data)"
                @mouseenter="showTooltip($event, item.data)"
                @mouseleave="hideTooltip">
                <span v-if="item.x1 - item.x0 > 60 && item.y1 - item.y0 > 40" class="treemap-label">
                    <span class="tag-name">{{ item.data[0] }}</span>
                    <span class="tag-count">{{ item.data[1] }}</span>
                </span>
            </div>

            <!-- Tooltip -->
            <div
                v-show="tooltip.show"
                class="tooltip"
                :style="{
                    left: `${tooltip.x}px`,
                    top: `${tooltip.y}px`,
                }">
                <div>{{ tooltip.text }}</div>
                <div>Count: {{ tooltip.count }}</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import * as d3 from 'd3';
import { computed, onMounted, ref, watch } from 'vue';

const props = defineProps<{
    data: [string, number][];
}>();

const container = ref<HTMLElement | null>(null);
const treemapData = ref<any[]>([]);
const currentFocus = ref<string | null>(null);
const colorMap = ref<Map<string, string>>(new Map());

const tooltip = ref({
    show: false,
    text: '',
    count: 0,
    x: 0,
    y: 0,
});

const filteredData = computed(() => {
    if (!currentFocus.value) return props.data;
    const focusItem = props.data.find(([name]) => name === currentFocus.value);
    if (!focusItem) return props.data;
    const focusValue = focusItem[1];

    // Get filtered items and rescale their values relative to focus item
    return props.data
        .filter(([_, value]) => value <= focusValue)
        .map(([name, value]) => {
            // Scale the value to be relative to the focus item (0-100%)
            const scaledValue = (value / focusValue) * focusValue;
            return [name, scaledValue] as [string, number];
        });
});

const getColor = (key: string) => {
    if (!colorMap.value.has(key)) {
        const hue = Math.random() * 360;
        // Changed color generation to use darker colors with lower lightness and higher saturation
        colorMap.value.set(key, `hsl(${hue}, 50%, 45%)`);
    }
    return colorMap.value.get(key)!;
};

const showTooltip = (event: MouseEvent, data: [string, number]) => {
    tooltip.value = {
        show: true,
        text: data[0],
        count: data[1],
        x: event.pageX + 10,
        y: event.pageY + 10,
    };
};

const hideTooltip = () => {
    tooltip.value.show = false;
};

const updateTreemap = () => {
    if (!container.value) return;
    const width = container.value.offsetWidth;
    const height = container.value.offsetHeight;

    const hierarchy = d3.hierarchy({ children: filteredData.value }).sum((d) => d[1]);

    const treemap = d3.treemap().size([width, height]).padding(2).round(true);

    const root = treemap(hierarchy);

    treemapData.value = root.leaves().map((leaf) => ({
        ...leaf,
        color: getColor(leaf.data[0]),
    }));
};

const focusOnItem = (item: [string, number]) => {
    // Don't allow focusing on already focused item
    if (currentFocus.value === item[0]) return;
    currentFocus.value = item[0];
};

const resetFocus = () => {
    currentFocus.value = null;
};

onMounted(updateTreemap);
watch(() => props.data, updateTreemap);
watch(currentFocus, updateTreemap);

if (import.meta.client) {
    window.addEventListener('resize', updateTreemap);
}
</script>

<style scoped>
.treemap-wrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
}

.breadcrumb {
    padding: 10px;
    background: hsl(var(--background));
    margin-bottom: 10px;
    border-radius: 4px;
}

.breadcrumb button {
    color: hsl(var(--accent-foreground));
    border: 1px solid hsl(var(--accent));
    padding: 5px 10px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.breadcrumb button:hover {
    background-color: hsl(var(--accent));
}

.breadcrumb span {
    margin-left: 10px;
    color: hsl(var(--accent-foreground));
    text-transform: capitalize;
}

.treemap-container {
    flex-grow: 1;
    position: relative;
}

.treemap-item {
    position: absolute;
    overflow: hidden;
    border-radius: 4px;
    transition: all 0.3s ease;
    cursor: pointer;
    text-transform: capitalize;
}

.treemap-item:hover {
    filter: brightness(1.2);
}

.treemap-label {
    padding: 8px;
    font-size: 14px;
    color: rgba(255, 255, 255, 0.9);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    text-align: center;
}

.tag-name {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
}

.tag-count {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
}

.tooltip {
    position: fixed;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px;
    border-radius: 4px;
    font-size: 14px;
    pointer-events: none;
    z-index: 1000;
    text-transform: capitalize;
}
</style>
