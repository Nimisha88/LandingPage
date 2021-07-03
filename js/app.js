// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Global Constants and Variables
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

// Hero - Coin Flip
const coinIconList = ["fa-dollar-sign", "fa-rupee-sign", "fa-euro-sign", "fa-ruble-sign", "fa-yen-sign", "fa-pound-sign"];
const coinLogoIcon = document.querySelector(".coin-logo-icon");

// APIs
const coinbaseBaseURL = "https://api.coinbase.com/";
const coinbaseExchangeRateAPI = "/v2/exchange-rates";
const coinbaseCurrenciesAPI = "/v2/currencies";
const coinbaseTimeAPI = "/v2/time";
const frankfuterBaseURL = "https://api.frankfurter.app/";
const frankfuterCurrenciesAPI = "currencies";
const frankfuterLatestRatesAPI = "latest";
const metalsAPIBaseURL = "https://api.metals.live/";
const allMetalsLatestPrice = "v1/spot";

// Exchange CTA and Graph
const baseCurrDropDown = document.getElementById("baseCurrencyDD");
const convCurrDropDown = document.getElementById("convCurrencyDD");
const baseCurrNameSpan = document.getElementById("baseCurrName")
const convCurrNameSpan = document.getElementById("convCurrName")
const convCurrRateSpan = document.getElementById("convCurrRate");
const baseCurrAmtInput = document.getElementById("baseCurrencyAmt");
const convCurrAmtInput = document.getElementById("convCurrencyAmt");
const lastUpdatedAtEle = document.querySelector(".last-updated-at");
const convGraphCanvas = document.querySelector(".conv-graph");
const canvasEle = document.getElementById("currChart");

let currencies = [];
let rates = [];
let baseCurrID;
let convCurrID;
let lastUpdatedAt;
let dataForGraph;
let currChart;

// Precious Metals
const metalSpotPriceEles = document.querySelectorAll(".metal-spot-price");

// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Function declarations and their short descriptions
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// Hero - Coin Flip
// ----------------------------------------------------------------------------
// coinFlipper() - Change currency icon every 4 secs
// ----------------------------------------------------------------------------

function coinFlipper() {

  let coinIconLooper = 1;

  setInterval(() => {
    coinLogoIcon.classList.remove(...coinIconList);
    coinLogoIcon.classList.add(coinIconList[coinIconLooper++ % coinIconList.length]);
  }, 4000);

}


// ----------------------------------------------------------------------------
// Exchange CTA and Graph
// ----------------------------------------------------------------------------
// getConvRates(baseCurr, convCurr) - Gets the conversion rate
// getLastUpdatedAt() - Gets the last server update time stamp
// initExchangeCTA() - Initializes Exchange CTA and Graph
// ----------------------------------------------------------------------------

let getConvRates = (baseCurr, convCurr) => (rates[convCurr]/rates[baseCurr]).toFixed(2);
let getLastUpdatedAt = () => lastUpdatedAt;

async function initExchangeCTA() {
  baseCurrID = "USD";
  convCurrID = "EUR";
  baseCurrAmtInput.value = 1;
  baseCurrNameSpan.textContent = "US Dollar";
  convCurrNameSpan.textContent = "Euro";
  currencies = await fetchCurrencies();
  rates = await fetchRates();
  lastUpdatedAt = await fetchLastServerUpdateTS();
  convCurrRateSpan.textContent = getConvRates(baseCurrID, convCurrID);
  convCurrAmtInput.value = getConvRates(baseCurrID, convCurrID);
  lastUpdatedAtEle.textContent = await getLastUpdatedAt().toUTCString();
  setCurrenciesInConvCTA();
  addEventListenersOnExchangeCTA();
  plotGraph();
}


// ----------------------------------------------------------------------------
// Fetch Currencies and Populate Dropdowns
// ----------------------------------------------------------------------------
// currencyDropDownElement(eleID, eleName) - Creates a Drop Down Option element
// setCurrenciesInConvCTA() - Initializes Exchange CTA Currency Drop Downs
// fetchCurrencies() - Fetches currencies through an API call
// ----------------------------------------------------------------------------

