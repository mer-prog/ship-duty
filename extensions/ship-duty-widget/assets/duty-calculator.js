(function () {
  "use strict";

  var container = document.getElementById("ship-duty-calculator");
  if (!container) return;

  var shop = container.dataset.shop;
  var productPrice = parseFloat(container.dataset.productPrice);
  var countrySelect = document.getElementById("ship-duty-country");
  var calculateBtn = document.getElementById("ship-duty-calculate");
  var resultDiv = document.getElementById("ship-duty-result");
  var errorDiv = document.getElementById("ship-duty-error");

  var priceEl = document.getElementById("ship-duty-price");
  var dutyEl = document.getElementById("ship-duty-duty");
  var shippingEl = document.getElementById("ship-duty-shipping");
  var totalEl = document.getElementById("ship-duty-total");

  function formatCurrency(amount, currency) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency,
      }).format(amount);
    } catch (e) {
      return currency + " " + amount.toFixed(2);
    }
  }

  function showError(message) {
    resultDiv.style.display = "none";
    errorDiv.style.display = "block";
    errorDiv.textContent = message;
  }

  function showResult(data) {
    errorDiv.style.display = "none";
    resultDiv.style.display = "block";

    var currency = data.currency || "JPY";
    priceEl.textContent = formatCurrency(data.productPrice, currency);
    dutyEl.textContent = formatCurrency(data.duty.amount, currency);
    shippingEl.textContent = formatCurrency(data.shipping.rate, currency);
    totalEl.textContent = formatCurrency(data.totalEstimate, currency);
  }

  calculateBtn.addEventListener("click", function () {
    var countryCode = countrySelect.value;
    if (!countryCode) {
      showError("Please select a destination country.");
      return;
    }

    calculateBtn.disabled = true;
    calculateBtn.textContent = "Calculating...";
    errorDiv.style.display = "none";
    resultDiv.style.display = "none";

    var apiUrl = "/api/calculate";

    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shop: shop,
        countryCode: countryCode,
        productPrice: productPrice,
      }),
    })
      .then(function (response) {
        if (!response.ok) {
          return response.json().then(function (err) {
            throw new Error(err.error || "Calculation failed");
          });
        }
        return response.json();
      })
      .then(function (data) {
        showResult(data);
      })
      .catch(function (err) {
        showError(err.message || "An error occurred. Please try again.");
      })
      .finally(function () {
        calculateBtn.disabled = false;
        calculateBtn.textContent =
          container.querySelector(".ship-duty__button")?.dataset
            .originalText || "Calculate";
      });
  });

  // Store original button text
  calculateBtn.dataset.originalText = calculateBtn.textContent.trim();
})();
