// ==========================================
// MediCare AI - Login Protection
// ==========================================

(function () {

    const isLoggedIn =
        localStorage.getItem("isLoggedIn");

    const userEmail =
        localStorage.getItem("userEmail");

    if (isLoggedIn !== "true" || !userEmail) {

        alert("Please login first.");

        window.location.replace("index.html");
    }

})();