let currencyDropDownElement = (eleID, eleName) => {
  let element = document.createElement("option");
  element.classList.add("conv-dd-opt");
  element.setAttribute("value", eleID);
  element.innerHTML = eleName;
  return element;
}

let setCurrenciesInConvCTA = () => {
  let currencyFragment = new DocumentFragment();

  /* for (currency of currencies) {
    currencyFragment.appendChild(currencyDropDownElement(currency.id, currency.name));
  } */

  currenciesID = Object.keys(currencies);
  currenciesName = Object.values(currencies);

  for (let i=0; i<currenciesID.length; i++) {
    currencyFragment.appendChild(currencyDropDownElement(currenciesID[i], currenciesName[i]));
  }

  baseCurrDropDown.appendChild(currencyFragment.cloneNode(true));
  convCurrDropDown.appendChild(currencyFragment);
}

async function fetchCurrencies() {
  try {
    // const response = await fetch(coinbaseBaseURL + coinbaseCurrenciesAPI);
    const response = await fetch(frankfuterBaseURL + frankfuterCurrenciesAPI);

    if (response.status != 200) {
      console.log("Looks like there was a problem. Status Code: " + response.status);
      throw "Response Status Code is NOT 200.";
    }

    const json = await response.json();
    // return (JSON.parse(JSON.stringify(json))).data;
    return JSON.parse(JSON.stringify(json));
  }
  catch(error) {
      console.log("Request Failed", error);
  }
}


// ----------------------------------------------------------------------------
// Fetch Exchange Rates
// ----------------------------------------------------------------------------
// fetchRates() - Fetches latest Exchange Rates through an API call
// ----------------------------------------------------------------------------

async function fetchRates() {

  let fetchURL = `${coinbaseBaseURL}${coinbaseExchangeRateAPI}?currency=${baseCurrID}`

  try {
    const response = await fetch(fetchURL);

    if (response.status != 200) {
      console.log('Looks like there was a problem. Status Code: ' +
        response.status);
      throw "Response Status Code is NOT 200.";
    }

    const json = await response.json();
    return (JSON.parse(JSON.stringify(json))).data.rates;
  }
  catch(error) {
    console.log('Request Failed', error);
  }

}


// ----------------------------------------------------------------------------
// Fetch Last Server Update TimeStamp
// ----------------------------------------------------------------------------
// fetchLastServerUpdateTS() - Fetches last server update time through API
// ----------------------------------------------------------------------------

async function fetchLastServerUpdateTS() {

  try {
    const response = await fetch(coinbaseBaseURL+coinbaseTimeAPI);

    if (response.status != 200) {
      console.log('Looks like there was a problem. Status Code: ' + response.status);
      throw "Response Status Code is NOT 200.";
    }

    const json = await response.json();
    return new Date((JSON.parse(JSON.stringify(json))).data.iso);
  }
  catch(error) {
    console.log('Request Failed', error);
  }

}


// ----------------------------------------------------------------------------
// Exchange CTA (Currency Amount and Drop Down) Event Listeners
// ----------------------------------------------------------------------------
// changeCurrNameInExchangeCTA(currNamePlaceholder, currDropDown) -->
//          Changes Base/Conv Currency Name in Exchange CTA
// changeAmtInputInExchangeCTA(baseOrConv, baseCurr, convCurr) -->
//          Changes Base/Conv Amount in Exchange CTA
// addEventListenersOnExchangeCTA() - Adds Event Listeners & expected actions
// ----------------------------------------------------------------------------

function changeCurrNameInExchangeCTA(currNamePlaceholder, currDropDown) {
  currNamePlaceholder.textContent = currDropDown.options[currDropDown.selectedIndex].text;
}

function changeAmtInputInExchangeCTA(baseOrConv, baseCurr, convCurr) {

  switch (baseOrConv) {
    case "base":
      baseCurrAmtInput.value = convCurrAmtInput.value * getConvRates(convCurr, baseCurr);
      break;
    case "conv":
      convCurrAmtInput.value = baseCurrAmtInput.value * getConvRates(baseCurr, convCurr);
      break;
    default:
      console.log("Change amount input switch is not working properly.");
  }

}

