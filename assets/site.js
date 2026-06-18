(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var yearNode = document.querySelector("[data-current-year]");
        if (yearNode) {
            yearNode.textContent = String(new Date().getFullYear());
        }

        var menuToggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (menuToggle && mobileNav) {
            menuToggle.addEventListener("click", function () {
                mobileNav.classList.toggle("open");
            });
        }

        setupHeroCarousel();
        setupFilters();
        setupSearchQuery();
    });

    function setupHeroCarousel() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }

        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }

        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("active", position === activeIndex);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("active", position === activeIndex);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5000);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupFilters() {
        var form = document.querySelector("[data-filter-form]");
        var grid = document.querySelector("[data-filter-grid]");
        if (!form || !grid) {
            return;
        }

        var keywordInput = form.querySelector("[data-filter-keyword]");
        var regionSelect = form.querySelector("[data-filter-region]");
        var genreSelect = form.querySelector("[data-filter-genre]");
        var yearSelect = form.querySelector("[data-filter-year]");
        var typeSelect = form.querySelector("[data-filter-type]");
        var cards = Array.prototype.slice.call(grid.querySelectorAll("[data-card]"));
        var emptyState = document.querySelector("[data-empty-state]");

        function applyFilters() {
            var keyword = normalize(keywordInput && keywordInput.value);
            var region = normalize(regionSelect && regionSelect.value);
            var genre = normalize(genreSelect && genreSelect.value);
            var year = normalize(yearSelect && yearSelect.value);
            var type = normalize(typeSelect && typeSelect.value);
            var visibleCount = 0;

            cards.forEach(function (card) {
                var haystack = normalize(card.textContent);
                var cardRegion = normalize(card.getAttribute("data-region"));
                var cardGenre = normalize(card.getAttribute("data-genre"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var cardType = normalize(card.getAttribute("data-type"));
                var matched = true;

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matched = false;
                }
                if (region && cardRegion.indexOf(region) === -1) {
                    matched = false;
                }
                if (genre && cardGenre.indexOf(genre) === -1) {
                    matched = false;
                }
                if (year && cardYear !== year) {
                    matched = false;
                }
                if (type && cardType.indexOf(type) === -1) {
                    matched = false;
                }

                card.hidden = !matched;
                if (matched) {
                    visibleCount += 1;
                }
            });

            if (emptyState) {
                emptyState.hidden = visibleCount !== 0;
            }
        }

        form.addEventListener("input", applyFilters);
        form.addEventListener("change", applyFilters);
        form.addEventListener("reset", function () {
            window.setTimeout(applyFilters, 0);
        });

        applyFilters();
    }

    function setupSearchQuery() {
        var input = document.querySelector("[data-filter-keyword]");
        if (!input) {
            return;
        }

        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (query) {
            input.value = query;
            input.dispatchEvent(new Event("input", { bubbles: true }));
        }
    }

    window.initDetailPlayer = function (streamUrl) {
        var video = document.querySelector("[data-movie-video]");
        var cover = document.querySelector("[data-player-cover]");
        var message = document.querySelector("[data-player-message]");
        var hasAttached = false;
        var hls = null;

        if (!video || !streamUrl) {
            return;
        }

        function setMessage(text) {
            if (message) {
                message.textContent = text || "";
            }
        }

        function attachStream() {
            if (hasAttached) {
                return;
            }
            hasAttached = true;
            setMessage("");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setMessage("影片加载遇到问题，请稍后重试");
                    }
                });
                return;
            }

            video.src = streamUrl;
        }

        function playVideo() {
            attachStream();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {
                    setMessage("点击视频画面即可继续播放");
                });
            }
        }

        if (cover) {
            cover.addEventListener("click", playVideo);
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
