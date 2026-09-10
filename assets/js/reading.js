document.addEventListener("DOMContentLoaded", () => {

    /*
     * Theme
     */

    const themeToggle =
        document.querySelector(".theme-toggle");

    const savedTheme =
        localStorage.getItem("diamond-dust-theme");

    if (savedTheme) {
        document.documentElement.setAttribute(
            "data-theme",
            savedTheme
        );
    }

    if (themeToggle) {

        themeToggle.addEventListener("click", () => {

            const currentTheme =
                document.documentElement.getAttribute(
                    "data-theme"
                );

            const newTheme =
                currentTheme === "dark"
                    ? "light"
                    : "dark";

            document.documentElement.setAttribute(
                "data-theme",
                newTheme
            );

            localStorage.setItem(
                "diamond-dust-theme",
                newTheme
            );

        });

    }


    /*
     * Reading progress
     */

    const progressBar =
        document.querySelector(".reading-progress-bar");

    function updateProgress() {

        if (!progressBar) {
            return;
        }

        const scrollTop =
            window.scrollY;

        const documentHeight =
            document.documentElement.scrollHeight -
            window.innerHeight;

        if (documentHeight <= 0) {
            return;
        }

        const progress =
            (scrollTop / documentHeight) * 100;

        progressBar.style.width =
            `${progress}%`;

    }


    /*
     * Back to top
     */

    const backToTop =
        document.querySelector(".scroll-top-button");

    function updateBackToTop() {

        if (!backToTop) {
            return;
        }

        if (window.scrollY > 600) {

            backToTop.classList.add("is-visible");

        } else {

            backToTop.classList.remove("is-visible");

        }

    }

    if (backToTop) {

        backToTop.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }


    /*
     * Reading-position persistence
     */

    const continueReading =
        document.querySelector(".continue-reading");

    const resumeButton =
        document.querySelector(
            ".continue-reading-resume"
        );

    const dismissButton =
        document.querySelector(
            ".continue-reading-dismiss"
        );

    const storageKey =
        `diamond-dust-progress-${window.location.pathname}`;

    const savedPosition =
        localStorage.getItem(storageKey);


    function savePosition() {

        if (!progressBar) {
            return;
        }

        if (window.scrollY > 200) {

            localStorage.setItem(
                storageKey,
                window.scrollY
            );

        }

    }


    if (
        continueReading &&
        savedPosition &&
        Number(savedPosition) > 300
    ) {

        continueReading.hidden = false;

    }


    if (resumeButton && continueReading) {

        resumeButton.addEventListener(
            "click",
            () => {

                window.scrollTo({
                    top: Number(savedPosition),
                    behavior: "smooth"
                });

                continueReading.hidden = true;

            }
        );

    }


    if (dismissButton && continueReading) {

        dismissButton.addEventListener(
            "click",
            () => {

                localStorage.removeItem(storageKey);

                continueReading.hidden = true;

            }
        );

    }


    /*
     * Scroll events
     */

    window.addEventListener(
        "scroll",
        () => {

            updateProgress();
            updateBackToTop();
            savePosition();

        },
        { passive: true }
    );


    updateProgress();
    updateBackToTop();

});
