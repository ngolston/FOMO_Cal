// script to handle API calls and data transfer
//Current Price for crypto selection logic.
var optionEl= document.querySelector("select")
var localQueryUrl= "https://api.coinpaprika.com/v1/coins/"
var submitCrypto = document.getElementById("submit-crypto")
var submitStock = document.getElementById("submit-stock")
var container = document.querySelector('#results');
var dateEl= document.getElementById("search-date")
var investBox= document.querySelector("#invest")
var disableSearch = submitCrypto.disabled= true
var disableStockSearch = submitStock.disabled= true
var validDate= true
var cryptoSelect =document.querySelector("#select-crypto")
var selectStock=document.querySelector("#select-stock")
//function to get current price of crypto
function currentPrice(){
removeAllChildNodes(container)
fetch(localQueryUrl)
  .then(function(response){
   return response.json()
  }).then(function(data){
  displayText(data)
  return data
  
      }) 
}
//Removing the price info if there is a previous price result present 
function removeAllChildNodes(parent){
parent.removeChild(parent.firstChild)
}

// Crypto drop down conversion to ID for coinpaprika call
// Taking Coin dropdown and converting it to coin ID for query 
var coinToID = {
  'Bitcoin (BTC)': 'btc-bitcoin',
  'Ethereum (ETH)': 'eth-ethereum',
  'Tether (USDT)': 'usdt-tether',
  'Cardano (ADA)': 'ada-cardano',
  'Binance Coin (BNB)': 'bnb-binance-coin',
  'XRP (XRP)': 'xrp-xrp',
  'Solana (SOL)': 'sol-solana',
  'USD Coin (USDC)': 'usdc-usd-coin',
  'Polkadot (DOT)': 'dot-polkadot',
  'Dogecoin (DOGE)':'doge-dogecoin',
  }

///event listener on submit crypto button
function callCryptoAPI() {
  let searchValue= cryptoSelect.value;
  let searchDate = dateEl.value;

  let queryDate= moment(searchDate).format().split("T")[0]

  // Calculating interval between points to call coinpaprika over
  let startMoment = moment(searchDate,'YYYY-MM-DD');
  let endMoment = moment();
  let interval = determineInterval(startMoment.format('mm-dd-yyyy'),endMoment.format('mm-dd-yyyy'));

  // Historical chart data api url
  let historicalUrl = "https://api.coinpaprika.com/v1/tickers/"+coinToID[searchValue]+"/historical?start=" + queryDate + "&interval="+interval+"d";

  // Current price data api url
  let currentUrl= "https://api.coinpaprika.com/v1/coins/" +coinToID[searchValue] +"/markets";

  // Long series of .then calls to make sure that both historical and current price data are passed to the charting functions
  fetch(historicalUrl)
    .then(function(historicalResponse){
    return historicalResponse.json()
    }).then(function(historical){
      fetch(currentUrl)
        .then(function(response){
          return response.json()
        }).then(function(data){
          calcAndChart(searchValue,data[0].quotes.USD.price,historical,'coin');
          getTweet();
        }) 
    })
}


submitCrypto.addEventListener("click",callCryptoAPI);

dateEl.addEventListener("change",function(){
  var today=moment().format().split("T")[0]
  var searchDate= dateEl.value
  var searchDate= moment(searchDate).format()
  var queryDate= searchDate.split("T")[0]
  if (queryDate > today){
    validDate= false
  } 
  else {
    validDate=true
  }
  enableSearch()
  errorMessage()
})
//Disabling button if info is missing 

//validating the value in the investment box is not a variation of 0 or null
var investZero= true
function investVal(){
  let investNumber = Number(investBox.value.replace(/[^0-9\.-]+/g,""))
  if (investBox.value==""||investNumber==0){
    investZero = true
  } else {
    investZero=false
  }
  enableSearch()
}

//function to enable/disable search button
function enableSearch() {
  if (dateEl.value.length != "0" && investZero===false && validDate===true && (cryptoSelect.value !=""||selectStock.value !="")){
    document.querySelector("#submit-crypto").disabled=false 
    document.querySelector("#submit-stock").disabled=false 
  } else {
    document.querySelector("#submit-crypto").disabled=true
    document.querySelector("#submit-stock").disabled=true
  }
}

//error message for invalid date 
function errorMessage() {
  if (validDate== false)
  {
    document.querySelector("#error").innerHTML = "<span style='color: red;'>"+ "Please enter valid date"
  } else {
    document.querySelector("#error").innerHTML =""
  }
}

selectStock.addEventListener("blur",enableSearch)
investBox.addEventListener("keyup",investVal)
investBox.addEventListener("keydown",enableSearch)
investBox.addEventListener("blur",enableSearch)
cryptoSelect.addEventListener("change",enableSearch)
