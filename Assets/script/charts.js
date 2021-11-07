var investEl = document.querySelector("#invest");
var tickerChart; // Main chart for historical price data

// Card elements for output data
var infoMain = document.querySelector("#info-main div");
var infoPast = document.querySelector("#info-past div");
var infoChange = document.querySelector("#info-change div");
var infoCurrent = document.querySelector("#info-current div");
var infoChart = document.querySelector("#info-chart div");
var infoTwitter = document.querySelector("#info-twitter div");

// Wrapper function to accept api call data and run displayTicker and displayCalcs
function calcAndChart(name,currentPrice,historicalData,type) {

  // Extract data from expected API output format based on if type = 'stock' or 'coin'
  values = extractData(historicalData,currentPrice,type);

  // If current price was not defined in the api call functions, approximate it from the last historical value
  if (currentPrice === undefined) {
    currentPrice = values.prices[values.prices.length-1]
  }

  // Show tweet box if type=='coin'
  infoTwitter.setAttribute('style',type === 'coin'?'display:block;':'display:none;');

  // Create and display historical price chart function call
  displayTicker(values,name,type);

  // Calculate and populate output cards function call
  displayCalcs(values,currentPrice,name);
}


// Creating chart of historic stock or coin values
function displayTicker(values,name,type) {
  
  if (tickerChart) {
    tickerChart.destroy();
  }

  let times = values.times;
  let prices = values.prices;

  // let timeSpan = times[times.length-1]
  let tickUnits;

  if (times[times.length-1].diff(times[0],'years') >= 3) {
    tickUnits = "year";
  } else if (times[times.length-1].diff(times[0],'months') >= 3) {
    tickUnits = "month";
  } else {
    tickUnits = "day";
  }

  // Generate Chart Title
  let chartTitle = `${name} Price History`;

  // Chart.js implemented plots
  let chartData = {
    labels: times,
    datasets: [{
      label: name + ' Price History',
      backgroundColor: 'rgb(255, 99, 132)',
      borderColor: 'rgb(255, 99, 132)',
      data: prices,
    }]
  };
  
  // Chart configuration data
  let config = {
    type: 'line',
    data: chartData,
    options: {
      responsive: true,
      
      plugins: {
        title: {
          display: true,
          text: chartTitle
        },
        legend: {
          display: false
        },
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: tickUnits,
          },
        },
        yAxes: {
          ticks: {
            beginAtZero: true,
            // Include a dollar sign in the ticks
            // format decimal places of y-ticks based on maximum value of whole output
            callback: function(value, index, values) {
              let maxValue = Math.max(...values.map(value => value.value));
              if (maxValue > 99.99) {
                return '$' + value.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              } else if (maxValue > .01) {
                return '$' + value.toFixed(2)
              } else {
                return '$' + value;
              }
            }
          }
        }
      }
    },
  };

  // Create chart
  tickerChart = new Chart(
    document.querySelector("#stock-canvas"),
    config
  );

}


