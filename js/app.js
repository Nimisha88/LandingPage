// fa-dollar-sign, fa-rupee-sign, fa-euro-sign, fa-ruble-sign, fa-yen-sign, fa-pound-sign
// fab fa-btc

const coinLogoIcon = document.querySelector(".coin-logo-icon");

setInterval(function(){
  coinLogoIcon.classList.toggle("fa-dollar-sign");
  coinLogoIcon.classList.toggle("fa-rupee-sign");
}, 4000);
