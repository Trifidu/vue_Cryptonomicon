const API_KEY =
  "7309c65b2b656c488a622361227a4be71c7c1d9cd3bec92ec9d4020dcedc4a53";
const COINS_LIST =
  "https://min-api.cryptocompare.com/data/all/coinlist?summary=true";

const AGGREGATE_INDEX = "5";
const ERROR_MESSAGE = "500";
const USD = "USD";
const BTC = "BTC";

const tickersHandlers = new Map();
const socket = new WebSocket(
  `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
);

function listenToBTC() {
  subscribeToTickerOnWs(BTC, USD);
}
listenToBTC();

let BTCPrice;

socket.addEventListener("message", (e) => {
  const {
    TYPE: type,
    FROMSYMBOL: currency,
    PRICE: newPrice,
    TOSYMBOL: exchange,
  } = JSON.parse(e.data);

  if (type === ERROR_MESSAGE) {
    const brokenTicker = JSON.parse(e.data).PARAMETER.slice(9, -4);
    if (brokenTicker !== BTC) {
      subscribeToTickerOnWs(brokenTicker, BTC);
    }
  }

  if (type !== AGGREGATE_INDEX || !newPrice) {
    return;
  }

  if (type === AGGREGATE_INDEX) {
    if (exchange === USD && currency === BTC) {
      BTCPrice = newPrice;
    }
    writePrice(
      currency,
      exchange === BTC ? 1 / (1 / BTCPrice / newPrice) : newPrice
    );
  }
});

function writePrice(currency, newPrice) {
  const handlers = tickersHandlers.get(currency) ?? [];
  handlers.forEach((fn) => fn(newPrice));
}

function sendToWebSocket(message) {
  const stringifiedMsg = JSON.stringify(message);
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(stringifiedMsg);
    return;
  }

  socket.addEventListener("open", () => socket.send(stringifiedMsg), {
    once: true,
  });
}

function subscribeToTickerOnWs(ticker, exchange) {
  sendToWebSocket({
    action: "SubAdd",
    subs: [`5~CCCAGG~${ticker}~${exchange}`],
  });
}

function unsubscribeToTickerOnWs(ticker, exchange) {
  sendToWebSocket({
    action: "SubRemove",
    subs: [`5~CCCAGG~${ticker}~${exchange}`],
  });
}

export const subscribeToTicker = (ticker, cb) => {
  const subscribers = tickersHandlers.get(ticker) || [];
  tickersHandlers.set(ticker, [...subscribers, cb]);
  subscribeToTickerOnWs(ticker, USD);
};

export const unsubscribeFromTicker = (ticker) => {
  tickersHandlers.delete(ticker);
  unsubscribeToTickerOnWs(ticker, USD);
};

export const fetchCoinList = async function fetchCoinList() {
  const res = await fetch(COINS_LIST);
  const data = await res.json();
  return data.Data;
};
