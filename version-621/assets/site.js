(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        document.querySelectorAll(".js-menu-toggle").forEach(function (button) {
            var header = button.closest("header");
            var menu = header ? header.querySelector(".mobile-menu") : null;
            if (!menu) {
                return;
            }
            button.addEventListener("click", function () {
                menu.classList.toggle("hidden");
                button.textContent = menu.classList.contains("hidden") ? "☰" : "×";
            });
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var title = hero.querySelector("[data-hero-title]");
        var desc = hero.querySelector("[data-hero-desc]");
        var link = hero.querySelector("[data-hero-link]");
        var dataElement = document.getElementById("hero-data");
        var data = [];
        try {
            data = JSON.parse(dataElement ? dataElement.textContent : "[]");
        } catch (error) {
            data = [];
        }
        var index = 0;

        function render(nextIndex) {
            index = nextIndex;
            slides.forEach(function (slide, slideIndex) {
                var active = slideIndex === index;
                slide.classList.toggle("opacity-100", active);
                slide.classList.toggle("opacity-0", !active);
                slide.classList.toggle("is-active", active);
            });
            dots.forEach(function (dot, dotIndex) {
                var active = dotIndex === index;
                dot.classList.toggle("bg-primary-500", active);
                dot.classList.toggle("w-8", active);
                dot.classList.toggle("bg-white/50", !active);
            });
            if (data[index]) {
                if (title) {
                    title.textContent = data[index].title;
                }
                if (desc) {
                    desc.textContent = data[index].desc;
                }
                if (link) {
                    link.setAttribute("href", data[index].link);
                }
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                var next = Number(dot.getAttribute("data-hero-dot"));
                if (Number.isFinite(next)) {
                    render(next);
                }
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                render((index + 1) % slides.length);
            }, 5000);
        }
    }

    function setupCardFilters() {
        document.querySelectorAll(".js-card-filter").forEach(function (input) {
            var section = input.closest("section") || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card, .ranking-row"));
            var empty = section.querySelector(".js-empty-result");
            input.addEventListener("input", function () {
                var keyword = input.value.trim().toLowerCase();
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-tags"),
                        card.getAttribute("data-genre"),
                        card.getAttribute("data-year")
                    ].join(" ").toLowerCase();
                    var match = !keyword || haystack.indexOf(keyword) !== -1;
                    card.hidden = !match;
                    if (match) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("hidden", shown !== 0);
                }
            });
        });
    }

    function setupPlayers() {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var overlay = player.querySelector(".player-overlay");
            var errorBox = player.querySelector(".player-error");
            var src = player.getAttribute("data-m3u8");
            if (!video || !src) {
                return;
            }

            function showError() {
                if (errorBox) {
                    errorBox.classList.remove("hidden");
                }
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(src);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        showError();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = src;
            } else {
                showError();
            }

            function playVideo() {
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove("is-hidden");
                        }
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener("click", playVideo);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    playVideo();
                }
            });
            video.addEventListener("play", function () {
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
            });
            video.addEventListener("pause", function () {
                if (overlay) {
                    overlay.classList.remove("is-hidden");
                }
            });
        });
    }

    function cardTemplate(movie) {
        var safeTitle = escapeHtml(movie.title);
        var safeLine = escapeHtml(movie.oneLine);
        return [
            '<article class="card card-hover group movie-card">',
            '  <a href="' + escapeAttribute(movie.url) + '" class="block">',
            '    <div class="relative aspect-video overflow-hidden bg-secondary-200">',
            '      <img src="' + escapeAttribute(movie.cover) + '" alt="' + safeTitle + '" loading="lazy" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">',
            '      <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">',
            '        <div class="bg-white/90 rounded-full p-4 transform scale-90 group-hover:scale-100 transition-transform duration-300"><span class="play-symbol">▶</span></div>',
            '      </div>',
            '      <span class="absolute top-3 right-3 bg-black/70 text-white text-xs px-2 py-1 rounded">' + escapeHtml(movie.year) + '</span>',
            '      <span class="absolute top-3 left-3 bg-primary-500 text-white text-xs px-3 py-1 rounded-full font-medium">' + escapeHtml(movie.region) + '</span>',
            '    </div>',
            '    <div class="p-4">',
            '      <h2 class="font-semibold text-secondary-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors text-base">' + safeTitle + '</h2>',
            '      <p class="text-secondary-600 line-clamp-2 mb-3 text-sm">' + safeLine + '</p>',
            '      <div class="flex items-center text-secondary-500 text-xs"><span>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.type) + '</span></div>',
            '    </div>',
            '  </a>',
            '</article>'
        ].join("");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function escapeAttribute(value) {
        return escapeHtml(value).replace(/`/g, "&#096;");
    }

    function setupSearch() {
        var input = document.getElementById("search-input");
        var button = document.getElementById("search-button");
        var results = document.getElementById("search-results");
        var summary = document.getElementById("search-summary");
        if (!input || !results || !window.MOVIES) {
            return;
        }

        function search(keyword) {
            var term = keyword.trim().toLowerCase();
            if (!term) {
                results.innerHTML = "";
                if (summary) {
                    summary.textContent = "输入关键词后即可在全部影片中搜索。";
                }
                return;
            }
            var matches = window.MOVIES.filter(function (movie) {
                var haystack = [
                    movie.title,
                    movie.oneLine,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(" ")
                ].join(" ").toLowerCase();
                return haystack.indexOf(term) !== -1;
            }).slice(0, 160);
            results.innerHTML = matches.map(cardTemplate).join("");
            if (summary) {
                summary.textContent = "找到 " + matches.length + " 条匹配结果" + (matches.length >= 160 ? "，已显示前 160 条" : "") + "。";
            }
        }

        input.addEventListener("input", function () {
            search(input.value);
        });
        if (button) {
            button.addEventListener("click", function () {
                search(input.value);
            });
        }
        document.querySelectorAll(".search-chip").forEach(function (chip) {
            chip.addEventListener("click", function () {
                input.value = chip.textContent.trim();
                search(input.value);
            });
        });
    }

    ready(function () {
        setupMobileMenu();
        setupHero();
        setupCardFilters();
        setupPlayers();
        setupSearch();
    });
})();
