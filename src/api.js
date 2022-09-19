const API_KEY =
  "7309c65b2b656c488a622361227a4be71c7c1d9cd3bec92ec9d4020dcedc4a53";
const baseUrl = "https://min-api.cryptocompare.com/data/";

const tickersHandlers = new Map();
//TODO: Refactor to use URLSeachParams
const loadTickers = () => {
  if (tickersHandlers.size === 0) {
    return;
  }

  fetch(
    `${baseUrl}pricemulti?fsyms=${[...tickersHandlers.keys()].join(
      ","
    )}&tsyms=USD&api_key=${API_KEY}}`
  )
    .then((r) => r.json())
    .then((rawData) => {
      const updatedPrices = Object.fromEntries(
        Object.entries(rawData).map(([key, value]) => [key, value.USD])
      );

      Object.entries(updatedPrices).forEach(([currency, newPrice]) => {
        const handlers = tickersHandlers.get(currency) ?? [];
        handlers.forEach((fn) => fn(newPrice));
      });
    });
};

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
};

setInterval(loadTickers, 5000);
