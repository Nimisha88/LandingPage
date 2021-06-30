// ----------------------------------------------------------------------------
// Hero - Coin Flip
// ----------------------------------------------------------------------------

const coinIconList = ["fa-dollar-sign", "fa-rupee-sign", "fa-euro-sign", "fa-ruble-sign", "fa-yen-sign", "fa-pound-sign"];
const coinLogoIcon = document.querySelector(".coin-logo-icon");
let coinIconLooper = 1;

setInterval(() => {
  coinLogoIcon.classList.remove(...coinIconList);
  coinLogoIcon.classList.add(coinIconList[coinIconLooper++ % coinIconList.length]);
}, 4000);

// ----------------------------------------------------------------------------



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

let currencies = [];
let currenciesForGraph;
let rates = [];
let baseCurrID;
let convCurrID;
let lastUpdateAt;

// Change Conversion Rates in Exchange CTA
function getConvRates(baseCurr, convCurr) {
  // console.log(`Conversion Rate from ${baseCurr} to ${convCurr} is: ${rates[convCurr]/rates[baseCurr]}`)
  return (rates[convCurr] / rates[baseCurr]).toFixed(2);
}

function initExchangeCTA() {
  baseCurrID = "USD";
  convCurrID = "EUR";
  baseCurrNameSpan.textContent = "US Dollar";
  convCurrNameSpan.textContent = "Euro";
  baseCurrAmtInput.value = 1;
  convCurrRateSpan.textContent = getConvRates(baseCurrID, convCurrID);
  convCurrAmtInput.value = getConvRates(baseCurrID, convCurrID);
  lastUpdatedAtEle.textContent = lastUpdateAt;
}

// ----------------------------------------------------------------------------
// API Call to fetch Currencies
// ----------------------------------------------------------------------------

function currencyDropDownElement(id, name) {
  let element = document.createElement("option");
  element.classList.add("conv-dd-opt");
  element.setAttribute("value", id);
  element.innerHTML = name;
  return element;
}

function setCurrenciesInConvCTA() {
  let currencyFragment = new DocumentFragment();

  for (currency of currencies) {
    currencyFragment.appendChild(currencyDropDownElement(currency.id, currency.name));
  }

  baseCurrDropDown.appendChild(currencyFragment.cloneNode(true));
  convCurrDropDown.appendChild(currencyFragment);
}

function fetchCurrencies() {
  fetch(coinbaseBaseURL + coinbaseCurrenciesAPI)
    .then(function(response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' + response.status);
        return;
      }
      return response.json();
    })
    .then(function(json) {
      currencies = (JSON.parse(JSON.stringify(json))).data;
      setCurrenciesInConvCTA();
    })
    .catch(function(err) {
      console.log('Request Failed', err);
    });
}

function fetchCurrenciesForGraph() {
  // fetch(frankfuterBaseURL + frankfuterCurrenciesAPI)
  //   .then(function(response) {
  //     if (response.status != 200) {
  //       console.log('Looks like there was a problem. Status Code: ' + response.status);
  //       return;
  //     }
  //     return response.json();
  //   })
  //   .then(function(json) {
  //     currenciesForGraph = JSON.parse(JSON.stringify(json));
  //     console.log(currenciesForGraph);
  //   })
  //   .catch(function(err) {
  //     console.log('Request Failed', err);
  //   });
}

fetchCurrencies();
fetchCurrenciesForGraph();

// ----------------------------------------------------------------------------


// ----------------------------------------------------------------------------
// API Call to fetch exchange Rates
// ----------------------------------------------------------------------------

function fetchRates(currID) {

  let fetchURL = coinbaseBaseURL + coinbaseExchangeRateAPI;

  if (currID != "USD") {
    baseCurrID = currID;
    fetchURL += `?currency=${currID}`;
  }

  fetch(fetchURL)
    .then(function(response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' +
          response.status);
        return;
      }
      return response.json();
    })
    .then(function(json) {
      rates = (JSON.parse(JSON.stringify(json))).data.rates;
      fetchServerTimeStamp();
    })
    .catch(function(err) {
      console.log('Request Failed', err);
    });
}

