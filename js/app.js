// ----------------------------------------------------------------------------
// Hero - Coin Flip
// Function to loop through currency icons to display at an interval of 4 secs
// ----------------------------------------------------------------------------

const coinIconList = ["fa-dollar-sign", "fa-rupee-sign", "fa-euro-sign", "fa-ruble-sign", "fa-yen-sign", "fa-pound-sign"];
const coinLogoIcon = document.querySelector(".coin-logo-icon");

function coinFlipper() {

  let coinIconLooper = 1;

  setInterval(() => {
    coinLogoIcon.classList.remove(...coinIconList);
    coinLogoIcon.classList.add(coinIconList[coinIconLooper++ % coinIconList.length]);
  }, 4000);

}

coinFlipper();


// ----------------------------------------------------------------------------
// API Variables
// ----------------------------------------------------------------------------

const coinbaseBaseURL = "https://api.coinbase.com/";
const coinbaseExchangeRateAPI = "/v2/exchange-rates";
const coinbaseCurrenciesAPI = "/v2/currencies";
const coinbaseTimeAPI = "/v2/time";


// ----------------------------------------------------------------------------
// Initiallize Exchange CTA
// ----------------------------------------------------------------------------

const baseCurrDropDown = document.getElementById("baseCurrencyDD");
const convCurrDropDown = document.getElementById("convCurrencyDD");
const baseCurrNameSpan = document.getElementById("baseCurrName")
const convCurrNameSpan = document.getElementById("convCurrName")
const convCurrRateSpan = document.getElementById("convCurrRate");
const baseCurrAmtInput = document.getElementById("baseCurrencyAmt");
const convCurrAmtInput = document.getElementById("convCurrencyAmt");
const lastUpdatedAtEle = document.querySelector(".last-updated-at");
const convGraphCanvas = document.querySelector(".conv-graph");

let currencies = [];
let rates = [];
let baseCurrID;
let convCurrID;
let lastUpdatedAt;
let dataForGraph;

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
  dataForGraph = fetchDataForGraph();
  showOrHideGraphContainer();
}

initExchangeCTA();


// ----------------------------------------------------------------------------
// Fetch Currencies and Populate Dropdowns
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
  for (currency of currencies) {
    currencyFragment.appendChild(currencyDropDownElement(currency.id, currency.name));
  }
  baseCurrDropDown.appendChild(currencyFragment.cloneNode(true));
  convCurrDropDown.appendChild(currencyFragment);
}

async function fetchCurrencies() {
  try {
    const response = await fetch(coinbaseBaseURL + coinbaseCurrenciesAPI);

    if (response.status != 200) {
      console.log("Looks like there was a problem. Status Code: " + response.status);
      throw "Response Status Code is NOT 200.";
    }

    const json = await response.json();
    return (JSON.parse(JSON.stringify(json))).data;
  }
  catch(error) {
      console.log("Request Failed", error);
  }
}


// ----------------------------------------------------------------------------
// Fetch Exchange Rates
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
// Exchange CTA Event Listeners
// changeCurrNameInExchangeCTA - Change Base/Conv Currency Name in Exchange CTA
// changeAmtInputInExchangeCTA - Change Base/Conv Amount in Exchange CTA
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
    showOrHideGraphContainer(); // Change Graph
  });

  /* Add Event Listener to Conversion Currency DropDown */
  convCurrDropDown.addEventListener("change", function(event) {
    convCurrID = event.target.value;  // Change Global Conversion Currency
    changeCurrNameInExchangeCTA(convCurrNameSpan, convCurrDropDown);  // Change the Currency Name
    convCurrRateSpan.textContent = getConvRates(baseCurrID, convCurrID);  // Change Conversion Rate
    changeAmtInputInExchangeCTA("conv", baseCurrID, convCurrID);  // Change Conversion Amount
    showOrHideGraphContainer(); // Change Graph
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
// Initialize Currency Pair
// ----------------------------------------------------------------------------
const frankfuterBaseURL = "https://api.frankfurter.app/";
const frankfuterCurrenciesAPI = "currencies";
const frankfuterLatestRatesAPI = "latest";
// const frankfuterCurrPairAPI = ;

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

initializeCurrencyPairSection();

// ----------------------------------------------------------------------------
// Fetch data for Graph
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
    return JSON.parse(JSON.stringify(json));
  }
  catch(error) {
    console.log('Request Failed', error);
  }
}

function showOrHideGraphContainer() {
  console.log(baseCurrID+"/"+convCurrID);
  if ((["USD", "EUR", "INR"].includes(baseCurrID)) & (["USD", "EUR", "INR"].includes(convCurrID))) {
    convGraphCanvas.style.display = "inline";
  } else {
    convGraphCanvas.style.display = "none";
  }
}


// ----------------------------------------------------------------------------
// Metals API
// ----------------------------------------------------------------------------
const metalsAPIBaseURL = "https://api.metals.live/";
const allMetalsLatestPrice = "v1/spot";
const metalSpotPriceEles = document.querySelectorAll(".metal-spot-price");

async function fetchMetalRates() {
  try {
    const response = await fetch(`${metalsAPIBaseURL}${allMetalsLatestPrice}`);

    if (response.status != 200) {
      console.log('Looks like there was a problem. Status Code: ' + response.status);
      throw "Response Status Code is NOT 200.";
    }

    const json = await response.json();
    console.log(JSON.parse(JSON.stringify(json)));
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

initializeMetalsInfo();


// ----------------------------------------------------------------------------
// Graph - chart.js
// ----------------------------------------------------------------------------

async function plotGraph() {
  let graphYAxisData = [83, 84, 89, 76, 79, 90];
  let graphXAxisData = [20210621, 20210622, 20210623, 20210624, 20210625, 20210626];

  let canvasEle = document.getElementById("myChart");
  let myChart = new Chart(canvasEle, {
    type: 'line',
    data: {
      labels: graphXAxisData,
      datasets: [
        {
          data: graphYAxisData,
          label: "Euro Against USD",
          borderColor: "#3e95cd",
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
          }
        },
        y: {
          suggestedMin: 70,
          suggestedMax: 100,
          grid:{
            display: false
          }
        },
      },
    },
  });
}

plotGraph();
