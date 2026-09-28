// Change PIN page setup
document.addEventListener("DOMContentLoaded", function () {

    const user = setupShell("change-pin");

    if (!user) {
        return;
    }

    const form =
        document.getElementById("changePinForm");

    const alertBox =
        document.getElementById("formAlert");

    const currentPin =
        document.getElementById("currentPin");

    const newPin =
        document.getElementById("newPin");

    const confirmPin =
        document.getElementById("confirmPin");

    if (!form) {
        return;
    }

    // Change PIN form
    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const currentUser =
                getCurrentUser();

            if (!currentUser) {
                return;
            }

            const oldPin =
                currentPin.value;

            const newPinValue =
                newPin.value;

            const confirmPinValue =
                confirmPin.value;

            // Check current PIN
            if (
                !verifyPin(
                    currentUser,
                    oldPin
                )
            ) {

                showAlert(
                    alertBox,
                    "Current PIN is incorrect."
                );

                return;
            }

            // Check new PIN
            if (!validPin(newPinValue)) {

                showAlert(
                    alertBox,
                    "New PIN must contain 4 to 6 digits."
                );

                return;
            }

            // Check confirm PIN
            if (
                newPinValue !==
                confirmPinValue
            ) {

                showAlert(
                    alertBox,
                    "New PIN and confirmation do not match."
                );

                return;
            }

            // Prevent using the same PIN
            if (
                oldPin ===
                newPinValue
            ) {

                showAlert(
                    alertBox,
                    "New PIN must be different from your current PIN."
                );

                return;
            }

            // Update PIN
            currentUser.pin =
                newPinValue;

            const updatedUser =
                updateUser(currentUser);

            if (!updatedUser) {

                showAlert(
                    alertBox,
                    "Unable to update your PIN."
                );

                return;
            }

            // Clear form
            form.reset();

            // Show success message
            showAlert(
                alertBox,
                "PIN changed successfully.",
                "success"
            );
        }
    );
});