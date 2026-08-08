// ==========================================
// MediCare AI - Emergency SOS
// ==========================================

let isSirenPlaying = false;


// ==========================================
// SOS SIREN + FAMILY CALL
// ==========================================

function toggleSiren() {

    const sirenAudio =
        document.getElementById("sirenAudio");

    const sosBtn =
        document.querySelector(".sos-btn");


    if (!isSirenPlaying) {

        sirenAudio.play()
            .then(function () {

                isSirenPlaying = true;

                if (sosBtn) {

                    sosBtn.innerText =
                        "🛑 STOP ALARM";

                    sosBtn.style.backgroundColor =
                        "#dc2626";

                    sosBtn.style.color =
                        "#ffffff";
                }


                // Family Contact
                // અહીં તારો family number નાખજે
                window.location.href =
                    "tel:+919426661080";

            })
            .catch(function (error) {

                console.error(
                    "Siren error:",
                    error
                );

                alert(
                    "Please click SOS again to start the alarm."
                );

            });

    } else {

        sirenAudio.pause();

        sirenAudio.currentTime = 0;

        isSirenPlaying = false;


        if (sosBtn) {

            sosBtn.innerText =
                "🚨 SOS";

            sosBtn.style.backgroundColor =
                "";

            sosBtn.style.color =
                "";
        }
    }
}


// ==========================================
// LIVE LOCATION
// ==========================================

function getLocation() {

    const map =
        document.getElementById("map");


    if (!navigator.geolocation) {

        map.innerText =
            "Geolocation is not supported by this browser.";

        return;
    }


    map.innerText =
        "Getting your location...";


    navigator.geolocation.getCurrentPosition(

        function (position) {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            map.innerHTML = `

                <p>
                    📍 Latitude:
                    ${latitude.toFixed(6)}
                </p>

                <p>
                    📍 Longitude:
                    ${longitude.toFixed(6)}
                </p>

                <a
                    href="https://www.google.com/maps?q=${latitude},${longitude}"
                    target="_blank"
                >
                    🗺️ Open Location in Google Maps
                </a>

            `;
        },


        function (error) {

            console.error(
                "Location error:",
                error
            );

            map.innerText =
                "Unable to get your location. Please allow location permission.";

        }

    );
}