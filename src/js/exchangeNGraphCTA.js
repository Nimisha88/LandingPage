// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------
// Exchange CTA and its Event Listeners (Currency Amount and Drop Down)
// ----------------------------------------------------------------------------
// ----------------------------------------------------------------------------

import { getAsync, postAsync } from "./api.js";

// ----------------------------------------------------------------------------
// Global Constants and Variables
// ----------------------------------------------------------------------------

// Exchange CTA and Graph
const baseCurrDropDown = document.getElementById("baseCurrencyDD");
const convCurrDropDown = document.getElementById("convCurrencyDD");
const baseCurrNameSpan = document.getElementById("baseCurrName");
const convCurrNameSpan = document.getElementById("convCurrName");
const convCurrRateSpan = document.getElementById("convCurrRate");
const baseCurrAmtInput = document.getElementById("baseCurrencyAmt");
const convCurrAmtInput = document.getElementById("convCurrencyAmt");
const lastUpdatedAtEle = document.querySelector(".last-updated-at");
const convGraphCanvas = document.querySelector(".conv-graph");
const canvasEle = document.getElementById("currChart");



let baseCurrID;
let convCurrID;
let rates = [];
let currChart;

// ----------------------------------------------------------------------------
// Fetch Currencies and Populate Dropdowns
// ----------------------------------------------------------------------------

// currencyDropDownElement(eleID, eleName) - Creates a Drop Down Option element
const currencyDropDownElement = (eleID, eleName) => {
    let element = document.createElement("option");
    element.classList.add("conv-dd-opt");
    element.setAttribute("value", eleID);
    element.innerHTML = eleName;
    return element;
};

// setCurrenciesInConvCTA() - Initializes Exchange CTA Currency Drop Downs
const setCurrenciesInConvCTA = (currencies) => {
    let currencyFragment = new DocumentFragment();

    /* for (currency of currencies) {
      currencyFragment.appendChild(currencyDropDownElement(currency.id, currency.name));
    } */

    let currenciesID = Object.keys(currencies);
    let currenciesName = Object.values(currencies);

    for (let i = 0; i < currenciesID.length; i++) {
        currencyFragment.appendChild(
            currencyDropDownElement(currenciesID[i], currenciesName[i])
        );
    }

    baseCurrDropDown.appendChild(currencyFragment.cloneNode(true));
    convCurrDropDown.appendChild(currencyFragment);
};

// getConvRates(baseCurr, convCurr) - Gets the conversion rate
const getConvRates = (baseCurr, convCurr) =>
    (rates[convCurr] / rates[baseCurr]).toFixed(2);

// changeCurrNameInExchangeCTA(currNamePlaceholder, currDropDown)
// Changes Base/Conv Currency Name in Exchange CTA
const changeCurrNameInExchangeCTA = (currNamePlaceholder, currDropDown) => {
    currNamePlaceholder.textContent =
        currDropDown.options[currDropDown.selectedIndex].text;
};

// changeAmtInputInExchangeCTA(baseOrConv, baseCurr, convCurr)
// Changes Base/Conv Amount in Exchange CTA
const changeAmtInputInExchangeCTA = (baseOrConv, baseCurr, convCurr) => {
    switch (baseOrConv) {
        case "base":
            baseCurrAmtInput.value =
                convCurrAmtInput.value * getConvRates(convCurr, baseCurr);
            break;
        case "conv":
            convCurrAmtInput.value =
                baseCurrAmtInput.value * getConvRates(baseCurr, convCurr);
            break;
        default:
            console.log("Change amount input switch is not working properly.");
    }
};

// addEventListenersOnExchangeCTA() - Adds Event Listeners & expected actions
const addEventListenersOnExchangeCTA = () => {
    /* Add Event Listener to Base Currency DropDown */
    baseCurrDropDown.addEventListener("change", function (event) {
        baseCurrID = event.target.value; // Change Global Base Currency
        changeCurrNameInExchangeCTA(baseCurrNameSpan, baseCurrDropDown); // Change the Currency Name
        convCurrRateSpan.textContent = getConvRates(baseCurrID, convCurrID); // Change Conversion Rate
        changeAmtInputInExchangeCTA("conv", baseCurrID, convCurrID); // Change Conversion Amount
        getGraphDataAndUpdate(baseCurrID, convCurrID); // Change Graph
    });

    /* Add Event Listener to Conversion Currency DropDown */
    convCurrDropDown.addEventListener("change", function (event) {
        convCurrID = event.target.value; // Change Global Conversion Currency
        changeCurrNameInExchangeCTA(convCurrNameSpan, convCurrDropDown); // Change the Currency Name
        convCurrRateSpan.textContent = getConvRates(baseCurrID, convCurrID); // Change Conversion Rate
        changeAmtInputInExchangeCTA("conv", baseCurrID, convCurrID); // Change Conversion Amount
        getGraphDataAndUpdate(baseCurrID, convCurrID); // Change Graph
    });

    /* Add Event Listener to Base Currency Amount Input */
    baseCurrAmtInput.addEventListener("input", function (event) {
        changeAmtInputInExchangeCTA("conv", baseCurrID, convCurrID); // Change Conversion Amount
    });

    /* Add Event Listener to Conversion Currency Amount Input */
    convCurrAmtInput.addEventListener("input", function (event) {
        changeAmtInputInExchangeCTA("base", baseCurrID, convCurrID); // Change Base Amount
    });
};

