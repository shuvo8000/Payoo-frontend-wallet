// Register page setup
document.addEventListener("DOMContentLoaded", function () {

    // Redirect if user is already logged in
    redirectIfLoggedIn();

    const form = document.getElementById("registerForm");
    const alertBox = document.getElementById("formAlert");

    const pinInput = document.getElementById("pin");
    const confirmPinInput = document.getElementById("confirmPin");

    const togglePin = document.getElementById("togglePin");
    const toggleConfirmPin = document.getElementById("toggleConfirmPin");

    const pinStrength = document.getElementById("pinStrength");

    const registerPhoto = document.getElementById("registerPhoto");
    const profilePhotoInput = document.getElementById("profilePhotoInput");

    const photoCameraButton = document.getElementById("photoCameraButton");
    const choosePhotoButton = document.getElementById("choosePhotoButton");
    const removePhotoButton = document.getElementById("removePhotoButton");

    let selectedProfilePhoto = "";

    if (!form) {
        return;
    }

    // Open photo selector
    function openPhotoSelector() {
        if (profilePhotoInput) {
            profilePhotoInput.click();
        }
    }

    // Photo camera button
    if (photoCameraButton) {
        photoCameraButton.addEventListener("click", function () {
            openPhotoSelector();
        });
    }

    // Choose photo button
    if (choosePhotoButton) {
        choosePhotoButton.addEventListener("click", function () {
            openPhotoSelector();
        });
    }

    // Select profile photo
    if (profilePhotoInput) {
        profilePhotoInput.addEventListener("change", function () {
            const file = profilePhotoInput.files[0];

            if (!file) {
                return;
            }

            // Check image type
            if (!file.type.startsWith("image/")) {
                showToast("Please select an image file.");
                profilePhotoInput.value = "";
                return;
            }

            // Check image size
            if (file.size > 2 * 1024 * 1024) {
                showToast("Image size must be less than 2 MB.");
                profilePhotoInput.value = "";
                return;
            }

            // Read image
            const reader = new FileReader();

            reader.onload = function () {
                selectedProfilePhoto = reader.result;

                registerPhoto.innerHTML =
                    '<img src="' +
                    selectedProfilePhoto +
                    '" alt="Profile photo preview">';
            };

            reader.readAsDataURL(file);
        });
    }

    // Remove selected photo
    if (removePhotoButton) {
        removePhotoButton.addEventListener("click", function () {
            selectedProfilePhoto = "";

            if (profilePhotoInput) {
                profilePhotoInput.value = "";
            }

            registerPhoto.textContent = "P";

            showToast("Profile photo removed.");
        });
    }

    // Show or hide PIN
    if (togglePin && pinInput) {
        togglePin.addEventListener("click", function () {

            if (pinInput.type === "password") {
                pinInput.type = "text";
                togglePin.textContent = "◌";
                togglePin.title = "Hide PIN";
            } else {
                pinInput.type = "password";
                togglePin.textContent = "◉";
                togglePin.title = "Show PIN";
            }

        });
    }

    // Show or hide confirm PIN
    if (toggleConfirmPin && confirmPinInput) {
        toggleConfirmPin.addEventListener("click", function () {

            if (confirmPinInput.type === "password") {
                confirmPinInput.type = "text";
                toggleConfirmPin.textContent = "◌";
                toggleConfirmPin.title = "Hide PIN";
            } else {
                confirmPinInput.type = "password";
                toggleConfirmPin.textContent = "◉";
                toggleConfirmPin.title = "Show PIN";
            }

        });
    }

    // Check PIN strength
    if (pinInput && pinStrength) {
        pinInput.addEventListener("input", function () {
            const pin = pinInput.value;

            pinStrength.className = "pin-strength";

            if (!pin) {
                pinStrength.textContent = "Enter a 4–6 digit PIN.";
                return;
            }

            if (!/^\d+$/.test(pin)) {
                pinStrength.textContent =
                    "PIN must contain numbers only.";
                pinStrength.classList.add("weak");
                return;
            }

            if (pin.length < 4) {
                pinStrength.textContent = "PIN is too short.";
                pinStrength.classList.add("weak");
                return;
            }

            if (pin.length === 4) {
                pinStrength.textContent = "Basic PIN length.";
                pinStrength.classList.add("medium");
                return;
            }

            pinStrength.textContent = "PIN length is acceptable.";
            pinStrength.classList.add("strong");
        });
    }

    // Register new account
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = form.name.value.trim();
        const mobile = normalizeMobile(form.mobile.value);
        const nid = form.nid.value.trim();
        const dob = form.dob.value;
        const pin = form.pin.value;
        const confirmPin = form.confirmPin.value;

        // Check name
        if (name.length < 2) {
            showAlert(
                alertBox,
                "Please enter your full name."
            );
            return;
        }

        // Check mobile number
        if (!validMobile(mobile)) {
            showAlert(
                alertBox,
                "Enter a valid Bangladesh mobile number."
            );
            return;
        }

        // Check duplicate mobile number
        if (findUserByMobile(mobile)) {
            showAlert(
                alertBox,
                "An account already exists with this mobile number."
            );
            return;
        }

        // Check NID
        if (!nid) {
            showAlert(
                alertBox,
                "Please enter your NID number."
            );
            return;
        }

        // Check date of birth
        if (!dob) {
            showAlert(
                alertBox,
                "Please select your date of birth."
            );
            return;
        }

        // Check PIN
        if (!validPin(pin)) {
            showAlert(
                alertBox,
                "PIN must contain 4 to 6 digits."
            );
            return;
        }

        // Check confirm PIN
        if (pin !== confirmPin) {
            showAlert(
                alertBox,
                "PIN and confirm PIN do not match."
            );
            return;
        }

        // Get existing users
        const users = getUsers();

        // Create new user
        const newUser = {
            name: name,
            mobile: mobile,
            nid: nid,
            dob: dob,
            pin: pin,
            balance: 0
        };

        // Add new user
        users.push(newUser);

        // Save user information
        saveUsers(users);

        // Save profile photo
        if (selectedProfilePhoto) {
            localStorage.setItem(
                "payoo_profile_photo_" + mobile,
                selectedProfilePhoto
            );
        }

        // Show success message
        showAlert(
            alertBox,
            "Account created successfully. Redirecting to login...",
            "success"
        );

        // Clear form
        form.reset();

        // Go to login page
        setTimeout(function () {
            location.href = "index.html";
        }, 1200);
    });
});