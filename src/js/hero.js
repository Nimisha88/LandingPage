// ----------------------------------------------------------------------------
// Global Constants and Variables
// ----------------------------------------------------------------------------

// Coin Flip
const coinIconList = [
    "fa-dollar-sign",
    "fa-rupee-sign",
    "fa-euro-sign",
    "fa-ruble-sign",
    "fa-yen-sign",
    "fa-pound-sign",
];
const coinLogoIcon = document.querySelector(".coin-logo-icon");

// ----------------------------------------------------------------------------
// Hero - Coin Flip
// ----------------------------------------------------------------------------
// coinFlipper() - Change currency icon every 4 secs
// ----------------------------------------------------------------------------

function coinFlipper() {
    let coinIconLooper = 1;

    setInterval(() => {
        coinLogoIcon.classList.remove(...coinIconList);
        coinLogoIcon.classList.add(
            coinIconList[coinIconLooper++ % coinIconList.length]
        );
    }, 4000);
}

export default coinFlipper;