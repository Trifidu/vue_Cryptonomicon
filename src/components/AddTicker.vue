<template>
  <section>
    <div class="flex">
      <div class="max-w-xs">
        <label for="wallet" class="block text-sm font-medium text-gray-700"
          >Тикер</label
        >
        <div class="mt-1 relative rounded-md shadow-md">
          <input
            v-model="ticker"
            @keydown.enter="add"
            @input="
              valid = true;
              predictCoin();
            "
            @click="valid = true"
            type="text"
            name="wallet"
            id="wallet"
            class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
            placeholder="Например DOGE"
          />
        </div>
        <div
          v-if="prediction.length > 0 && ticker.trim().length > 0"
          class="flex bg-white shadow-md p-1 rounded-md flex-wrap"
        >
          <span
            @click="predictionClickHandler(predictedCoin.Symbol)"
            v-for="predictedCoin in prediction"
            :key="predictedCoin.id"
            class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
          >
            {{ predictedCoin.Symbol }}
          </span>
        </div>

        <div v-if="!valid" class="text-sm text-red-600">
          {{ errMessage }}
        </div>
      </div>
    </div>
    <add-ticker-button
      @click="add"
      type="button"
      class="my-4"
      :disabled="disabled"
    />
  </section>
</template>

<script>
import { fetchCoinList } from "@/api";
import AddTickerButton from "@/components/AddTickerButton";
export default {
  name: "AddTicker",

  components: {
    AddTickerButton,
  },

  data() {
    return {
      ticker: "",
      prediction: [],
      valid: true,
      errMessage: "",
      coins: {},
      loaded: false,
    };
  },

  props: {
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    tickers: {
      type: Array,
      required: true,
    },
  },

  emits: {
    "add-ticker": (value) => {
      if (typeof value === "object" && value.name.length > 0) {
        return true;
      } else {
        console.warn("Invalid emit on add-ticker");
      }
    },
    "load-page": (value) =>
      typeof value === "boolean"
        ? true
        : console.warn("Invalid emit on load-page"),
  },

  created() {
    this.fetchCoinList();
  },

  methods: {
    add() {
      const currentTicker = {
        name: this.ticker.trim().toUpperCase(),
        price: "-",
      };
      if (currentTicker.name.trim().length > 0) {
        if (!this.tickers.find((item) => item.name === currentTicker.name)) {
          this.$emit("add-ticker", currentTicker);
          this.ticker = "";
        } else {
          this.valid = false;
          this.errMessage = "Такой тикер уже добавлен";
        }
      } else {
        this.valid = false;
        this.errMessage = "Нельзя добавить пустой тикер";
      }
    },

    predictCoin() {
      const target = this.ticker;
      const predict = [];
      for (let coin in this.coins) {
        if (
          this.coins[coin]?.FullName.toLowerCase().includes(
            target.toLowerCase()
          ) ||
          this[coin]?.Symbol.toUpperCase().includes(target.toUpperCase())
        ) {
          predict.push(this.coins[coin]);
        }
      }
      this.prediction = predict.reverse().slice(0, 5);
    },

    predictionClickHandler(coin) {
      if (!this.disabled) {
        this.ticker = coin;
        this.add();
      }
    },

    async fetchCoinList() {
      fetchCoinList().then((data) => {
        this.loaded = true;
        this.$emit("load-page", this.loaded);
        this.coins = data;
      });
    },
  },
};
</script>
<style scoped></style>
