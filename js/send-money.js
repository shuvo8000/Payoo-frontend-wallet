// Send Money page setup
document.addEventListener("DOMContentLoaded", function () {

    const user = setupShell("send-money");

    if (!user) {
        return;
    }

    const form = document.getElementById("sendMoneyForm");
    const alertBox = document.getElementById("formAlert");

    const recipientInput =
        document.getElementById("recipient");

    const recipientStatus =
        document.getElementById("recipientStatus");

    const recipientAvatar =
        document.getElementById("recipientAvatar");

    const recipientName =
        document.getElementById("recipientName");

    const recipientMobile =
        document.getElementById("recipientMobile");

    const amountInput =
        document.getElementById("amount");

    const pinInput =
        document.getElementById("pin");

    const currentBalance =
        document.getElementById("currentBalance");

    const togglePin =
        document.getElementById("togglePin");

    let recipientUser = null;

    // Show current balance
    function renderBalance() {

        const currentUser = getCurrentUser();

        if (!currentUser || !currentBalance) {
            return;
        }

        currentBalance.textContent =
            money(currentUser.balance);
    }

    // Clear recipient information
    function clearRecipient() {

        recipientUser = null;

        if (recipientStatus) {
            recipientStatus.classList.remove("active");
        }

        if (recipientName) {
            recipientName.textContent = "Recipient";
        }

        if (recipientMobile) {
            recipientMobile.textContent = "";
        }

        if (recipientAvatar) {
            recipientAvatar.textContent = "P";
        }
    }

    // Find recipient
    function findRecipient() {

        const mobile =
            normalizeMobile(recipientInput.value);

        clearRecipient();

        if (!mobile) {
            return;
        }

        if (!validMobile(mobile)) {
            return;
        }

        const currentUser = getCurrentUser();

        // Prevent sending money to yourself
        if (
            currentUser &&
            mobile === currentUser.mobile
        ) {

            showAlert(
                alertBox,
                "You cannot send money to your own account."
            );

            return;
        }

        // Find registered user
        const foundUser =
            findUserByMobile(mobile);

        if (!foundUser) {

            showAlert(
                alertBox,
                "No registered Payoo account found with this mobile number."
            );

            return;
        }

        // Save recipient
        recipientUser = foundUser;

        recipientName.textContent =
            foundUser.name;

        recipientMobile.textContent =
            foundUser.mobile;

        recipientAvatar.textContent =
            initials(foundUser.name);

        recipientStatus.classList.add("active");

        alertBox.innerHTML = "";
    }

    // Find recipient when input loses focus
    if (recipientInput) {
        recipientInput.addEventListener(
            "blur",
            findRecipient
        );

        // Clear old recipient when number changes
        recipientInput.addEventListener(
            "input",
            function () {

                clearRecipient();

                if (alertBox) {
                    alertBox.innerHTML = "";
                }
            }
        );
    }

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

    // Send Money form
    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const currentUser =
                getCurrentUser();

            if (!currentUser) {
                return;
            }

            const recipientMobileValue =
                normalizeMobile(
                    recipientInput.value
                );

            const amount =
                Number(amountInput.value);

            const pin =
                pinInput.value;

            // Validate recipient mobile
            if (!validMobile(recipientMobileValue)) {

                showAlert(
                    alertBox,
                    "Enter a valid Bangladesh mobile number."
                );

                return;
            }

            // Prevent self transfer
            if (
                recipientMobileValue ===
                currentUser.mobile
            ) {

                showAlert(
                    alertBox,
                    "You cannot send money to your own account."
                );

                return;
            }

            // Find recipient again
            recipientUser =
                findUserByMobile(
                    recipientMobileValue
                );

            if (!recipientUser) {

                showAlert(
                    alertBox,
                    "No registered Payoo account found with this mobile number."
                );

                return;
            }

            // Validate amount
            if (
                !validAmount(
                    amount,
                    LIMITS.sendMin,
                    LIMITS.sendMax
                )
            ) {

                showAlert(
                    alertBox,
                    "Amount must be between " +
                    money(LIMITS.sendMin) +
                    " and " +
                    money(LIMITS.sendMax) +
                    "."
                );

                return;
            }

            // Check balance
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

            // Deduct money from sender
            const senderBalance =
                updateBalance(
                    currentUser.mobile,
                    -amount
                );

            if (!senderBalance) {

                showAlert(
                    alertBox,
                    "Unable to update sender balance."
                );

                return;
            }

            // Add money to receiver
            const receiverBalance =
                updateBalance(
                    recipientUser.mobile,
                    amount
                );

            // Roll back sender balance if receiver update fails
            if (!receiverBalance) {

                updateBalance(
                    currentUser.mobile,
                    amount
                );

                showAlert(
                    alertBox,
                    "Unable to update recipient balance."
                );

                return;
            }

            // Create sender transaction
            addTransaction({
                type: "send_money",
                sender: currentUser.mobile,
                senderName: currentUser.name,
                recipient: recipientUser.mobile,
                recipientName: recipientUser.name,
                amount: amount,
                fee: 0,
                balanceAfter: senderBalance.balance
            });

            // Create receiver transaction
            addTransaction({
                type: "received_money",
                sender: currentUser.mobile,
                senderName: currentUser.name,
                recipient: recipientUser.mobile,
                recipientName: recipientUser.name,
                amount: amount,
                fee: 0,
                balanceAfter: receiverBalance.balance
            });

            // Clear form
            form.reset();

            clearRecipient();

            // Update balance
            renderBalance();

            // Success message
            showAlert(
                alertBox,
                money(amount) +
                " sent successfully to " +
                recipientUser.name +
                ".",
                "success"
            );
        }
    );

    // Initial setup
    amountInput.value = "";
    pinInput.value = "";

    clearRecipient();
    renderBalance();
});