function addEventListenersOnExchangeCTA() {

  /* Add Event Listener to Base Currency DropDown */
  baseCurrDropDown.addEventListener("change", function(event) {
    baseCurrID = event.target.value;  // Change Global Base Currency
    changeCurrNameInExchangeCTA(baseCurrNameSpan, baseCurrDropDown);  // Change the Currency Name
    convCurrRateSpan.textContent = getConvRates(baseCurrID, convCurrID);  // Change Conversion Rate
    changeAmtInputInExchangeCTA("conv", baseCurrID, convCurrID);  // Change Conversion Amount
    plotGraph(); // Change Graph
  });

  /* Add Event Listener to Conversion Currency DropDown */
  convCurrDropDown.addEventListener("change", function(event) {
    convCurrID = event.target.value;  // Change Global Conversion Currency
    changeCurrNameInExchangeCTA(convCurrNameSpan, convCurrDropDown);  // Change the Currency Name
    convCurrRateSpan.textContent = getConvRates(baseCurrID, convCurrID);  // Change Conversion Rate
    changeAmtInputInExchangeCTA("conv", baseCurrID, convCurrID);  // Change Conversion Amount
    plotGraph(); // Change Graph
  });

  /* Add Event Listener to Base Currency Amount Input */
  baseCurrAmtInput.addEventListener("input", function(event) {
    changeAmtInputInExchangeCTA("conv", baseCurrID, convCurrID);  // Change Conversion Amount
  });

  /* Add Event Listener to Conversion Currency Amount Input */
  convCurrAmtInput.addEventListener("input", function(event) {
    changeAmtInputInExchangeCTA("base", baseCurrID, convCurrID);  // Change Base Amount
  });

}


// ----------------------------------------------------------------------------
// Currency Pair
// ----------------------------------------------------------------------------
// CurrencyPair() - A base and conversion currency pair Object
// getPopularCurrencyPairs() - Gets an array of Popular Currency Pairs
// getPrevUpdateDate(date) - Gets second last update date
// fetchCurrPairData(amt, baseCurr, convCurr) -->
//          Fetches currency pair data to calculate last rates update date
// fetchCurrPairDateWiseData(date, baseCurr, convCurr) -->
//          Fetches date wise currency pair data to calculate change in rates
// populateCurrencyPairHTML(currPairs) -->
//          Populates appropriate currency pair, rate and change in HTML
// initializeCurrencyPairSection() - Initializes Currency Pair Section
// ----------------------------------------------------------------------------
function CurrencyPair(baseCurr, convCurr) {
  this.baseCurr = baseCurr;
  this.convCurr = convCurr;
  this.lastUpdateDate;
  this.prevUpdateDate;
  this.rate = 0;
  this.change = 0;
}

function getPopularCurrencyPairs() {
  let currPairs = [];
  currPairs.push(new CurrencyPair("EUR", "USD"));
  currPairs.push(new CurrencyPair("USD", "JPY"));
  currPairs.push(new CurrencyPair("GBP", "USD"));
  currPairs.push(new CurrencyPair("USD", "CAD"));
  currPairs.push(new CurrencyPair("AUD", "USD"));
  currPairs.push(new CurrencyPair("USD", "INR"));
  return currPairs;
}

function getPrevUpdateDate(date) {

  let prevUpdateDate;

  switch(date.toUTCString().slice(0,3).toLowerCase()) {
    case 'mon':
      prevUpdateDate = (new Date(date - (3*24*60*60*1000))).toISOString().slice(0,10);
      break;
    default:
      prevUpdateDate = (new Date(date - (24*60*60*1000))).toISOString().slice(0,10);
  }
  return prevUpdateDate;
}

async function fetchCurrPairData(amt, baseCurr, convCurr) {

  try {
    const response = await fetch(`${frankfuterBaseURL}${frankfuterLatestRatesAPI}?amount=${amt}&from=${baseCurr}&to=${convCurr}`);

    if (response.status != 200) {
      console.log('Looks like there was a problem. Status Code: ' + response.status);
      throw "Response Status Code is NOT 200.";
    }

    const json = await response.json();
    return JSON.parse(JSON.stringify(json));
  }
  catch(error) {
    console.log('Request Failed', error);
  }

}