fetchRates("USD");

// ----------------------------------------------------------------------------
// Exchange CTA Event Listener
// ----------------------------------------------------------------------------

// Change Currency Names in Exchange CTA
function changeCurrNameInExchangeCTA(currNamePlaceholder, currDropDown) {
  currNamePlaceholder.textContent = currDropDown.options[currDropDown.selectedIndex].text;
}

// Change Conversion Amount in Exchange CTA
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

// Add Event Listener to Base Currency DropDown
baseCurrDropDown.addEventListener("change", function(event) {
  // Change Global Base Currency
  baseCurrID = event.target.value;

  // Change the Currency Name
  changeCurrNameInExchangeCTA(baseCurrNameSpan, baseCurrDropDown);

  // Change Conversion Rate
  convCurrRateSpan.textContent = getConvRates(baseCurrID, convCurrID);

  // Change Conversion Amount
  changeAmtInputInExchangeCTA("conv", baseCurrID, convCurrID);
});


// Add Event Listener to Conversion Currency DropDown
convCurrDropDown.addEventListener("change", function(event) {
  // Change Global Conversion Currency
  convCurrID = event.target.value;

  // Change the Currency Name
  changeCurrNameInExchangeCTA(convCurrNameSpan, convCurrDropDown);

  // Change Conversion Rate
  convCurrRateSpan.textContent = getConvRates(baseCurrID, convCurrID);

  // Change Conversion Amount
  changeAmtInputInExchangeCTA("conv", baseCurrID, convCurrID);
});


// Add Event Listener to Base Currency Amount Input
baseCurrAmtInput.addEventListener("input", function(event) {
  // Change Conversion Amount
  changeAmtInputInExchangeCTA("conv", baseCurrID, convCurrID);
});

// Add Event Listener to Conversion Currency Amount Input
convCurrAmtInput.addEventListener("input", function(event) {
  // Change Base Amount
  changeAmtInputInExchangeCTA("base", baseCurrID, convCurrID);
});

// ----------------------------------------------------------------------------
// API Call to fetch Server time
// ----------------------------------------------------------------------------

function fetchServerTimeStamp() {
  fetch(coinbaseBaseURL + coinbaseTimeAPI)
    .then(function(response) {
      if (response.status !== 200) {
        console.log('Looks like there was a problem. Status Code: ' + response.status);
        return;
      }
      return response.json();
    })
    .then(function(json) {
      lastUpdateAt = new Date((JSON.parse(JSON.stringify(json))).data.iso).toUTCString();
      initExchangeCTA();
      populateDates(lastUpdateAt);
    })
    .catch(function(err) {
      console.log('Request Failed', err);
    });
}

// ----------------------------------------------------------------------------



// ----------------------------------------------------------------------------
// Currency Pair
// ----------------------------------------------------------------------------
const frankfuterBaseURL = "https://api.frankfurter.app/";
const frankfuterCurrenciesAPI = "currencies";


let popularCurrencyPairs = [];
let lastUpdateDate;
let prevUpdateDate;

function CurrencyPair(baseCurr, convCurr) {
  this.baseCurr = baseCurr;
  this.convCurr = convCurr;
  this.lastDate = "2021-06-25";
  this.prevDate = "2021-06-24";
  this.rate = 0;
  this.change = 0;
}

popularCurrencyPairs.push(new CurrencyPair("EUR", "USD"));
popularCurrencyPairs.push(new CurrencyPair("USD", "JPY"));
popularCurrencyPairs.push(new CurrencyPair("GBP", "USD"));
popularCurrencyPairs.push(new CurrencyPair("USD", "CAD"));
popularCurrencyPairs.push(new CurrencyPair("AUD", "USD"));
popularCurrencyPairs.push(new CurrencyPair("USD", "INR"));

