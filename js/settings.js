// ==========================================
// MediCare AI - Settings
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // ------------------------------------------
    // Check Login
    // ------------------------------------------

    const isLoggedIn = localStorage.getItem("isLoggedIn");
    const userEmail = localStorage.getItem("userEmail");

    if (isLoggedIn !== "true" || !userEmail) {

        alert("Please login first.");

        window.location.href = "index.html";

        return;
    }


    // ------------------------------------------
    // Get Settings Elements
    // ------------------------------------------

    const switches = document.querySelectorAll(
        '.switch input[type="checkbox"]'
    );

    const notificationSwitch = switches[0];
    const darkModeSwitch = switches[1];

    const languageSelect =
        document.querySelector(".setting-card select");

    const changePasswordButton =
        document.querySelector(".btn");

    const logoutButton =
        document.querySelector(".logout-btn");


    // ==========================================
    // NOTIFICATIONS
    // ==========================================

    const savedNotifications =
        localStorage.getItem("notifications");

    if (savedNotifications !== null) {

        notificationSwitch.checked =
            savedNotifications === "true";
    }


    notificationSwitch.addEventListener(
        "change",
        function () {

            localStorage.setItem(
                "notifications",
                notificationSwitch.checked
            );

            if (notificationSwitch.checked) {

                alert("Notifications enabled 🔔");

            } else {

                alert("Notifications disabled 🔕");
            }

        }
    );


    // ==========================================
    // DARK MODE
    // ==========================================

    const savedDarkMode =
        localStorage.getItem("darkMode");

    if (savedDarkMode === "true") {

        darkModeSwitch.checked = true;

        document.body.classList.add("dark-mode");
    }


    darkModeSwitch.addEventListener(
        "change",
        function () {

            if (darkModeSwitch.checked) {

                document.body.classList.add("dark-mode");

                localStorage.setItem(
                    "darkMode",
                    "true"
                );

            } else {

                document.body.classList.remove(
                    "dark-mode"
                );

                localStorage.setItem(
                    "darkMode",
                    "false"
                );
            }

        }
    );


    // ==========================================
    // LANGUAGE
    // ==========================================

    const savedLanguage =
        localStorage.getItem("language");

    if (savedLanguage) {

        languageSelect.value = savedLanguage;
    }


    languageSelect.addEventListener(
        "change",
        function () {

            localStorage.setItem(
                "language",
                languageSelect.value
            );

            alert(
                "Language selected: " +
                languageSelect.value
            );

        }
    );


    // ==========================================
    // CHANGE PASSWORD
    // ==========================================

   // ==========================================
// CHANGE PASSWORD
// ==========================================

changePasswordButton.addEventListener(
    "click",
    async function () {

        const currentPassword = prompt(
            "Enter your current password:"
        );

        if (currentPassword === null) {
            return;
        }

        const newPassword = prompt(
            "Enter your new password:"
        );

        if (newPassword === null) {
            return;
        }

        const confirmPassword = prompt(
            "Confirm your new password:"
        );

        if (confirmPassword === null) {
            return;
        }

        if (newPassword !== confirmPassword) {

            alert(
                "New password and confirm password do not match."
            );

            return;
        }

        if (newPassword.length < 6) {

            alert(
                "New password must contain at least 6 characters."
            );

            return;
        }

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/api/change-password",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        email: userEmail,

                        current_password:
                            currentPassword,

                        new_password:
                            newPassword
                    })
                }
            );

            const data = await response.json();

            console.log(
                "Change password response:",
                data
            );

            if (
                response.ok &&
                data.status === "success"
            ) {

                alert(
                    "Password changed successfully! 🔐"
                );

            } else {

                alert(
                    data.message ||
                    "Could not change password."
                );
            }

        } catch (error) {

            console.error(
                "Change password error:",
                error
            );

            alert(
                "Cannot connect to Python backend."
            );
        }

    }
); 

    // ==========================================
    // LOGOUT
    // ==========================================

    logoutButton.addEventListener(
        "click",
        function () {

            const confirmLogout = confirm(
                "Are you sure you want to logout?"
            );

            if (!confirmLogout) {
                return;
            }


            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userRole");


            alert("You have been logged out.");


            window.location.href =
                "index.html";

        }
    );

});