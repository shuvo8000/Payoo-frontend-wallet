// Login page setup
document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("loginForm");
    const alertBox = document.getElementById("formAlert");
    const pinInput = document.getElementById("loginPin");
    const pinToggle = document.getElementById("pinToggle");

    if (!form) {
        return;
    }

    // Show or hide PIN
    if (pinToggle && pinInput) {
        pinToggle.addEventListener("click", function () {

            if (pinInput.type === "password") {
                pinInput.type = "text";
                pinToggle.textContent = "◌";
                pinToggle.title = "Hide PIN";
            } else {
                pinInput.type = "password";
                pinToggle.textContent = "◉";
                pinToggle.title = "Show PIN";
            }

        });
    }

    // Login form
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const mobile = normalizeMobile(form.mobile.value);
        const pin = form.pin.value;

        // Check mobile number
        if (!validMobile(mobile)) {
            showAlert(
                alertBox,
                "Enter a valid Bangladesh mobile number."
            );
            return;
        }

        // Check PIN
        if (!validPin(pin)) {
            showAlert(
                alertBox,
                "Enter a valid 4–6 digit PIN."
            );
            return;
        }

        // Find user
        const user = findUserByMobile(mobile);

        if (!user) {
            showAlert(
                alertBox,
                "No Payoo account found with this mobile number."
            );
            return;
        }

        // Check PIN
        if (!verifyPin(user, pin)) {
            showAlert(
                alertBox,
                "Incorrect mobile number or PIN."
            );
            return;
        }

        // Save logged-in user
        setCurrentMobile(user.mobile);

        showAlert(
            alertBox,
            "Login successful. Redirecting...",
            "success"
        );

        // Disable login button
        const loginButton = form.querySelector(
            "button[type='submit']"
        );

        if (loginButton) {
            loginButton.disabled = true;
        }

        // Go to dashboard
        setTimeout(function () {
            location.href = "dashboard.html";
        }, 500);
    });
});