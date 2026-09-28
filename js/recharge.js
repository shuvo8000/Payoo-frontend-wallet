// Mobile Recharge page setup
document.addEventListener("DOMContentLoaded", function () {

    const user = setupShell("mobile-recharge");

    if (!user) {
        return;
    }

    const form =
        document.getElementById("rechargeForm");

    const alertBox =
        document.getElementById("formAlert");

    const mobileInput =
        form.mobile;

    const operatorInput =
        form.operator;

    const rechargeTypeInput =
        form.rechargeType;

    const amountInput =
        form.amount;

    const pinInput =
        form.pin;

    const togglePin =
        document.getElementById("togglePin");

    // Show or hide PIN
    if (togglePin && pinInput) {

        togglePin.addEventListener(
            "click",
            function () {

                if (pinInput.type === "password") {

                    pinInput.type = "text";
                    togglePin.textContent = "◌";
                    togglePin.title = "Hide PIN";

                } else {

                    pinInput.type = "password";
                    togglePin.textContent = "◉";
                    togglePin.title = "Show PIN";
                }
            }
        );
    }

    // Mobile Recharge form
    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const currentUser =
                getCurrentUser();

            if (!currentUser) {
                return;
            }

            const mobile =
                normalizeMobile(
                    mobileInput.value
                );

            const operator =
                operatorInput.value;

            const rechargeType =
                rechargeTypeInput.value;

            const amount =
                Number(amountInput.value);

            const pin =
                pinInput.value;

            // Validate mobile number
            if (!validMobile(mobile)) {

                showAlert(
                    alertBox,
                    "Enter a valid Bangladesh mobile number."
                );

                return;
            }

            // Validate recharge amount
            if (
                !validAmount(
                    amount,
                    LIMITS.rechargeMin,
                    LIMITS.rechargeMax
                )
            ) {

                showAlert(
                    alertBox,
                    "Recharge amount must be between " +
                    money(LIMITS.rechargeMin) +
                    " and " +
                    money(LIMITS.rechargeMax) +
                    "."
                );

                return;
            }

            // Check wallet balance
            if (
                Number(currentUser.balance) <
                amount
            ) {

                showAlert(
                    alertBox,
                    "Insufficient balance. Your available balance is " +
                    money(currentUser.balance) +
                    "."
                );

                return;
            }

            // Check PIN
            if (!verifyPin(currentUser, pin)) {

                showAlert(
                    alertBox,
                    "Incorrect Payoo PIN."
                );

                return;
            }

            // Deduct recharge amount
            const updatedUser =
                updateBalance(
                    currentUser.mobile,
                    -amount
                );

            if (!updatedUser) {

                showAlert(
                    alertBox,
                    "Unable to update your wallet balance."
                );

                return;
            }

            // Save recharge transaction
            addTransaction({
                type: "mobile_recharge",
                account: currentUser.mobile,
                mobile: mobile,
                amount: amount,
                fee: 0,
                operator: operator,
                rechargeType: rechargeType,
                balanceAfter: updatedUser.balance
            });

            // Clear form
            form.reset();

            // Show success message
            showAlert(
                alertBox,
                money(amount) +
                " recharge successful for " +
                mobile +
                ".",
                "success"
            );
        }
    );
});