// ----------------------------------------------------------------------------
// Fetch data for Graph
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------

// showOrHideGraphContainer() - Hides graph if base & conv currency are same
function showOrHideGraphContainer() {
    if (baseCurrID != convCurrID) {
        convGraphCanvas.style.display = "inline";
        return true;
    } else {
        convGraphCanvas.style.display = "none";
        return false;
    }
}

// fetchXAxisTimeLineData() - Fetches X axis (TimeLine) data as array
const getXAxisTimeLineData = (dataForGraph) => {
    const graphDataKeys = Object.keys(dataForGraph);
    const interval = Math.floor(graphDataKeys.length / 4);
    
    let xAxisDataArr = [];
    for (let i = 0; i < graphDataKeys.length; i++) {
        xAxisDataArr.push("");
    }

    xAxisDataArr[interval] = new Date(graphDataKeys[interval])
        .toDateString()
        .slice(4, 10);
    xAxisDataArr[interval * 2] = new Date(graphDataKeys[interval * 2])
        .toDateString()
        .slice(4, 10);
    xAxisDataArr[interval * 3] = new Date(graphDataKeys[interval * 3])
        .toDateString()
        .slice(4, 10);

    return xAxisDataArr;
};

// getYAxisCurrData() - Fetches Y axis (Rates) data as array
const getYAxisCurrData = (dataForGraph) => {
    const graphDataValues = Object.values(dataForGraph);

    let yAxisDataArr = [];
    for (let graphData of graphDataValues) {
        yAxisDataArr.push(Object.values(graphData)[0]);
    }
    
    return yAxisDataArr;
};

// plotGraph()
// Using Chart.js Line Chart, plots graph of exchange rates for last 3 months
const plotGraph = async (graphXAxisData, graphYAxisData) => {
    if (!showOrHideGraphContainer()) {
        return;
    }

    if (typeof currChart != "undefined") {
        currChart.destroy();
    }

    currChart = new Chart(canvasEle, {
        type: "line",
        data: {
            labels: graphXAxisData,
            datasets: [
                {
                    data: graphYAxisData,
                    label: `${convCurrNameSpan.textContent} against ${baseCurrNameSpan.textContent}`,
                    borderColor: "#1099ff",
                    fill: false,
                },
            ],
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    grid: {
                        display: false,
                    },
                    ticks: {
                        autoSkip: false,
                    },
                },
                y: {
                    // suggestedMin: 70,
                    // suggestedMax: 100,
                    grid: {
                        display: false,
                    },
                },
            },
        },
    });
};

// populateCurrencies() - Fetches Currency Data
const populateCurrencies = async () => {
    getAsync("/currencies")
        .then((data) => {
            setCurrenciesInConvCTA(data);  
        })
        .catch((error) => {
            console.log(`Error in Populating Currency: \n ${error}`);
        });
}

// populateRates(baseCurrID, convCurrID) - fetches Exchange Rates
const populateRates = async (baseCurrID, convCurrID) => {
    postAsync("/rates", { baseCurrID })
        .then((data) => {
            rates = data;
            convCurrRateSpan.textContent = getConvRates(baseCurrID, convCurrID);
            convCurrAmtInput.value = getConvRates(baseCurrID, convCurrID);
            addEventListenersOnExchangeCTA();
        })
        .catch((error) => {
            console.log(`Error in Populating Rates: \n ${error}`);
        });
}

// getLastUpdateTS() - fetches last Server Update Time Stamp
const getLastUpdateTS = async () => {
    getAsync("/serverTs")
        .then((data) => {
            lastUpdatedAtEle.textContent = (new Date(data)).toUTCString();
        }).catch((error) => {
            console.log(`Error in getting Server TimeStamp: \n ${error}`);
        });
}

// getGraphData(baseCurrID, convCurrID) - fetches data to plot graph
const getGraphDataAndUpdate = async (baseCurrID, convCurrID) => {
    const res = await postAsync("/graph", { baseCurrID, convCurrID })
        .then((data) => {
            let graphXAxisData = getXAxisTimeLineData(data);
            let graphYAxisData = getYAxisCurrData(data);
            plotGraph(graphXAxisData, graphYAxisData);
        }).catch((error) => {
            console.log(`Error in getting Data for Graph: \n ${error}`);
        });
    return res;
}

// initExchangeCTA() - Initializes Exchange CTA and Graph
const initExchangeCTA = async () => {
    baseCurrID = "USD";
    convCurrID = "EUR";
    baseCurrAmtInput.value = 1;
    baseCurrNameSpan.textContent = "US Dollar";
    convCurrNameSpan.textContent = "Euro";
    populateCurrencies();
    populateRates(baseCurrID, convCurrID);
    getLastUpdateTS();
    getGraphDataAndUpdate(baseCurrID, convCurrID); 
};

export default initExchangeCTA;
