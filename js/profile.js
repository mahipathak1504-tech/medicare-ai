// ==========================================
// MediCare AI - Profile
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const userEmail = localStorage.getItem("userEmail");
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    // ------------------------------------------
    // Check Login
    // ------------------------------------------

    if (isLoggedIn !== "true" || !userEmail) {

        alert("Please login first.");

        window.location.href = "index.html";

        return;
    }


    // ------------------------------------------
    // Get all profile inputs
    // ------------------------------------------

    const inputs = document.querySelectorAll(".details-card .info input");

    if (inputs.length < 9) {

        console.error("Profile fields not found.");
        return;
    }


    // ------------------------------------------
    // Load Profile
    // ------------------------------------------

    async function loadProfile() {

        try {

            const response = await fetch(
                `https://medicare-ai-2026.onrender.com/api/profile/${encodeURIComponent(userEmail)}`
            );

            const data = await response.json();

            console.log("Profile data:", data);

            if (response.ok && data.status === "success") {

                const profile = data.profile;

                // Name
                if (profile.name) {
                    inputs[0].value = profile.name;
                }

                // Email
                inputs[1].value = profile.email || userEmail;

                // Age
                if (profile.age) {
                    inputs[3].value = profile.age;
                }

                // Gender
                if (profile.gender) {
                    inputs[4].value = profile.gender;
                }

                // Blood Group
                if (profile.blood_group) {
                    inputs[5].value = profile.blood_group;
                }

            }

        } catch (error) {

            console.error("Profile loading error:", error);
        }
    }


    // ------------------------------------------
    // Edit Profile
    // ------------------------------------------

    const editButton =
        document.querySelector(".profile-card button");

    if (editButton) {

        editButton.addEventListener("click", function () {

            inputs.forEach(function (input) {

                input.removeAttribute("readonly");

            });

            alert("You can now edit your profile.");

        });
    }


    // ------------------------------------------
    // Save Profile
    // ------------------------------------------

    const saveButton =
        document.querySelector(".save");

    if (saveButton) {

        saveButton.addEventListener("click", async function () {

            const name = inputs[0].value.trim();
            const email = inputs[1].value.trim();
            const phone = inputs[2].value.trim();
            const age = inputs[3].value.trim();
            const gender = inputs[4].value.trim();
            const bloodGroup = inputs[5].value.trim();
            const height = inputs[6].value.trim();
            const weight = inputs[7].value.trim();
            const emergencyContact = inputs[8].value.trim();


            // Validation

            if (!name || !email || !age) {

                alert("Name, Email and Age are required.");

                return;
            }


            try {

                const response = await fetch(
                    "https://medicare-ai-2026.onrender.com/api/profile",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            email: email,
                            name: name,
                            age: age,
                            gender: gender,
                            blood_group: bloodGroup,

                            // These are currently kept for future backend support
                            phone: phone,
                            height: height,
                            weight: weight,
                            emergency_contact: emergencyContact

                        })
                    }
                );


                const data = await response.json();

                console.log("Save profile response:", data);


                if (response.ok && data.status === "success") {

                    alert("Profile saved successfully!");

                    // Make fields readonly again

                    inputs.forEach(function (input) {

                        input.setAttribute("readonly", true);

                    });

                } else {

                    alert(
                        data.message ||
                        "Could not save profile."
                    );
                }


            } catch (error) {

                console.error("Profile save error:", error);

                alert(
                    "Cannot connect to Python backend.\n\n" +
                    "Please make sure python app.py is running."
                );
            }

        });
    }


    // Load existing profile
    loadProfile();

});