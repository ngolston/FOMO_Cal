// historical-data
var submitStock = document.getElementById("submit-stock");
var stockTicker = {
  "Amazon (AMZN)": "AMZN",
  "Netflix (NFLX)": "NFLX",
  "Google (GOOG)": "GOOG",
  "Tesla (TSLA)": "TSLA",
  "Apple (AAPL)": "AAPL",
  "Intel (INTC)": "INTC",
  "Ford (F)": "F",
  "Gamestop (GME)": "GME",
  "Nvidia (NVDA)": "NVDA",
  "AMC (AMC)": "AMC",
};
var stockSelect = document.querySelector("#select-stock");

// Implement user input, waiting for stock drop down list
// Call StockAPI on submit button press
function callStockAPI() {
  var stockSearch = stockSelect.value;
  // Getting user and current dates as unix timestamps
  let startUnix = moment(document.getElementById("search-date").value).unix();
  let endUnix = moment().unix();

  // yh-finance api call through rapidapi || This is limited usage
  let stockUrl =
    "https://yh-finance.p.rapidapi.com/stock/v2/get-chart?symbol=" +
    stockTicker[stockSearch] +
    "&interval=1d&period1=" +
    startUnix +
    "&period2=" +
    endUnix +
    "&region=US";

  // Cal yh-finance api historical chart api and send data to chart plotting functions
  fetch(stockUrl, {
    method: "GET",
    headers: {
      "x-rapidapi-host": "yh-finance.p.rapidapi.com",
      "x-rapidapi-key": "2625609fbbmsh1ab11cfed49a49ep1710a2jsn112afe2b2d0c",
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      let chartLen = data.chart.result[0].indicators.quote[0].length;
      calcAndChart(
        stockSearch,
        data.chart.result[0].indicators.quote[0].high[chartLen - 1],
        data,
        "stock"
      );
    })
    .catch((err) => {
      // console.error(err);
    });
}

submitStock.addEventListener("click", callStockAPI);
