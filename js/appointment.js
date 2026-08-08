// ==========================================
// MediCare AI - Appointment
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const userEmail =
        localStorage.getItem("userEmail");

    if (!userEmail) {

        alert("Please login first.");

        window.location.href = "index.html";

        return;
    }


    const form =
        document.querySelector("form");

    // Load existing appointments
    loadAppointments();


    // ------------------------------------------
    // BOOK APPOINTMENT
    // ------------------------------------------

    if (form) {

        form.addEventListener(
            "submit",
            async function (e) {

                e.preventDefault();

                const inputs =
                    form.querySelectorAll("input");

                const selects =
                    form.querySelectorAll("select");

                const textareas =
                    form.querySelectorAll("textarea");


                // Adjust according to your form
                const doctorName =
    selects[1]?.value.trim() || "";

const appointmentDate =
    inputs[2]?.value || "";

const appointmentTime =
    inputs[3]?.value || "";
const reason =
    textareas[0]?.value.trim() || "";


                if (
                    !doctorName ||
                    !appointmentDate ||
                    !appointmentTime
                ) {

                    alert(
                        "Please fill all appointment details."
                    );

                    return;
                }


                try {

                    const response =
                        await fetch(
                            "https://medicare-ai-2026.onrender.com/api/appointments",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    email: userEmail,

                                    doctor_name:
                                        doctorName,

                                    appointment_date:
                                        appointmentDate,

                                    appointment_time:
                                        appointmentTime,

                                    reason:
                                        reason
                                })
                            }
                        );


                    const data =
                        await response.json();


                    if (
                        response.ok &&
                        data.status === "success"
                    ) {

                        alert(
                            "Appointment booked successfully! 📅"
                        );

                        form.reset();

                        loadAppointments();

                    } else {

                        alert(
                            data.message ||
                            "Appointment booking failed."
                        );
                    }


                } catch (error) {

                    console.error(
                        "Appointment Error:",
                        error
                    );

                    alert(
                        "Cannot connect to Python backend."
                    );
                }

            }
        );
    }


    // ------------------------------------------
    // LOAD APPOINTMENTS
    // ------------------------------------------

    async function loadAppointments() {

        try {

            const response =
                await fetch(
                    "https://medicare-ai-2026.onrender.com/api/appointments/" +
                    encodeURIComponent(userEmail)
                );


            const data =
                await response.json();


            if (
                response.ok &&
                data.status === "success"
            ) {

                displayAppointments(
                    data.appointments
                );
            }


        } catch (error) {

            console.error(
                "Load appointments error:",
                error
            );
        }
    }


    // ------------------------------------------
    // DISPLAY APPOINTMENTS
    // ------------------------------------------

    function displayAppointments(
        appointments
    ) {

        const container =
            document.querySelector(
                ".appointment-list"
            );


        if (!container) {
            return;
        }


        container.innerHTML = "";


        if (appointments.length === 0) {

            container.innerHTML = `
                <p>
                    No appointments booked yet.
                </p>
            `;

            return;
        }


        appointments.forEach(
            function (appointment) {

                const card =
                    document.createElement("div");

                card.className =
                    "appointment-card";


                card.innerHTML = `

                    <h3>
                        👨‍⚕️
                        ${appointment.doctor_name}
                    </h3>

                    <p>
                        📅
                        ${appointment.appointment_date}
                    </p>

                    <p>
                        ⏰
                        ${appointment.appointment_time}
                    </p>

                    <p>
                        Status:
                        <strong>
                            ${appointment.status}
                        </strong>
                    </p>

                    ${
                        appointment.reason
                        ? `
                            <p>
                                Reason:
                                ${appointment.reason}
                            </p>
                        `
                        : ""
                    }

                    <button
                        class="cancel-appointment"
                        data-id="${appointment.id}">
                        Cancel
                    </button>

                `;


                container.appendChild(card);
            }
        );


        // Cancel buttons

        container
            .querySelectorAll(
                ".cancel-appointment"
            )
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        cancelAppointment(
                            button.dataset.id
                        );

                    }
                );

            });
    }


    // ------------------------------------------
    // CANCEL APPOINTMENT
    // ------------------------------------------

    async function cancelAppointment(id) {

        if (
            !confirm(
                "Cancel this appointment?"
            )
        ) {
            return;
        }


        try {

            const response =
                await fetch(
                    "https://medicare-ai-2026.onrender.com/api/appointments/" +
                    id,
                    {
                        method: "DELETE"
                    }
                );


            const data =
                await response.json();


            if (
                response.ok &&
                data.status === "success"
            ) {

                alert(
                    "Appointment cancelled."
                );

                loadAppointments();

            } else {

                alert(
                    data.message ||
                    "Could not cancel appointment."
                );
            }


        } catch (error) {

            console.error(
                "Cancel error:",
                error
            );

            alert(
                "Cannot connect to Python backend."
            );
        }
    }

});