async function fetchCurrPairDateWiseData(date, baseCurr, convCurr) {

  try {
    const response = await fetch(`${frankfuterBaseURL}${date}?from=${baseCurr}&to=${convCurr}`);

    if (response.status != 200) {
      console.log('Looks like there was a problem. Status Code: ' + response.status);
      throw "Response Status Code is NOT 200.";
    }

    const json = await response.json();
    return JSON.parse(JSON.stringify(json));
  }
  catch(error) {
    console.log('Request Failed', error);
  }

}

function populateCurrencyPairHTML(currPairs) {
  const pairFields = document.querySelectorAll(".pair");
  const pairRateFields = document.querySelectorAll(".pair-rate");
  const pairChangeFields = document.querySelectorAll(".pair-change");

  for (let index = 0; index < currPairs.length; index++) {
    let currPair = currPairs[index];
    pairFields[index].textContent = `${currPair.baseCurr} / ${currPair.convCurr}`;
    pairRateFields[index].textContent = currPair.rate;

    if (currPair.change < 0) {
      pairChangeFields[index].innerHTML = `<i class="fas fa-chevron-circle-down rate-down"></i>`;
    } else {
      pairChangeFields[index].innerHTML = `<i class="fas fa-chevron-circle-up rate-up"></i>`;
    }
  }

}

async function initializeCurrencyPairSection() {
  let popularCurrencyPairs = getPopularCurrencyPairs();

  for (currPair of popularCurrencyPairs) {
    const currPairData = await fetchCurrPairData(1, currPair.baseCurr, currPair.convCurr);
    currPair.lastUpdateDate = currPairData.date;
    currPair.prevUpdateDate = getPrevUpdateDate(new Date(currPairData.date));
    currPair.rate = currPairData.rates[currPair.convCurr];
    // console.log(`Previous Date = ${currPair.prevUpdateDate} and Last Date = ${currPair.lastUpdateDate}`);
    // console.log(`${currPair.baseCurr}/${currPair.convCurr} ${currPair.rate}`);

    const prevDateCurrPairData = await fetchCurrPairDateWiseData(currPair.prevUpdateDate, currPair.baseCurr, currPair.convCurr);
    currPair.change = currPair.rate - prevDateCurrPairData.rates[currPair.convCurr];
    // console.log(`Change in ${currPair.baseCurr} and ${currPair.convCurr} from ${currPair.lastUpdateDate} to ${currPair.prevUpdateDate} is ${currPair.change}`)
  }

  populateCurrencyPairHTML(popularCurrencyPairs);

}


// ----------------------------------------------------------------------------
// Metals API
// ----------------------------------------------------------------------------
// fetchMetalRates() - Fetches spot prices for precious metals through API
// initializeMetalsInfo() - Initializes Precious Metal section
// ----------------------------------------------------------------------------

async function fetchMetalRates() {
  try {
    const response = await fetch(`${metalsAPIBaseURL}${allMetalsLatestPrice}`);

    if (response.status != 200) {
      console.log('Looks like there was a problem. Status Code: ' + response.status);
      throw "Response Status Code is NOT 200.";
    }

    const json = await response.json();
    return JSON.parse(JSON.stringify(json));
  }
  catch(error) {
    console.log('Request Failed', error);
  }
}

async function initializeMetalsInfo() {

  const metalsRatesArr = await fetchMetalRates(); // Data index: 0 Au, 1 Pt, 2 Ag

  metalSpotPriceEles[0].textContent = `$${metalsRatesArr[2]["silver"]}/toz`;
  metalSpotPriceEles[1].textContent = `$${metalsRatesArr[0]["gold"]}/toz`;
  metalSpotPriceEles[2].textContent = `$${metalsRatesArr[1]["platinum"]}/toz`;

}


// ----------------------------------------------------------------------------
// Fetch data for Graph
// ----------------------------------------------------------------------------
// fetchDataForGraph() - Fetches data for graph through an API call
// showOrHideGraphContainer() - Hides graph if base & conv currency are same
// fetchXAxisTimeLineData() - Fetches X axis (TimeLine) data as array
// fetchYAxisCurrData() - Fetches Y axis (Rates) data as array
// plotGraph() - Using Chart.js Line Chart, plots graph of exchange rates for
//               last 3 months
// ----------------------------------------------------------------------------

