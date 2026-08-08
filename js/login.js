// ==========================================
// MediCare AI - Login
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");

    if (!loginForm) {
        console.error("loginForm not found!");
        return;
    }

    loginForm.addEventListener("submit", async function (e) {

        e.preventDefault();

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Check empty fields
        if (email === "" || password === "") {
            alert("Please enter Email and Password.");
            return;
        }

        try {

            console.log("Sending login request...");

            const response = await fetch(
                "http://127.0.0.1:5000/api/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            console.log("Server Response:", data);

            // Login successful
            if (response.ok && data.status === "success") {

                alert("Login Successful!");

                // Save user information
                localStorage.setItem(
                    "userEmail",
                    data.user.email
                );

                localStorage.setItem(
                    "userRole",
                    data.user.role
                );

                localStorage.setItem(
                    "isLoggedIn",
                    "true"
                );

                // Open dashboard
                window.location.href = "home.html";

            } else {

                alert(
                    data.message ||
                    "Invalid Email or Password."
                );
            }

        } catch (error) {

            console.error("LOGIN ERROR:", error);

            alert(
                "Cannot connect to server!\n\n" +
                "Please make sure your Python backend is running."
            );
        }

    });

});