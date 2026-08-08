// ==========================================
// MediCare AI - Registration
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("registerForm");

    if (!form) {
        console.error("registerForm not found!");
        return;
    }

    form.addEventListener("submit", async function (e) {

        e.preventDefault();

        // Get all input fields
        const inputs = form.querySelectorAll("input");

        const name = inputs[0].value.trim();
        const email = inputs[1].value.trim();
        const phone = inputs[2].value.trim();
        const password = inputs[3].value;
        const confirmPassword = inputs[4].value;


        // ==========================================
        // VALIDATION
        // ==========================================

        if (!name || !email || !phone || !password || !confirmPassword) {

            alert("Please fill all fields.");
            return;
        }


        if (password !== confirmPassword) {

            alert("Password and Confirm Password do not match.");
            return;
        }


        if (password.length < 6) {

            alert("Password must contain at least 6 characters.");
            return;
        }


        // ==========================================
        // SEND DATA TO PYTHON
        // ==========================================

        try {

            console.log("Sending registration request...");

            const response = await fetch(
                "https://medicare-ai-2026.onrender.com/api/register",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password,
                        role: "patient"
                    })
                }
            );


            const data = await response.json();

            console.log("Backend response:", data);


            // ==========================================
            // REGISTRATION SUCCESS
            // ==========================================

            if (response.ok && data.status === "success") {

                alert(
                    "Registration Successful!\n\n" +
                    "Now you can login."
                );

                // Go to login page
                window.location.href = "index.html";

                return;
            }


            // ==========================================
            // USER ALREADY EXISTS
            // ==========================================

            if (
                data.message &&
                data.message.toLowerCase().includes("already exists")
            ) {

                alert(
                    "User already exists!\n\n" +
                    "Please login with your existing account."
                );

                // Go to login page
                window.location.replace("./index.html");


                return;
            }


            // ==========================================
            // OTHER ERROR
            // ==========================================

            alert(
                data.message ||
                "Registration failed."
            );

        }


        // ==========================================
        // PYTHON BACKEND ERROR
        // ==========================================

        catch (error) {

            console.error(
                "Registration Error:",
                error
            );

            alert(
                "Cannot connect to Python backend.\n\n" +
                "Please make sure you have started:\n\n" +
                "python app.py"
            );
        }

    });

});