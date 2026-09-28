// Profile page setup
document.addEventListener("DOMContentLoaded", function () {

    const user = setupShell("profile");

    if (!user) {
        return;
    }

    let currentUser = getCurrentUser();

    const profilePhoto =
        document.getElementById("profilePhoto");

    const profileHeaderName =
        document.getElementById("profileHeaderName");

    const profileHeaderMobile =
        document.getElementById("profileHeaderMobile");

    const profileName =
        document.getElementById("profileName");

    const profileMobile =
        document.getElementById("profileMobile");

    const profileNid =
        document.getElementById("profileNid");

    const profileDob =
        document.getElementById("profileDob");

    const profileBalance =
        document.getElementById("profileBalance");

    const copyAccount =
        document.getElementById("copyAccount");

    const editProfileButton =
        document.getElementById("editProfileButton");

    const cancelEditButton =
        document.getElementById("cancelEditButton");

    const editSection =
        document.getElementById("editSection");

    const editProfileForm =
        document.getElementById("editProfileForm");

    const profileAlert =
        document.getElementById("profileAlert");

    const changePinButton =
        document.getElementById("changePinButton");

    const cancelPinButton =
        document.getElementById("cancelPinButton");

    const pinSection =
        document.getElementById("pinSection");

    const changePinForm =
        document.getElementById("changePinForm");

    const pinAlert =
        document.getElementById("pinAlert");

    const photoInput =
        document.getElementById("photoInput");

    const photoEditButton =
        document.getElementById("photoEditButton");

    const uploadPhotoButton =
        document.getElementById("uploadPhotoButton");

    const removePhotoButton =
        document.getElementById("removePhotoButton");

    const photoKey =
        "payoo_profile_photo_" +
        currentUser.mobile;

    // Show profile information
    function renderProfile() {

        currentUser = getCurrentUser();

        if (!currentUser) {
            return;
        }

        profileHeaderName.textContent =
            currentUser.name || "-";

        profileHeaderMobile.textContent =
            currentUser.mobile || "-";

        profileName.textContent =
            currentUser.name || "-";

        profileMobile.textContent =
            currentUser.mobile || "-";

        profileNid.textContent =
            currentUser.nid || "-";

        profileDob.textContent =
            currentUser.dob || "-";

        profileBalance.textContent =
            money(currentUser.balance);

        renderProfilePhoto();
    }

    // Show profile photo
    function renderProfilePhoto() {

        const savedPhoto =
            localStorage.getItem(photoKey);

        if (savedPhoto) {

            profilePhoto.innerHTML =
                '<img src="' +
                savedPhoto +
                '" alt="Profile photo">';

            return;
        }

        profilePhoto.textContent =
            initials(currentUser.name);
    }

    // Open photo selector
    function openPhotoSelector() {

        if (photoInput) {
            photoInput.click();
        }
    }

    // Edit profile photo
    if (photoEditButton) {
        photoEditButton.addEventListener(
            "click",
            openPhotoSelector
        );
    }

    // Upload profile photo
    if (uploadPhotoButton) {
        uploadPhotoButton.addEventListener(
            "click",
            openPhotoSelector
        );
    }

    // Select profile photo
    if (photoInput) {

        photoInput.addEventListener(
            "change",
            function () {

                const file =
                    photoInput.files[0];

                if (!file) {
                    return;
                }

                // Check image type
                if (!file.type.startsWith("image/")) {

                    showToast(
                        "Please select an image file."
                    );

                    photoInput.value = "";

                    return;
                }

                // Check image size
                if (file.size > 2 * 1024 * 1024) {

                    showToast(
                        "Image size must be less than 2 MB."
                    );

                    photoInput.value = "";

                    return;
                }

                // Read image
                const reader =
                    new FileReader();

                reader.onload =
                    function () {

                        localStorage.setItem(
                            photoKey,
                            reader.result
                        );

                        renderProfilePhoto();

                        showToast(
                            "Profile photo updated."
                        );
                    };

                reader.readAsDataURL(file);
            }
        );
    }

    // Remove profile photo
    if (removePhotoButton) {

        removePhotoButton.addEventListener(
            "click",
            function () {

                const savedPhoto =
                    localStorage.getItem(photoKey);

                if (!savedPhoto) {

                    showToast(
                        "No profile photo to remove."
                    );

                    return;
                }

                localStorage.removeItem(
                    photoKey
                );

                renderProfilePhoto();

                showToast(
                    "Profile photo removed."
                );
            }
        );
    }

    // Open edit profile section
    if (editProfileButton) {

        editProfileButton.addEventListener(
            "click",
            function () {

                const userData =
                    getCurrentUser();

                if (!userData) {
                    return;
                }

                editProfileForm.name.value =
                    userData.name || "";

                editProfileForm.mobile.value =
                    userData.mobile || "";

                editProfileForm.nid.value =
                    userData.nid || "";

                editProfileForm.dob.value =
                    userData.dob || "";

                profileAlert.innerHTML = "";

                editSection.classList.add("active");

                editProfileButton.style.display =
                    "none";
            }
        );
    }

    // Cancel profile editing
    if (cancelEditButton) {

        cancelEditButton.addEventListener(
            "click",
            function () {

                editSection.classList.remove(
                    "active"
                );

                editProfileButton.style.display =
                    "inline-flex";

                editProfileForm.reset();

                profileAlert.innerHTML = "";
            }
        );
    }

    // Update profile
    if (editProfileForm) {

        editProfileForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const userData =
                    getCurrentUser();

                if (!userData) {
                    return;
                }

                const name =
                    editProfileForm.name.value.trim();

                const nid =
                    editProfileForm.nid.value.trim();

                const dob =
                    editProfileForm.dob.value;

                // Check name
                if (name.length < 2) {

                    showAlert(
                        profileAlert,
                        "Please enter a valid full name."
                    );

                    return;
                }

                // Check NID
                if (!nid) {

                    showAlert(
                        profileAlert,
                        "Please enter your NID number."
                    );

                    return;
                }

                // Check date of birth
                if (!dob) {

                    showAlert(
                        profileAlert,
                        "Please select your date of birth."
                    );

                    return;
                }

                // Update editable information
                userData.name = name;
                userData.nid = nid;
                userData.dob = dob;

                const updatedUser =
                    updateUser(userData);

                if (!updatedUser) {

                    showAlert(
                        profileAlert,
                        "Unable to update your profile."
                    );

                    return;
                }

                renderProfile();

                showAlert(
                    profileAlert,
                    "Profile updated successfully.",
                    "success"
                );

                // Close edit section
                setTimeout(
                    function () {

                        editSection.classList.remove(
                            "active"
                        );

                        editProfileButton.style.display =
                            "inline-flex";

                        profileAlert.innerHTML = "";
                    },
                    1200
                );
            }
        );
    }

    // Copy account number
    if (copyAccount) {

        copyAccount.addEventListener(
            "click",
            function () {

                const userData =
                    getCurrentUser();

                if (userData) {
                    copyText(userData.mobile);
                }
            }
        );
    }

    // Open change PIN section
    if (changePinButton) {

        changePinButton.addEventListener(
            "click",
            function () {

                pinSection.classList.add(
                    "active"
                );

                changePinButton.style.display =
                    "none";

                pinAlert.innerHTML = "";
            }
        );
    }

    // Cancel PIN change
    if (cancelPinButton) {

        cancelPinButton.addEventListener(
            "click",
            function () {

                pinSection.classList.remove(
                    "active"
                );

                changePinButton.style.display =
                    "inline-flex";

                changePinForm.reset();

                pinAlert.innerHTML = "";
            }
        );
    }

    // Change PIN
    if (changePinForm) {

        changePinForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                const userData =
                    getCurrentUser();

                if (!userData) {
                    return;
                }

                const currentPin =
                    changePinForm.currentPin.value;

                const newPin =
                    changePinForm.newPin.value;

                const confirmPin =
                    changePinForm.confirmPin.value;

                // Check current PIN
                if (
                    !verifyPin(
                        userData,
                        currentPin
                    )
                ) {

                    showAlert(
                        pinAlert,
                        "Current PIN is incorrect."
                    );

                    return;
                }

                // Check new PIN
                if (!validPin(newPin)) {

                    showAlert(
                        pinAlert,
                        "New PIN must contain 4 to 6 digits."
                    );

                    return;
                }

                // Check confirm PIN
                if (newPin !== confirmPin) {

                    showAlert(
                        pinAlert,
                        "New PIN and confirm PIN do not match."
                    );

                    return;
                }

                // Prevent same PIN
                if (currentPin === newPin) {

                    showAlert(
                        pinAlert,
                        "New PIN must be different from your current PIN."
                    );

                    return;
                }

                // Update PIN
                userData.pin = newPin;

                const updatedUser =
                    updateUser(userData);

                if (!updatedUser) {

                    showAlert(
                        pinAlert,
                        "Unable to update your PIN."
                    );

                    return;
                }

                changePinForm.reset();

                showAlert(
                    pinAlert,
                    "PIN changed successfully.",
                    "success"
                );

                // Close PIN section
                setTimeout(
                    function () {

                        pinSection.classList.remove(
                            "active"
                        );

                        changePinButton.style.display =
                            "inline-flex";

                        pinAlert.innerHTML = "";
                    },
                    1500
                );
            }
        );
    }

    // Initial profile display
    renderProfile();
});