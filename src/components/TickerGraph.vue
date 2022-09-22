<template>
  <section v-if="selectedTicker" class="relative">
    <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
      {{ selectedTicker.name }} - USD
    </h3>
    <div
      class="flex items-end border-gray-600 border-b border-l h-64"
      ref="graph"
    >
      <div
        v-for="(bar, idx) in normalizedGraph"
        :key="idx"
        :style="{ height: `${bar}%` }"
        class="bg-purple-800 border w-10"
      ></div>
    </div>
    <close-graph-button @click="$emit('close-graph')" />
  </section>
</template>

<script>
import CloseGraphButton from "@/components/CloseGraphButton";
export default {
  name: "TickerGraph",

  components: {
    CloseGraphButton,
  },

  props: {
    selectedTicker: {
      type: Object,
      required: false,
      default: null,
    },
    price: {
      type: Number,
      required: false,
    },
  },

  emits: {
    "close-graph": null,
  },

  data() {
    return {
      graph: [],
      maxGraphElements: 1,
    };
  },

  computed: {
    normalizedGraph() {
      const maxVal = Math.max(...this.graph);
      const minVal = Math.min(...this.graph);
      if (maxVal === minVal) {
        return this.graph.map(() => 50);
      }
      return this.graph.map(
        (price) => 5 + ((price - minVal) * 95) / (maxVal - minVal)
      );
    },
  },

  methods: {
    calculateMaxGraphElements() {
      if (this.$refs.graph) {
        this.maxGraphElements = this.$refs.graph.clientWidth / 38;
      }
    },
  },

  watch: {
    selectedTicker() {
      this.graph = [];
      this.$nextTick().then(this.calculateMaxGraphElements);
    },
    price() {
      this.graph.push(this.price);
      if (this.graph.length > this.maxGraphElements) {
        this.graph.shift();
      }
    },
  },

  mounted() {
    window.addEventListener("resize", this.calculateMaxGraphElements);
  },

  beforeUnmount() {
    window.removeEventListener("resize", this.calculateMaxGraphElements);
  },
};
</script>
