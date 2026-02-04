let currentEventKey = null;

const posterEl = document.getElementById("eventPoster");
const nameEl = document.getElementById("eventName");
const priceEl = document.getElementById("eventPrice");
const paymentForm = document.getElementById("paymentForm");

fetch("fields.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("formContainer").innerHTML = html;
    populateEventDropdown();
    initFormLogic();
  });


function populateEventDropdown() {
  const select = document.getElementById("eventSelect");

  Object.values(EVENTS).forEach(event => {
    const option = document.createElement("option");
    option.value = event.id;
    option.textContent = event.name;
    select.appendChild(option);
  });

  select.addEventListener("change", e => {
    loadEvent(e.target.value);
  });
}


function loadEvent(eventKey) {
  if (!eventKey) return;

  const event = EVENTS[eventKey];
  currentEventKey = eventKey;

  posterEl.src = event.poster;
  nameEl.textContent = event.name;
  priceEl.textContent = event.price;

  const presentText = document.getElementById("presentText");
  if (presentText) presentText.remove();

  paymentForm.innerHTML = `
    <script
      src="https://checkout.razorpay.com/v1/payment-button.js"
      data-payment_button_id="${event.paymentBtnId}"
      async>
    <\/script>
  `;
}


Object.keys(EVENTS).forEach(key => {
  const btn = document.createElement("button");
  btn.textContent = EVENTS[key].name;
  btn.dataset.event = key;
  btn.onclick = () => loadEvent(key);
  tabsEl.appendChild(btn);
});

loadEvent(currentEventKey);

// ---------------- FORM LOGIC ----------------

function initFormLogic() {
  const inputs = document.querySelectorAll("input, select");
  const payBtn = document.getElementById("payNowBtn");

  function checkFormValidity() {
    const eventSelected = document.getElementById("eventSelect").value;
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const attended = document.querySelector('input[name="attended"]:checked');
    const source = document.querySelector('input[name="source"]:checked');

    payBtn.disabled = !(
      eventSelected &&
      name &&
      email &&
      mobile &&
      attended &&
      source
    );
  }

  inputs.forEach(el => {
    el.addEventListener("input", checkFormValidity);
    el.addEventListener("change", checkFormValidity);
  });

  payBtn.addEventListener("click", submitForm);
}

function showPaymentButton() {

  const paymentSection = document.getElementById("paymentSection");
  const paymentForm = document.getElementById("paymentForm");

  if (!paymentForm) {
    console.error("paymentForm not found");
    return;
  }

  paymentSection.style.display = "block";

  paymentForm.innerHTML = "";

  const script = document.createElement("script");
  script.src = "https://checkout.razorpay.com/v1/payment-button.js";
  script.async = true;
  script.setAttribute(
    "data-payment_button_id",
    EVENTS[currentEventKey].paymentBtnId
  );

  paymentForm.appendChild(script);
}


function submitForm() {
  const payBtn = document.getElementById("payNowBtn");
  payBtn.disabled = true;

  const data = {
    eventName: EVENTS[currentEventKey].name,
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    mobile: document.getElementById("mobile").value,
    attendedBefore: document.querySelector('input[name="attended"]:checked').value,
    source: document.querySelector('input[name="source"]:checked').value
  };

  fetch("https://script.google.com/macros/s/AKfycbxVX0irwZzY2RaPErJulNsLJ2g3pGKi2QMXumYrAvF216EI50mtilZQQ5SfqT4LXzRuwg/exec", {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  })
  .then(() => {
    showPaymentButton();
    // alert("Details saved successfully! Please proceed to payment.");
    showToast("Details saved successfully! Please proceed to payment 💳", "success");

  })
  .catch(() => {
    // alert("Network error. Please try again.");
    showToast("Network error. Please try again ❌", "error");

    payBtn.disabled = false;
  });
}


function showToast(message, type = "success", duration = 3000) {
  const toast = document.getElementById("toast");

  toast.textContent = message;
  toast.className = `toast show ${type}`;

  setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

