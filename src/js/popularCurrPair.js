// ----------------------------------------------------------------------------
// Currency Pair
// ----------------------------------------------------------------------------

import { postAsync } from "./api.js";

// CurrencyPair() - A base and conversion currency pair Object
const CurrencyPair = (baseCurr, convCurr) => {
    return {
        baseCurr,
        convCurr,
        lastUpdateDate: '',
        prevUpdateDate: '',
        rate: 0,
        change: 0
    }
}

// getPopularCurrencyPairs() - Gets an array of Popular Currency Pairs
const getPopularCurrencyPairs = () => {
    let currPairs = [];
    currPairs.push(CurrencyPair("EUR", "USD"));
    currPairs.push(CurrencyPair("USD", "JPY"));
    currPairs.push(CurrencyPair("GBP", "USD"));
    currPairs.push(CurrencyPair("USD", "CAD"));
    currPairs.push(CurrencyPair("AUD", "USD"));
    currPairs.push(CurrencyPair("USD", "INR"));
    return currPairs;
}

// getPrevUpdateDate(date) - Gets second last update date
const getPrevUpdateDate = (date) => {
    let prevUpdateDate;

    switch (date.toUTCString().slice(0, 3).toLowerCase()) {
        case "mon":
            prevUpdateDate = new Date(date - 3 * 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 10);
            break;
        default:
            prevUpdateDate = new Date(date - 24 * 60 * 60 * 1000)
                .toISOString()
                .slice(0, 10);
    }
    return prevUpdateDate;
}


// populateCurrencyPairHTML(currPairs)
// Populates appropriate currency pair, rate and change in HTML
const populateCurrencyPairHTML = (currPairs) => {
    const pairFields = document.querySelectorAll(".pair");
    const pairRateFields = document.querySelectorAll(".pair-rate");
    const pairChangeFields = document.querySelectorAll(".pair-change");

    for (let index = 0; index < currPairs.length; index++) {
        let currPair = currPairs[index];
        pairFields[
            index
        ].textContent = `${currPair.baseCurr} / ${currPair.convCurr}`;
        pairRateFields[index].textContent = currPair.rate;

        if (currPair.change < 0) {
            pairChangeFields[
                index
            ].innerHTML = `<i class="fas fa-chevron-circle-down rate-down"></i>`;
        } else {
            pairChangeFields[
                index
            ].innerHTML = `<i class="fas fa-chevron-circle-up rate-up"></i>`;
        }
    }
}

// initializeCurrencyPairSection() - Initializes Currency Pair Section
const initializeCurrencyPairSection = async () => {
    let popularCurrencyPairs = getPopularCurrencyPairs();

    for (let currPair of popularCurrencyPairs) {
        const currPairData = await postAsync('/currPair', {
            amt: 1, 
            baseCurr: currPair.baseCurr,
            convCurr: currPair.convCurr
        });

        currPair.lastUpdateDate = currPairData.date;
        currPair.prevUpdateDate = getPrevUpdateDate(
            new Date(currPairData.date)
        );
        currPair.rate = currPairData.rates[currPair.convCurr];
        // console.log(`Previous Date = ${currPair.prevUpdateDate} and Last Date = ${currPair.lastUpdateDate}`);
        // console.log(`${currPair.baseCurr}/${currPair.convCurr} ${currPair.rate}`);

        const prevDateCurrPairData = await postAsync('/currPairByDate', {
            date: currPair.prevUpdateDate, 
            baseCurr: currPair.baseCurr, 
            convCurr: currPair.convCurr
        });

        currPair.change =
            currPair.rate - prevDateCurrPairData.rates[currPair.convCurr];
        // console.log(`Change in ${currPair.baseCurr} and ${currPair.convCurr} from ${currPair.lastUpdateDate} to ${currPair.prevUpdateDate} is ${currPair.change}`)
    }

    populateCurrencyPairHTML(popularCurrencyPairs);
}

export default initializeCurrencyPairSection;