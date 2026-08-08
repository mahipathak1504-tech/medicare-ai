// ==========================================
// MediCare AI - Patient Medicine Reminder
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const medicineList = document.querySelector(".medicine-list");
    const form = document.querySelector(".add-box form");

    const userEmail = localStorage.getItem("userEmail");

    // ------------------------------------------
    // LOGIN CHECK
    // ------------------------------------------

    if (!userEmail) {
        alert("Please login first.");
        window.location.href = "index.html";
        return;
    }

    // Load medicines
    loadMedicines();


    // ------------------------------------------
    // ADD MEDICINE
    // ------------------------------------------

    if (form) {

        form.addEventListener("submit", async function (e) {

            e.preventDefault();

            const inputs = form.querySelectorAll("input");
            const select = form.querySelector("select");

            const medicineName = inputs[0]?.value.trim() || "";
            const dosage = inputs[1]?.value.trim() || "";
            const medicineTime = inputs[2]?.value || "";
            const startDate = inputs[3]?.value || "";
            const frequency = select?.value || "Daily";


            if (!medicineName || !dosage || !medicineTime || !startDate) {

                alert("Please fill all medicine details.");
                return;
            }


            try {

                const response = await fetch(
                    "http://127.0.0.1:5000/api/medicines",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            email: userEmail,
                            medicine_name: medicineName,
                            dosage: dosage,
                            medicine_time: medicineTime,
                            start_date: startDate,
                            frequency: frequency

                        })
                    }
                );


                const data = await response.json();

                console.log("Medicine response:", data);


                if (response.ok && data.status === "success") {

                    alert("Medicine added successfully! 💊");

                    form.reset();

                    loadMedicines();

                } else {

                    alert(
                        data.message ||
                        "Medicine could not be added."
                    );

                }


            } catch (error) {

                console.error("Add medicine error:", error);

                alert(
                    "Cannot connect to Python backend."
                );

            }

        });

    }


    // ------------------------------------------
    // LOAD MEDICINES
    // ------------------------------------------

    async function loadMedicines() {

        try {

            const response = await fetch(
                "http://127.0.0.1:5000/api/medicines/" +
                encodeURIComponent(userEmail)
            );

            const data = await response.json();

            console.log("Medicine response:", data);


            if (response.ok && data.status === "success") {

                displayMedicines(data.medicines);

            } else {

                medicineList.innerHTML = `
                    <h2>Today's Medicines</h2>
                    <p>Unable to load medicines.</p>
                `;

            }


        } catch (error) {

            console.error("Medicine Error:", error);

            medicineList.innerHTML = `
                <h2>Today's Medicines</h2>
                <p>Cannot connect to Python backend.</p>
            `;

        }

    }


    // ------------------------------------------
    // DISPLAY MEDICINES
    // ------------------------------------------

    function displayMedicines(medicines) {

        medicineList.innerHTML = `
            <h2>Today's Medicines</h2>
        `;


        if (medicines.length === 0) {

            medicineList.innerHTML += `
                <div class="medicine-card">
                    <p>No medicines have been prescribed yet.</p>
                </div>
            `;

            return;
        }
async function deleteMedicine(id) {

    if (!confirm("Delete this medicine?")) {
        return;
    }

    try {

        const response = await fetch(
            "http://127.0.0.1:5000/api/medicines/" + id,
            {
                method: "DELETE"
            }
        );

        const data = await response.json();

        if (response.ok && data.status === "success") {

            alert("Medicine deleted successfully. 🗑️");

            loadMedicines();

        } else {

            alert(
                data.message ||
                "Could not delete medicine."
            );
        }

    } catch (error) {

        console.error("Delete medicine error:", error);

        alert("Cannot connect to Python backend.");
    }
}

        medicines.forEach(function (medicine) {

            const card = document.createElement("div");

            card.className = "medicine-card";


            card.innerHTML = `

                <div class="medicine-info">

                    <h3>
                        💊 ${medicine.medicine_name}
                    </h3>

                    <p>
                        <strong>Dosage:</strong>
                        ${medicine.dosage || "Not specified"}
                    </p>

                    <p>
                        <strong>Time:</strong>
                        ${medicine.medicine_time || "Not specified"}
                    </p>

                    <p>
                        <strong>Frequency:</strong>
                        ${medicine.frequency || "Daily"}
                    </p>

                    <p>
                        <strong>Start Date:</strong>
                        ${medicine.start_date || "Not specified"}
                    </p>

                </div>
                <div>
                <button class="delete" data-id="${medicine.id}">
    Delete
</button>
</div>

            `;
            card.querySelector(".delete").addEventListener(
    "click",
    function () {
        deleteMedicine(medicine.id);
    }
);
            
            medicineList.appendChild(card);

        });

    }

});