// Calculating potential earnings and adding to output cards
function displayCalcs(values,currentPrice,name) {

  // pull list of times and prices from extracted data
  let times = values.times;
  let prices = values.prices;

  // Calculating the final investment value
  // Perhaps change to price difference (You would have made $__)
  let investAmount = extractInvestment(); 
  let result = (investAmount) * (currentPrice/prices[0]) - investAmount;

  verb = (result >= 0) ? "made" : "lost";

  // Historical day is not precisely as input, workaround: assume first historic point and user input date values are similar
  // TODO: functionality for if a user selects a date before the coin was available
  let queryDate = moment(document.getElementById("search-date").value).format('MMMM Do, YYYY');

  // Removing children from info cards
  clearCards();

  // Displaying to infoMain: primary FOMO calculation and result sentence
  infoMain.textContent = `If you had bought ${formatPrice(investAmount)} of ${name} on ${queryDate}, you would have ${verb} ${formatPrice(Math.abs(result))}.`;

  // Displaying to infoPast: Query date and value 
  let tickerID = name.split(' ')[1].slice(1,-1)
  let pastHeader = document.createElement("h2");
  pastHeader.textContent = `${tickerID} Then`;
  pastHeader.classList = "card-title";

  let pastDate = document.createElement("p");
  pastDate.textContent = queryDate;
  pastDate.classList = "card-date";

  let pastBody = document.createElement("h3");
  pastBody.textContent = formatPrice(prices[0]);
  pastBody.classList = "card-body";

  infoPast.append(pastHeader)
  infoPast.append(pastDate)
  infoPast.append(document.createElement("br"))
  infoPast.append(pastBody)

  // Displaying to infoChange: change in value, percent change, add red/green arrow?
  let changeHeader = document.createElement("h2");
  changeHeader.textContent = "Change";
  changeHeader.classList = "card-title";

  let changeValue = document.createElement("h3");
  changeValue.textContent = formatPrice(currentPrice-prices[0]);
  changeValue.classList = "card-body";

  let changePercent = document.createElement("h3");
  let pctChange = (100*(currentPrice-prices[0])/prices[0]).toFixed(3);
  changePercent.textContent = pctChange + "%";
  changePercent.classList = "card-body";

  // Set color of text to green or red if positive/negative
  if (currentPrice > prices[0]) {
    changeValue.setAttribute("style","color:green")
    changePercent.setAttribute("style","color:green")
  } else if (currentPrice < prices[0]) {
    changeValue.setAttribute("style","color:red")
    changePercent.setAttribute("style","color:red")
  }

  infoChange.append(changeHeader)
  infoChange.append(document.createElement("br"))
  infoChange.append(changeValue)
  infoChange.append(changePercent)

  // Displaying to infoCurrent
  let currentHeader = document.createElement("h2");
  currentHeader.textContent = `${tickerID} Now`;
  currentHeader.classList = "card-title";

  let currentDate = document.createElement("p");
  currentDate.textContent = moment().format('MMMM Do, YYYY');
  currentDate.classList = "card-date";

  let currentBody = document.createElement("h3");
  currentBody.textContent = formatPrice(currentPrice);
  currentBody.classList = "card-body";

  infoCurrent.append(currentHeader)
  infoCurrent.append(currentDate)
  infoCurrent.append(document.createElement("br"))
  infoCurrent.append(currentBody)

  // Display calculation elements after data has been first populated
  document.querySelector("#calculation-container").setAttribute("style","display:block");

}

//Twitter API call
function getTweet() {
  let searchValue= cryptoSelect.value;
  var twitterUrl= "https://api.coinpaprika.com/v1/coins/" +coinToID[searchValue] +"/twitter";
  fetch(twitterUrl)
    .then(function(response){
      return response.json()
    }).then(function(data){

      let tweetHeader = document.createElement("h2");
      tweetHeader.textContent = "Latest Dev Tweet:";
      tweetHeader.classList = "card-title";

      var tweetStatus = document.createElement('h4');
      tweetStatus.textContent = "'" + data[0].status + "'" + "- @" +data[0].user_name;
      tweetStatus.classList = "card-tweet";

      infoTwitter.append(tweetHeader)
      infoTwitter.append(document.createElement("br"))
      infoTwitter.append(document.createElement("br"))
      infoTwitter.append(tweetStatus)
      infoTwitter.append(document.createElement("br"))
      
    });
}

// Utility Functions
// Function to determine which day interval to call from coinpaprika so that results are smooth and cover the whole date range.
function determineInterval(startDate,endDate) {
  let maxPoints = 900; // Maximum historical points from api call
  let intervals = [1,7,14,30,90]; // coinpaprika available day intervals
  let start = moment(startDate,'mm-dd-yyyy');
  let end = moment(endDate,'mm-dd-yyyy');
  
  let diffDays = moment.duration(end.diff(start)).asDays();
  
  // Loop through intervals until the smallest interval that will cover the whole date range
  for (let ii = 0; ii < intervals.length; ii++) {
    if (diffDays/intervals[ii] < maxPoints) {
      return intervals[ii]
    }
  }

  // if no matching interval was found default behavior as 14d
  return 14

}

