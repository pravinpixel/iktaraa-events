let currentEventKey = null;

const posterEl = document.getElementById("eventPoster");
const nameEl = document.getElementById("eventName");
const priceEl = document.getElementById("eventPrice");
const paymentForm = document.getElementById("paymentForm");
const descriptionEl = document.getElementById("description");

// Load form
fetch("fields.html")
  .then(res => res.text())
  .then(html => {
    document.getElementById("formContainer").innerHTML = html;

  populateEventDropdown();
  initFormLogic();

  })
  .catch(err => {
    console.error("Failed to load form:", err);
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
  priceEl.textContent = event.price || "";
  descriptionEl.textContent = event.description || "";

  const presentText = document.getElementById("presentText");
  if (presentText) presentText.remove();

  const payBtn = document.getElementById("payNowBtn");

  if (!event.price || event.price === "0" || event.price === 0) {
    paymentForm.innerHTML = "";
    payBtn.textContent = "Submit";
  } else {
    payBtn.textContent = "Proceed to Pay";
    paymentForm.innerHTML = "";
  }

  validateForm();
}

function initFormLogic() {
  const payBtn = document.getElementById("payNowBtn");
  const mobileInput = document.getElementById("mobile");

  mobileInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
  });

  document.addEventListener("input", validateForm);
  document.addEventListener("change", validateForm);

  payBtn.addEventListener("click", submitForm);

  validateForm();
}

function validateForm() {
  const payBtn = document.getElementById("payNowBtn");

  const eventSelected = document.getElementById("eventSelect")?.value || "";
  const name = document.getElementById("name")?.value.trim() || "";
  const email = document.getElementById("email")?.value.trim() || "";
  const mobile = document.getElementById("mobile")?.value.trim() || "";

  const attended = document.querySelector(
    'input[name="attended"]:checked'
  );

  const source = document.querySelector(
    'input[name="source"]:checked'
  );

  const emailError = document.getElementById("emailError");
  const mobileError = document.getElementById("mobileError");

  const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
  const mobileRegex = /^[6-9]\d{9}$/;

  if (emailError) {
    emailError.textContent =
      email && !emailRegex.test(email)
        ? "Please enter a valid email address"
        : "";
  }

  if (mobileError) {
    mobileError.textContent =
      mobile && !mobileRegex.test(mobile)
        ? "Please enter a valid 10-digit mobile number"
        : "";
  }

  const isValid =
    currentEventKey &&
    eventSelected &&
    name &&
    emailRegex.test(email) &&
    mobileRegex.test(mobile) &&
    attended &&
    source;

  payBtn.disabled = !isValid;
}

function showPaymentButton() {
  const paymentSection = document.getElementById("paymentSection");

  paymentSection.style.display = "block";
  paymentForm.innerHTML = "";

  const script = document.createElement("script");

  script.src =
    "https://checkout.razorpay.com/v1/payment-button.js";

  script.async = true;

  script.setAttribute(
    "data-payment_button_id",
    EVENTS[currentEventKey].paymentBtnId
  );

  paymentForm.appendChild(script);
}

function submitForm() {
  const payBtn = document.getElementById("payNowBtn");

  const email = document.getElementById("email").value.trim();
  const mobile = document.getElementById("mobile").value.trim();

  const emailRegex = /^[^\s@]+@[^\s@]+.[^\s@]+$/;
  const mobileRegex = /^[6-9]\d{9}$/;

  if (!emailRegex.test(email)) {
    showToast("Please enter a valid email address", "error");
    return;
  }

  if (!mobileRegex.test(mobile)) {
    showToast("Please enter a valid mobile number", "error");
    return;
  }

  payBtn.disabled = true;

  const event = EVENTS[currentEventKey];

  const data = {
    eventName: event.name,
    name: document.getElementById("name").value,
    email,
    mobile,
    attendedBefore:
      document.querySelector(
        'input[name="attended"]:checked'
      ).value,
    source:
      document.querySelector(
        'input[name="source"]:checked'
      ).value
  };

  fetch(
    "https://script.google.com/macros/s/AKfycbxVX0irwZzY2RaPErJulNsLJ2g3pGKi2QMXumYrAvF216EI50mtilZQQ5SfqT4LXzRuwg/exec",
    {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    }
  )
    .then(() => {
      if (!event.price || event.price === "0" || event.price === 0) {
        showToast(
          "Thank you for your registration! 🎉",
          "success"
        );

    payBtn.textContent = "Registered";
    payBtn.disabled = true;

    document.getElementById(
          "paymentSection"
        ).style.display = "none";
      } else {
        showToast(
          "Details saved successfully! Please proceed to payment 💳",
          "success"
        );

        showPaymentButton();
      }
    })
    .catch(() => {
      showToast(
        "Network error. Please try again ❌",
        "error"
      );

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
