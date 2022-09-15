// ----------------------------------------------------------------------------
// Imports
// ----------------------------------------------------------------------------
import coinFlipper from "./js/hero.js"
import initializeNavbar from "./js/navbar.js";
import initExchangeCTA from "./js/exchangeNGraphCTA.js"
import initializeCurrencyPairSection from "./js/popularCurrPair.js";
import initializeMetalsInfo from "./js/preciousMetals.js"

// ----------------------------------------------------------------------------
// Web Page
// ----------------------------------------------------------------------------
// initializeWebPage() - Initializes the Web Page on Load
// ----------------------------------------------------------------------------

const initializeWebPage = () => {
  initializeNavbar();
  coinFlipper();
  initExchangeCTA();
  initializeCurrencyPairSection();
  initializeMetalsInfo();
}

initializeWebPage();