async function fetchDataForGraph() {
  let graphStartDate =  (new Date(Date.now() - (90*24*60*60*1000))).toISOString().slice(0,10);

  try {
    const response = await fetch(`${frankfuterBaseURL}${graphStartDate}..?from=${baseCurrID}&to=${convCurrID}`);

    if (response.status != 200) {
      console.log('Looks like there was a problem. Status Code: ' + response.status);
      throw "Response Status Code is NOT 200.";
    }

    const json = await response.json();
    return (JSON.parse(JSON.stringify(json))).rates;
  }
  catch(error) {
    console.log('Request Failed', error);
  }
}

function showOrHideGraphContainer() {
  // console.log(baseCurrID+"/"+convCurrID);
  if (baseCurrID != convCurrID) {
    convGraphCanvas.style.display = "inline";
    return true;
  } else {
    convGraphCanvas.style.display = "none";
    return false;
  }
}

async function fetchXAxisTimeLineData() {
  const graphDataKeys = Object.keys(dataForGraph);
  const interval = Math.floor(graphDataKeys.length/4);

  let xAxisDataArr = [];
  for (let i = 0; i<graphDataKeys.length; i++) {
    xAxisDataArr.push("");
  }

  xAxisDataArr[interval] = (new Date(graphDataKeys[interval])).toDateString().slice(4, 10);
  xAxisDataArr[interval*2] = (new Date(graphDataKeys[interval*2])).toDateString().slice(4, 10);
  xAxisDataArr[interval*3] = (new Date(graphDataKeys[interval*3])).toDateString().slice(4, 10);
  // console.log(xAxisDataArr);

  // return [20210621, 20210622, 20210623, 20210624, 20210625, 20210626];
  return xAxisDataArr;
}

async function fetchYAxisCurrData() {
  const graphDataValues = Object.values(dataForGraph);

  let yAxisDataArr = [];
  for (graphData of graphDataValues) {
    yAxisDataArr.push(Object.values(graphData)[0]);
  }
  // console.log(yAxisDataArr);

  // return [83, 84, 89, 76, 79, 90];
  return yAxisDataArr;
}


async function plotGraph() {

  if (!showOrHideGraphContainer()) {
    return;
  }

  dataForGraph = await fetchDataForGraph();
  let graphXAxisData = await fetchXAxisTimeLineData();
  let graphYAxisData = await fetchYAxisCurrData();

  if (typeof currChart != 'undefined') {
    currChart.destroy();
  }

  currChart = new Chart(canvasEle, {
    type: 'line',
    data: {
      labels: graphXAxisData,
      datasets: [
        {
          data: graphYAxisData,
          label: `${convCurrNameSpan.textContent} against ${baseCurrNameSpan.textContent}`,
          borderColor: "#1099ff",
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        x: {
          grid:{
            display: false
          },
          ticks: {
            autoSkip: false
          }
        },
        y: {
          // suggestedMin: 70,
          // suggestedMax: 100,
          grid:{
            display: false
          }
        },
      },
    },
  });
}

// ----------------------------------------------------------------------------
// Web Page
// ----------------------------------------------------------------------------
// initializeWebPage() - Initializes the Web Page on Load
// ----------------------------------------------------------------------------

function initializeWebPage() {
  displayNavBarOnScroll();
  coinFlipper();
  initExchangeCTA();
  initializeCurrencyPairSection();
  initializeMetalsInfo();
}

initializeWebPage();


// ----------------------------------------------------------------------------
// Nav Bar
// ----------------------------------------------------------------------------
// displayNavBarOnScroll() - Displays NavBar on Scroll
// ----------------------------------------------------------------------------
function displayNavBarOnScroll() {

  let navBarEle = document.getElementById("navigation");
  let navBarOffsetHeight = `${navBarEle.offsetHeight}px`;

  console.log(`Nav Bar Offset is ${navBarOffsetHeight}`);
  navBarEle.addEventListener('click', function() {
    document.body.style.paddingTop = `${navBarEle.offsetHeight}px`;
  });

}
