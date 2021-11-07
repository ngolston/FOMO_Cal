var stocksSwitch = document.querySelector('.stockBtn');
var cryptoSwitch = document.querySelector('.cryptoBtn')
var stocksQuestions = document.querySelector(".stocks");
var cryptoQuestions = document.querySelector(".crypto");
var otherQuestions = document.querySelector(".otherQuestions");
var stockCalBtn = document.querySelector('.stockCalBtn');
var cryptoCalBtn = document.querySelector('.cryptoCalBtn');

// Methods to swap between stock and crypto currency drop downs and submit buttons
var stockBtn
stocksSwitch.addEventListener("click", function() {
    stocksSwitch.children[0].classList = "button is-primary"
    cryptoSwitch.children[0].classList = "button is-primary is-inverted"

    cryptoQuestions.style.display = "none";
    stocksQuestions.style.display = "block";
    otherQuestions.style.display = "block";
	stockCalBtn.style.display = "block";
    cryptoCalBtn.style.display = "none";
});

var cryptoBtn
cryptoSwitch.addEventListener("click", function() {
    stocksSwitch.children[0].classList = "button is-primary is-inverted"
    cryptoSwitch.children[0].classList = "button is-primary"

    cryptoQuestions.style.display = "block";
    stocksQuestions.style.display = "none";
    otherQuestions.style.display = "block";
    stockCalBtn.style.display = "none";
    cryptoCalBtn.style.display = "block";
   
});
