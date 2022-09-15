// ----------------------------------------------------------------------------
// Imports
// ----------------------------------------------------------------------------
import { getAsync } from "./api.js"

// ----------------------------------------------------------------------------
// Global Constants and Variables
// ----------------------------------------------------------------------------
const metalSpotPriceEles = document.querySelectorAll(".metal-spot-price");

// ----------------------------------------------------------------------------
// Metals API
// ----------------------------------------------------------------------------
// initializeMetalsInfo() - Initializes Precious Metal section
// ----------------------------------------------------------------------------

const initializeMetalsInfo = async () => {
    const metalsRatesArr = await getAsync('/metals'); // Data index: 0 Au, 1 Ag, 2 Pt

    await getAsync('/metals')
        .then((res) => {
            // console.log(`Pt ${metalsRatesArr[2]["platinum"]} Au ${metalsRatesArr[0]["gold"]} Ag ${metalsRatesArr[1]["silver"]}`);
            metalSpotPriceEles[0].textContent = `$${metalsRatesArr[1]["silver"]}/toz`;
            metalSpotPriceEles[1].textContent = `$${metalsRatesArr[0]["gold"]}/toz`;
            metalSpotPriceEles[2].textContent = `$${metalsRatesArr[2]["platinum"]}/toz`;
        })
        .catch((error) => {
            console.log("API Error: " + error);
        });
};

export default initializeMetalsInfo;