// Function to pull times and prices from coins or stocks historical data array
// checks if type is 'coin' or 'stock' to parse the passed in data structure
function extractData(data,currentPrice,type) {
  let times = [];
  let prices = [];

  if (type == 'coin') {
    data.forEach((entry) => {
      times.push(moment(entry.timestamp,'YYYY-MM-DDThh:mm:ssZ'));
      prices.push(entry.price);
    })
    times.push(moment())
    prices.push(currentPrice)

  } else if (type == 'stock') {
    // Stock api, price data buried in data.chart.result[0].indicators.quote[0].high
    data.chart.result[0].indicators.quote[0].high.forEach((entry) => {
      prices.push(entry);
    })
    data.chart.result[0].timestamp.forEach((entry) => {
      times.push(moment.unix(entry));
    })
  }

  return {'times':times,'prices':prices}
}

// Convert price string or number to formatted string
function formatPrice(price) {
  let sign = "" // carry the minus sign to end if present
  if (typeof price !== "string") {
    if (price >= 0) {
      s = String(price.toFixed(2));
    } else {
      s = String(Math.abs(price.toFixed(2)));
      sign = "-"
    }
   
  } else {
    s = price;
  }
  if (s[0] != '$') {
    s = '$' + s
  }

  // Add appropriate commas and formatting using regex a la https://www.codegrepper.com/code-examples/javascript/javascript+format+currency+with+commas
  return sign + s.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// Extract investment value from formatted string
function extractInvestment() {
  let investString = investEl.value;

  return Number(investString.replace(/[^0-9\.-]+/g,""))
}

// Removing children from all output data cards
function clearCards() {
  let cards = [infoMain,infoPast,infoChange,infoCurrent,infoTwitter];
  cards.forEach((card) => {
    if (card) {
      while (card.firstChild) {
        card.removeChild(card.firstChild);
      }
    }
  })
}

//Convert input to currecny as user inputs values
$("input[id='invest']").on({
  keyup: function() {
    formatCurrency($(this));
  },
  blur: function() { 
    formatCurrency($(this), "blur");
  }
});
function formatNumber(n) {
return n.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}
function formatCurrency(input, blur) {
// appends $ to value, validates decimal side
// and puts cursor back in right position.

var input_val = input.val();

if (input_val === "") { return; }

var original_len = input_val.length;

var caret_pos = input.prop("selectionStart");
  
// check for decimal
if (input_val.indexOf(".") >= 0) {

//prevents multiple decimal places
  var decimal_pos = input_val.indexOf(".");

// split number by decimal point
var left_side = input_val.substring(0, decimal_pos);
var right_side = input_val.substring(decimal_pos);

// add commas to left side of number
left_side = formatNumber(left_side);

// validate right side
right_side = formatNumber(right_side);
  
// On blur make sure 2 numbers after decimal
if (blur === "blur") {
  right_side += "00";
  }
  
// Limit decimal to only 2 digits
  right_side = right_side.substring(0, 2);

// join number by .
  input_val = "$" + left_side + "." + right_side;

} else {
  // no decimal entered
  // add commas to number
  // remove all non-digits
  input_val = formatNumber(input_val);
  input_val = "$" + input_val;
  
  // final formatting
  if (blur === "blur") {
    input_val += ".00";
  }
}

// send updated string to input
input.val(input_val);

// put caret back in the right position
var updated_len = input_val.length;
caret_pos = updated_len - original_len + caret_pos;
input[0].setSelectionRange(caret_pos, caret_pos);
}