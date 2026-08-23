document.addEventListener("DOMContentLoaded", () => {

    const progressBar =
        document.querySelector(".reading-progress-bar");

    const backToTop =
        document.querySelector(".back-to-top");

    const continueReading =
        document.querySelector(".continue-reading");

    const resumeButton =
        document.querySelector(".continue-reading-resume");

    const dismissButton =
        document.querySelector(".continue-reading-dismiss");


    const storageKey =
        `diamond-dust-progress-${window.location.pathname}`;


    let savedPosition =
        localStorage.getItem(storageKey);


    /*
     * Reading progress
     */

    function updateProgress() {

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

    function updateBackToTop() {

        if (window.scrollY > 600) {

            backToTop.classList.add("is-visible");

        } else {

            backToTop.classList.remove("is-visible");

        }

    }


    backToTop.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    });


    /*
     * Save reading position
     */

    function savePosition() {

        if (window.scrollY > 200) {

            localStorage.setItem(
                storageKey,
                window.scrollY
            );

        }

    }


    /*
     * Continue reading
     */

    if (
        savedPosition &&
        Number(savedPosition) > 300
    ) {

        continueReading.hidden = false;

    }


    resumeButton.addEventListener("click", () => {

        window.scrollTo({
            top: Number(savedPosition),
            behavior: "smooth"
        });

        continueReading.hidden = true;

    });


    dismissButton.addEventListener("click", () => {

        localStorage.removeItem(storageKey);

        continueReading.hidden = true;

    });


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