function populateDates(lastUpdateAt) {
  let serverDate = new Date(lastUpdateAt);
  switch(lastUpdateAt.slice(0,3).toLowerCase()) {
    case 'mon':
      lastUpdateDate = serverDate;
      prevUpdateDate = new Date(serverDate - (3*24*60*60*1000));
      console.log(`Last update date is ${lastUpdateDate} and the prev update date is ${prevUpdateDate}`);
      break;
    default:
      lastUpdateDate = serverDate;
      prevUpdateDate = new Date(serverDate - (24*60*60*1000));
      console.log(`Last update date is ${lastUpdateDate} and the prev update date is ${prevUpdateDate}`);
  }
}

// console.log(popularCurrencyPairs);

// https://api.frankfurter.app/2021-03-18..2021-03-23?from=USD&to=EUR

CurrencyPair.prototype.fetchCurrPairRateAndChange = function() {
  let prevDate = this.prevDate;
  let lastDate = this.lastDate;
  let baseCurr = this.baseCurr;
  let convCurr = this.convCurr;
  console.log(`${frankfuterBaseURL}${this.prevDate}..${this.lastDate}?from=${this.baseCurr}&to=${this.convCurr}`);
  fetch(`${frankfuterBaseURL}${this.prevDate}..${this.lastDate}?from=${this.baseCurr}&to=${this.convCurr}`)
    .then(function(response) {
      if(response.status!=200) {
        console.log('Looks like there was a problem. Status Code: ' + response.status);
        return;
      }
      return response.json();
    })
    .then(function(json) {
      // let rateKeys = Object.keys((JSON.parse(JSON.stringify(json))).rates);
      // this.rate = (JSON.parse(JSON.stringify(json))).rates[rateKeys[1]];
      // this.change = this.rate - (JSON.parse(JSON.stringify(json))).rates[rateKeys[0]];
      this.rate = ((JSON.parse(JSON.stringify(json))).rates[lastDate])[convCurr];
      this.change = this.rate - ((JSON.parse(JSON.stringify(json))).rates[prevDate])[convCurr];
      console.log(`${baseCurr}/${convCurr} ${rate} ${change}`);
      // console.log(Object.keys((JSON.parse(JSON.stringify(json))).rates));
      // console.log(this.prevDate + " " + this.lastDate);
    })
    .catch(function(err) {
      console.log('Request Failed', err);
    });
}

// for (currPair of popularCurrencyPairs) {
//   currPair.fetchCurrPairRateAndChange();
// }



// CurrencyPair.prototype.lastDate = lastUpdateDate.toISOString().slice(0, 10);
// CurrencyPair.prototype.prevDate = prevUpdateDate.toISOString().slice(0, 10);
console.log(popularCurrencyPairs[0])
popularCurrencyPairs[0].fetchCurrPairRateAndChange();









































// ----------------------------------------------------------------------------
// API Call to fetch current data
// ----------------------------------------------------------------------------
// const coinbaseBaseURL = "https://api.coinbase.com/";
// const coinbaseExchangeRateAPI = "/v2/exchange-rates";
// const coinbaseCurrenciesAPI = "/v2/currencies";
// const coinbaseTimeAPI = "/v2/time";

// fetch(coinbaseBaseURL+coinbaseExchangeRateAPI)
//   .then(response=>response.json())
//   .then(json=>console.log(json))
//   .catch(err=>console.log('Request Failed', err));


//
// function exchangeData(time, currencies, baseCurrency, rates) {
//   time,
//   currencies,
//   baseCurrency,
//   rates,
//   pairConversion: function(baseCurr, desiredCurr) {
//
//   }
//
// }

// function currenciesData(currencies) {
//   currencies
// }








// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// Worksheet
// ----------------------------------------------------------------------------

// const coinbaseExchangeRateAPIKey = "a5c9e5d98d910e9e5270e182";
// const coinGeckoURL = "https://api.coingecko.com/"
// const currencyScoopURL = "https://currencyscoop.com/";
