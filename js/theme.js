document.addEventListener("DOMContentLoaded", function () {

    const darkModeToggle = document.getElementById("darkModeToggle");

    // Saved theme check
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");

        if (darkModeToggle) {
            darkModeToggle.checked = true;
        }
    }


    // Dark mode toggle
    if (darkModeToggle) {

        darkModeToggle.addEventListener("change", function () {

            if (this.checked) {

                document.body.classList.add("dark-mode");
                localStorage.setItem("theme", "dark");

            } else {

                document.body.classList.remove("dark-mode");
                localStorage.setItem("theme", "light");

            }

        });

    }

});