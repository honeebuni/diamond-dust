document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    const body = document.body;
    const pageType = body.dataset.pageType || "";

    /* ======================================================
       Helpers
    ====================================================== */

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    const safeParse = (value) => {
        try {
            return JSON.parse(value);
        } catch (error) {
            return null;
        }
    };

    const setBodyOverlayState = () => {
        const anyOpen =
            document.querySelector(".chapter-drawer.is-open") ||
            document.querySelector(".reader-sheet.is-open");

        body.classList.toggle("is-overlay-open", Boolean(anyOpen));
    };

    /* ======================================================
       Theme
    ====================================================== */

    const themeToggles = document.querySelectorAll(".theme-toggle");
    const themeChoices = document.querySelectorAll("[data-theme-choice]");
    const themeMeta = document.querySelector('meta[name="theme-color"]');

    function getTheme() {
        return root.getAttribute("data-theme") || "light";
    }

    function updateThemeUI() {
        const theme = getTheme();

        themeToggles.forEach((toggle) => {
            const icon = toggle.querySelector(".theme-toggle-icon");
            if (icon) {
                icon.textContent = theme === "dark" ? "☀" : "☾";
            }
            toggle.setAttribute(
                "aria-label",
                theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
            );
        });

        themeChoices.forEach((button) => {
            button.classList.toggle(
                "is-active",
                button.dataset.themeChoice === theme
            );
        });

        if (themeMeta) {
            themeMeta.setAttribute(
                "content",
                theme === "dark" ? "#141719" : "#f7f8f8"
            );
        }
    }

    function setTheme(theme) {
        root.setAttribute("data-theme", theme);
        localStorage.setItem("diamond-dust-theme", theme);
        updateThemeUI();
    }

    themeToggles.forEach((toggle) => {
        toggle.addEventListener("click", () => {
            setTheme(getTheme() === "dark" ? "light" : "dark");
        });
    });

    themeChoices.forEach((button) => {
        button.addEventListener("click", () => {
            setTheme(button.dataset.themeChoice);
        });
    });

    updateThemeUI();

    /* ======================================================
       Reader preferences
    ====================================================== */

    const fontChoices = document.querySelectorAll("[data-font-choice]");
    const fontSizeInput = document.querySelector("#reader-font-size");
    const fontSizeValue = document.querySelector("#reader-font-size-value");
    const lineHeightInput = document.querySelector("#reader-line-height");
    const lineHeightValue = document.querySelector("#reader-line-height-value");
    const resetReader = document.querySelector("[data-reader-reset]");

    const readerDefaults = {
        font: "source",
        size: 20,
        lineHeight: 2.0
    };

    function getReaderPrefs() {
        const stored = safeParse(localStorage.getItem("diamond-dust-reader-settings"));

        return {
            font: stored?.font || readerDefaults.font,
            size: clamp(Number(stored?.size) || readerDefaults.size, 17, 25),
            lineHeight: clamp(
                Number(stored?.lineHeight) || readerDefaults.lineHeight,
                1.6,
                2.2
            )
        };
    }

    function saveReaderPrefs(prefs) {
        localStorage.setItem(
            "diamond-dust-reader-settings",
            JSON.stringify(prefs)
        );
    }

    function applyReaderPrefs(prefs) {
        root.setAttribute("data-reader-font", prefs.font);
        root.style.setProperty("--reader-font-size", `${prefs.size}px`);
        root.style.setProperty("--reader-line-height", prefs.lineHeight);

        fontChoices.forEach((button) => {
            button.classList.toggle(
                "is-active",
                button.dataset.fontChoice === prefs.font
            );
        });

        if (fontSizeInput) {
            fontSizeInput.value = prefs.size;
        }
        if (fontSizeValue) {
            fontSizeValue.textContent = `${prefs.size}px`;
        }
        if (lineHeightInput) {
            lineHeightInput.value = prefs.lineHeight;
        }
        if (lineHeightValue) {
            lineHeightValue.textContent = Number(prefs.lineHeight).toFixed(1);
        }
    }

    let readerPrefs = getReaderPrefs();
    applyReaderPrefs(readerPrefs);

    fontChoices.forEach((button) => {
        button.addEventListener("click", () => {
            readerPrefs.font = button.dataset.fontChoice;
            saveReaderPrefs(readerPrefs);
            applyReaderPrefs(readerPrefs);
        });
    });

    if (fontSizeInput) {
        fontSizeInput.addEventListener("input", () => {
            readerPrefs.size = Number(fontSizeInput.value);
            saveReaderPrefs(readerPrefs);
            applyReaderPrefs(readerPrefs);
        });
    }

    if (lineHeightInput) {
        lineHeightInput.addEventListener("input", () => {
            readerPrefs.lineHeight = Number(lineHeightInput.value);
            saveReaderPrefs(readerPrefs);
            applyReaderPrefs(readerPrefs);
        });
    }

    if (resetReader) {
        resetReader.addEventListener("click", () => {
            readerPrefs = { ...readerDefaults };
            saveReaderPrefs(readerPrefs);
            applyReaderPrefs(readerPrefs);
        });
    }

    /* ======================================================
       Chapter drawer
    ====================================================== */

    const chapterDrawer = document.querySelector(".chapter-drawer");
    const drawerBackdrop = document.querySelector(".drawer-backdrop");
    const drawerTriggers = document.querySelectorAll(".chapter-drawer-trigger");
    const drawerClosers = document.querySelectorAll("[data-drawer-close]");

    function openDrawer() {
        if (!chapterDrawer) return;

        chapterDrawer.classList.add("is-open");
        chapterDrawer.setAttribute("aria-hidden", "false");
        if (drawerBackdrop) drawerBackdrop.hidden = false;
        drawerTriggers.forEach((button) => button.setAttribute("aria-expanded", "true"));
        setBodyOverlayState();

        const current = chapterDrawer.querySelector(".drawer-chapter-link.is-current");
        if (current) {
            requestAnimationFrame(() => current.scrollIntoView({ block: "center" }));
        }
    }

    function closeDrawer() {
        if (!chapterDrawer) return;

        chapterDrawer.classList.remove("is-open");
        chapterDrawer.setAttribute("aria-hidden", "true");
        if (drawerBackdrop) drawerBackdrop.hidden = true;
        drawerTriggers.forEach((button) => button.setAttribute("aria-expanded", "false"));
        setBodyOverlayState();
    }

    drawerTriggers.forEach((button) => button.addEventListener("click", openDrawer));
    drawerClosers.forEach((button) => button.addEventListener("click", closeDrawer));

    /* ======================================================
       Reader settings sheet
    ====================================================== */

    const readerSheet = document.querySelector(".reader-sheet");
    const readerSheetBackdrop = document.querySelector(".reader-sheet-backdrop");
    const readerSheetTriggers = document.querySelectorAll(".reader-settings-trigger");
    const readerSheetClosers = document.querySelectorAll("[data-reader-sheet-close]");

    function openReaderSheet() {
        if (!readerSheet) return;

        readerSheet.classList.add("is-open");
        readerSheet.setAttribute("aria-hidden", "false");
        if (readerSheetBackdrop) readerSheetBackdrop.hidden = false;
        readerSheetTriggers.forEach((button) => button.setAttribute("aria-expanded", "true"));
        setBodyOverlayState();
    }

    function closeReaderSheet() {
        if (!readerSheet) return;

        readerSheet.classList.remove("is-open");
        readerSheet.setAttribute("aria-hidden", "true");
        if (readerSheetBackdrop) readerSheetBackdrop.hidden = true;
        readerSheetTriggers.forEach((button) => button.setAttribute("aria-expanded", "false"));
        setBodyOverlayState();
    }

    readerSheetTriggers.forEach((button) => button.addEventListener("click", openReaderSheet));
    readerSheetClosers.forEach((button) => button.addEventListener("click", closeReaderSheet));

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeDrawer();
            closeReaderSheet();
        }
    });

    /* ======================================================
       Reading progress + saved position
    ====================================================== */

    const progressBar = document.querySelector(".reading-progress-bar");
    const progressLabel = document.querySelector(".reading-progress-label");
    const backToTop = document.querySelector(".scroll-top-button");

    const chapterNumber = body.dataset.chapterNumber;
    const chapterTitle = body.dataset.chapterTitle;
    const chapterStorageKey = `diamond-dust-progress-${window.location.pathname}`;
    const savedPosition = Number(localStorage.getItem(chapterStorageKey)) || 0;

    let latestPercent = 0;
    let saveTimer = null;

    function calculateProgress() {
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (documentHeight <= 0) return 0;
        return clamp((window.scrollY / documentHeight) * 100, 0, 100);
    }

    function updateProgress() {
        if (!progressBar) return;

        latestPercent = calculateProgress();
        const rounded = Math.round(latestPercent);

        progressBar.style.width = `${latestPercent}%`;
        if (progressLabel) progressLabel.textContent = `${rounded}%`;
    }

    function updateBackToTop() {
        if (!backToTop) return;
        backToTop.classList.toggle("is-visible", window.scrollY > 650);
    }

    function saveReadingState() {
        if (pageType !== "chapter" || !chapterNumber) return;

        if (window.scrollY > 120) {
            localStorage.setItem(chapterStorageKey, String(Math.round(window.scrollY)));
        }

        const state = {
            url: window.location.pathname,
            chapterNumber,
            title: chapterTitle || "",
            position: Math.round(window.scrollY),
            percent: Math.round(latestPercent),
            updatedAt: Date.now()
        };

        localStorage.setItem("diamond-dust-last-reading", JSON.stringify(state));
    }

    function scheduleSave() {
        window.clearTimeout(saveTimer);
        saveTimer = window.setTimeout(saveReadingState, 160);
    }

    if (backToTop) {
        backToTop.addEventListener("click", (event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    if (progressBar) {
        window.addEventListener(
            "scroll",
            () => {
                updateProgress();
                updateBackToTop();
                scheduleSave();
            },
            { passive: true }
        );

        window.addEventListener("pagehide", saveReadingState);
        updateProgress();
        updateBackToTop();
    }

    /* ======================================================
       Resume within a chapter
    ====================================================== */

    const resumePrompt = document.querySelector(".resume-reading");
    const resumeButton = document.querySelector("[data-resume-reading]");
    const dismissResume = document.querySelector("[data-dismiss-resume]");
    const resumeText = document.querySelector(".resume-reading-text");

    if (pageType === "chapter" && savedPosition > 320 && resumePrompt) {
        const params = new URLSearchParams(window.location.search);
        const autoResume = params.get("resume") === "1";

        if (autoResume) {
            requestAnimationFrame(() => {
                window.scrollTo({ top: savedPosition, behavior: "auto" });
                updateProgress();
            });
        } else {
            const estimatedPercent = Math.round(
                clamp(
                    savedPosition /
                        Math.max(
                            document.documentElement.scrollHeight - window.innerHeight,
                            1
                        ) * 100,
                    0,
                    100
                )
            );

            if (resumeText) {
                resumeText.textContent = `Resume around ${estimatedPercent}%?`;
            }
            resumePrompt.hidden = false;
        }
    }

    if (resumeButton && resumePrompt) {
        resumeButton.addEventListener("click", () => {
            window.scrollTo({ top: savedPosition, behavior: "smooth" });
            resumePrompt.hidden = true;
        });
    }

    if (dismissResume && resumePrompt) {
        dismissResume.addEventListener("click", () => {
            resumePrompt.hidden = true;
        });
    }

    /* ======================================================
       Intelligent homepage Start / Continue button
    ====================================================== */

    const startButton = document.querySelector(".start-reading-button");
    const startLabel = document.querySelector(".start-reading-label");
    const continueDetail = document.querySelector(".continue-reading-detail");
    const lastReading = safeParse(localStorage.getItem("diamond-dust-last-reading"));

    if (pageType === "home" && startButton && lastReading?.url) {
        startButton.href = `${lastReading.url}?resume=1`;

        if (startLabel) {
            startLabel.textContent = "Continue Reading";
        }

        if (continueDetail) {
            const title = lastReading.title ? ` · ${lastReading.title}` : "";
            const percent = Number.isFinite(Number(lastReading.percent))
                ? ` · ${lastReading.percent}%`
                : "";

            continueDetail.textContent = `Chapter ${lastReading.chapterNumber}${title}${percent}`;
            continueDetail.hidden = false;
        }
    }
});
