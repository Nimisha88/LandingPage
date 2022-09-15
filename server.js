// Imports
// import express from "express";
// import bodyParser from "body-parser";
// import cors from "cors";
// import fetch from "node-fetch";
// import path from "path";

// APIs
const coinbaseBaseURL = "https://api.coinbase.com/";
const coinbaseExchangeRateAPI = "v2/exchange-rates";
const coinbaseCurrenciesAPI = "v2/currencies";
const coinbaseTimeAPI = "v2/time";
const frankfuterBaseURL = "https://api.frankfurter.app/";
const frankfuterCurrenciesAPI = "currencies";
const frankfuterLatestRatesAPI = "latest";
const metalsAPIBaseURL = "https://api.metals.live/";
const allMetalsLatestPrice = "v1/spot";

// Setup App Instance
const express = require('express'); // Include Express
const bodyParser = require('body-parser'); // Include Body-parser
const cors = require('cors'); // Include CORS
const fetch = require('node-fetch'); // Include fetch
const path = require( 'path' );
const app = express(); // Start up an instance of app
const port = 3000; // Port for the server to listen at

const server = app.listen(port, () => {
    console.log(`Running on "localhost:${port}"`);
});

const configureApp = () => {
    //Configure App Instance
    app.use(
        bodyParser.urlencoded({
            extended: false,
        })
    );
    app.use(bodyParser.json());
    app.use(cors());

    // Initialize the Application Project folder
    app.use(express.static("src"));
};

// ----------------------------------------------------------------------------
// Fetch Currency
// ----------------------------------------------------------------------------
// fetchCurrencies() - Fetches currency data from Frankfuter API
// ----------------------------------------------------------------------------

const fetchCurrencies = async () => {
    const response = await fetch(frankfuterBaseURL + frankfuterCurrenciesAPI);

    try {
        const json = await response.json();
        // console.log(JSON.stringify(json));
        return json;
    } catch (error) {
        console.log("Looks like there was a problem in fetching Currencies.");
        console.log("Request Failed", error);
    }
};

// ----------------------------------------------------------------------------
// Fetch Exchange Rates
// ----------------------------------------------------------------------------
// fetchRates() - Fetches latest Exchange Rates through an API call
// ----------------------------------------------------------------------------

const fetchRates = async ({ baseCurrID }) => {
    let fetchURL = `${coinbaseBaseURL}${coinbaseExchangeRateAPI}?currency=${baseCurrID}`;
    console.log(fetchURL);
    const response = await fetch(fetchURL);

    try {
        const json = await response.json();
        return json.data.rates;
    } catch (error) {
        console.log("Looks like there was a problem in fetching Rates.");
        console.log("Request Failed", error);
    }
};

// ----------------------------------------------------------------------------
// Fetch Last Server Update TimeStamp
// ----------------------------------------------------------------------------
// fetchLastServerUpdateTS() - Fetches last server update time through API
// ----------------------------------------------------------------------------

const fetchLastServerUpdateTS = async () => {
    const response = await fetch(coinbaseBaseURL + coinbaseTimeAPI);
    try {
        const json = await response.json();
        // return (new Date(json.data.iso));
        return JSON.stringify(json.data.iso);
    } catch (error) {
        console.log(
            "Looks like there was a problem in fetching Server Update Timestamps."
        );
        console.log("Request Failed", error);
    }
};

// ----------------------------------------------------------------------------
// Metals API
// ----------------------------------------------------------------------------
// fetchMetalRates() - Fetches spot prices for precious metals through API
// ----------------------------------------------------------------------------

const fetchMetalRates = async () => {
    const response = await fetch(`${metalsAPIBaseURL}${allMetalsLatestPrice}`);
    try {
        const json = await response.json();
        return json;
    } catch (error) {
        console.log("Looks like there was a problem fetching Metal Rates.");
        console.log("Request Failed", error);
    }
};

// ----------------------------------------------------------------------------
// Fetch data for Graph
// ----------------------------------------------------------------------------
// fetchDataForGraph(baseCurrID, convCurrID)
// Fetches data for graph through an API call
// ----------------------------------------------------------------------------

const fetchDataForGraph = async ({ baseCurrID, convCurrID }) => {
    let graphStartDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

    const response = await fetch(
        `${frankfuterBaseURL}${graphStartDate}..?from=${baseCurrID}&to=${convCurrID}`
    );

    try {
        const json = await response.json();
        // return JSON.parse(JSON.stringify(json)).rates;
        return json.rates;
    } catch (error) {
        console.log("Looks like there was a problem fetching Graph Data.");
        console.log("Request Failed", error);
    }
};

// ----------------------------------------------------------------------------
// Currency Pair
// ----------------------------------------------------------------------------
// fetchCurrPairData(amt, baseCurr, convCurr)
// Fetches currency pair data to calculate last rates update date
// ----------------------------------------------------------------------------

async function fetchCurrPairData({ amt, baseCurr, convCurr }) {
    const response = await fetch(
        `${frankfuterBaseURL}${frankfuterLatestRatesAPI}?amount=${amt}&from=${baseCurr}&to=${convCurr}`
    );
    try {
        const json = await response.json();
        return json;
    } catch (error) {
        console.log("Looks like there was a problem fetching Currency Pair.");
        console.log("Request Failed", error);
    }
}

// ----------------------------------------------------------------------------
// Currency Pair
// ----------------------------------------------------------------------------
// fetchCurrPairDateWiseData(date, baseCurr, convCurr)
// Fetches date wise currency pair data to calculate change in rates
// ----------------------------------------------------------------------------

async function fetchCurrPairDateWiseData({ date, baseCurr, convCurr }) {
    const response = await fetch(
        `${frankfuterBaseURL}${date}?from=${baseCurr}&to=${convCurr}`
    );
    try {
        const json = await response.json();
        return json;
    } catch (error) {
        console.log("Looks like there was a problem fetching Currency Pair by Date.");
        console.log("Request Failed", error);
    }
}

// ----------------------------------------------------------------------------
// Configure Server instance
// ----------------------------------------------------------------------------
// serverMain() - Configures all HTTP request Get/Post
// ----------------------------------------------------------------------------

const serverMain = () => {
    // Configure App Instance
    configureApp();

    app.get("/currencies", async (req, res) => {
        console.log("Fetching Currencies ...");
        let reqData = await fetchCurrencies();
        res.send(reqData);
    });

    app.get("/serverTs", async (req, res) => {
        console.log("Fetching Last Update Time Stamp ...");
        let reqData = await fetchLastServerUpdateTS();
        res.send(reqData);
    });

    app.get("/metals", async (req, res) => {
        console.log("Fetching Metal Rates ...");
        let reqData = await fetchMetalRates();
        res.send(reqData);
    });

    app.post("/graph", async (req, res) => {
        console.log("Fetching Graph Data ...");
        let reqData = await fetchDataForGraph(req.body);
        res.send(reqData);
    });

    app.post("/rates", async (req, res) => {
        console.log("Fetching Rates ...");
        let reqData = await fetchRates(req.body);
        res.send(reqData);
    });

    app.post("/currPair", async (req, res) => {
        console.log("Processing Currency Pair Data request received.");
        let reqData = await fetchCurrPairData(req.body);
        res.send(reqData);
    });

    app.post("/currPairByDate", async (req, res) => {
        console.log("Processing Currency Pair By Date Data request received.");
        let reqData = await fetchCurrPairDateWiseData(req.body);
        res.send(reqData);
    });
};

serverMain();
