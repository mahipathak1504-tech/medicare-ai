// ==========================================
// MediCare AI - Dashboard
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    console.log("Dashboard loaded");

    // ------------------------------------------
    // Get logged-in user
    // ------------------------------------------

    const userEmail = localStorage.getItem("userEmail");
  // ==========================================
// LOAD USER PROFILE
// ==========================================

async function loadProfile() {

    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        return;
    }

    try {

        const response = await fetch(
            `https://medicare-ai-2026.onrender.com/api/profile/${encodeURIComponent(userEmail)}`
        );

        const data = await response.json();

        console.log("Profile response:", data);

        if (response.ok && data.status === "success") {

            const profile = data.profile;

            console.log("User Profile:", profile);

            // Show name if profile exists
            if (profile.name) {

                const welcomeText = document.querySelector(".main h1");

                if (welcomeText) {

                    welcomeText.innerHTML =
                        "Welcome, " + profile.name + " 👋";
                }
            }

        } else {

            console.log("Profile not found:", data.message);
        }

    } catch (error) {

        console.error("Profile Error:", error);
    }
}


// Load profile
loadProfile();  
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    // If user is not logged in, go to login page
    if (isLoggedIn !== "true" || !userEmail) {

        alert("Please login first.");

        window.location.href = "index.html";

        return;
    }


    // ------------------------------------------
    // Show user's email
    // ------------------------------------------
async function loadDashboardProfile() {

    const userEmail = localStorage.getItem("userEmail");

    if (!userEmail) {
        return;
    }

    try {

        const response = await fetch(
            `https://medicare-ai-2026.onrender.com/api/profile/${encodeURIComponent(userEmail)}`
        );

        const data = await response.json();

        console.log("Dashboard profile:", data);

        if (response.ok && data.status === "success") {

            const profile = data.profile;

            const welcomeText =
                document.querySelector(".main h1");

            if (welcomeText) {

                if (profile.name) {

                    welcomeText.innerHTML =
                        "Welcome, " + profile.name + " 👋";

                } else {

                    welcomeText.innerHTML =
                        "Welcome, " + userEmail + " 👋";
                }
            }
        }

    } catch (error) {

        console.error(
            "Dashboard profile error:",
            error
        );
    }
}

loadDashboardProfile();
    

    // ------------------------------------------
    // Medicine Taken button
    // ------------------------------------------

    const takenButton = document.querySelector(".taken-btn");

    if (takenButton) {

        takenButton.addEventListener("click", function () {

            takenButton.innerText = "Taken ✓";

            takenButton.style.background = "#16a34a";

            alert("Medicine marked as Taken.");
        });
    }


    // ------------------------------------------
    // Pending Medicine button
    // ------------------------------------------

    const pendingButton = document.querySelector(".pending-btn");

    if (pendingButton) {

        pendingButton.addEventListener("click", function () {

            alert("Medicine is still Pending.");
        });
    }


    // ------------------------------------------
    // Appointment View Details
    // ------------------------------------------

    const viewButton = document.querySelector(".view-btn");

    if (viewButton) {

        viewButton.addEventListener("click", function () {

            alert(
                "Appointment Details\n\n" +
                "Doctor: Dr. Raj Patel\n" +
                "Date: 12 August 2026\n" +
                "Time: 10:30 AM"
            );

        });
    }


    // ------------------------------------------
    // Emergency SOS
    // ------------------------------------------

    const sosButton = document.querySelector(".sos-btn");

    if (sosButton) {

        sosButton.addEventListener("click", function () {

            const confirmSOS = confirm(
                "Are you sure you want to activate Emergency SOS?"
            );

            if (confirmSOS) {

                alert(
                    "🚑 Emergency SOS Activated!\n\n" +
                    "Emergency help request has been initiated."
                );

            }

        });
    }


    // ------------------------------------------
    // Logout
    // ------------------------------------------

    const logoutLink = document.querySelector(
        'a[href="logout.html"]'
    );

    if (logoutLink) {

        logoutLink.addEventListener("click", function (e) {

            e.preventDefault();

            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userRole");

            alert("You have been logged out.");

            window.location.href = "index.html";

        });
    }

});

// ==========================================
// LOGOUT
// ==========================================

const sidebarLinks = document.querySelectorAll("a");

sidebarLinks.forEach(function (link) {

    const text = link.innerText.trim().toLowerCase();

    if (text === "logout") {

        link.addEventListener("click", function (e) {

            e.preventDefault();

            const confirmLogout = confirm(
                "Are you sure you want to logout?"
            );

            if (!confirmLogout) {
                return;
            }

            // Remove login information
            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("userEmail");
            localStorage.removeItem("userRole");

            alert("You have been logged out.");

            // Go to login page
            window.location.href = "index.html";

        });
    }
});