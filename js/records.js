const uploadButton = document.getElementById("uploadReportBtn");
const reportFile = document.getElementById("reportFile");
const recordContainer = document.getElementById("recordContainer");
const uploadMessage = document.getElementById("uploadMessage");

const API_URL = "https://medicare-ai-2026.onrender.com";


/* ==========================================
   UPLOAD REPORT
========================================== */

uploadButton.addEventListener("click", async function () {

    const file = reportFile.files[0];

    if (!file) {
        alert("Please select a report first.");
        return;
    }

    const formData = new FormData();

    formData.append("report", file);

    uploadButton.disabled = true;
    uploadButton.textContent = "Uploading...";

    try {

        const response = await fetch(
            `${API_URL}/api/records/upload`,
            {
                method: "POST",
                body: formData
            }
        );

        const data = await response.json();

        if (response.ok) {

            alert("Report uploaded successfully!");

            reportFile.value = "";

            if (uploadMessage) {
                uploadMessage.textContent =
                    "Report uploaded successfully!";
            }

            // Refresh records
            loadRecords();

        } else {

            alert(data.message || "Upload failed.");

        }

    } catch (error) {

        console.error("Upload error:", error);

        alert("Cannot connect to backend.");

    } finally {

        uploadButton.disabled = false;
        uploadButton.textContent = "Upload Report";
    }

});


/* ==========================================
   LOAD RECORDS
========================================== */

async function loadRecords() {

    try {

        const response = await fetch(
            `${API_URL}/api/records`
        );

        if (!response.ok) {
            throw new Error("Unable to load records.");
        }

        const records = await response.json();

        console.log("Records:", records);

        // Clear old cards
        recordContainer.innerHTML = "";


        /* No records */

        if (records.length === 0) {

            recordContainer.innerHTML = `
                <div class="no-records">

                    <i class="fa-solid fa-folder-open"></i>

                    <h3>No Health Records</h3>

                    <p>
                        Upload your medical report to see it here.
                    </p>

                </div>
            `;

            return;
        }


        /* Create cards */

        records.forEach(function (record) {

            const card = document.createElement("div");

            card.className = "record-card";


            // File extension
            const extension =
                record.filename
                    .split(".")
                    .pop()
                    .toLowerCase();


            // Icon
            let icon = "fa-file-medical";


            if (extension === "pdf") {

                icon = "fa-file-pdf";

            } else if (
                extension === "jpg" ||
                extension === "jpeg" ||
                extension === "png"
            ) {

                icon = "fa-file-image";

            }


            card.innerHTML = `

                <div class="record-icon">

                    <i class="fa-solid ${icon}"></i>

                </div>

                <h3>
                    ${record.filename}
                </h3>

                <p>
                    Medical Report
                </p>

                <button
                    type="button"
                    class="view-report-btn"
                    onclick="viewReport('${record.url}')">

                    <i class="fa-solid fa-eye"></i>

                    View Report

                </button>

            `;


            recordContainer.appendChild(card);

        });

    } catch (error) {

        console.error(
            "Error loading records:",
            error
        );

        recordContainer.innerHTML = `

            <div class="no-records">

                <i class="fa-solid fa-triangle-exclamation"></i>

                <h3>Unable to load records</h3>

                <p>
                    Please make sure the Python backend is running.
                </p>

            </div>

        `;
    }

}


/* ==========================================
   VIEW REPORT
========================================== */

function viewReport(url) {

    window.open(
        API_URL + url,
        "_blank"
    );

}


/* ==========================================
   LOAD WHEN PAGE OPENS
========================================== */

loadRecords();