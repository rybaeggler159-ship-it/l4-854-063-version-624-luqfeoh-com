(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function initHeader() {
    var header = document.querySelector("[data-header]");
    var toggle = document.querySelector("[data-mobile-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    function onScroll() {
      if (!header) {
        return;
      }
      header.classList.toggle("is-scrolled", window.scrollY > 16);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }
  }

  function initSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;
    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot) {
        dot.classList.toggle("is-active", Number(dot.getAttribute("data-hero-dot")) === index);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")));
        start();
      });
    });
    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function normalize(text) {
    return (text || "").toString().toLowerCase().trim();
  }

  function initFilters() {
    var grid = document.querySelector("[data-filter-grid]");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".js-filter-card"));
    var input = document.querySelector(".js-live-filter");
    var year = document.querySelector(".js-year-filter");
    var type = document.querySelector(".js-type-filter");
    var category = document.querySelector(".js-category-filter");
    var sort = document.querySelector(".js-sort-select");
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && input) {
      input.value = query;
    }
    function matchYear(card, value) {
      if (value === "all") {
        return true;
      }
      var cardYear = card.getAttribute("data-year") || "";
      if (value === "older") {
        var num = Number((cardYear.match(/\d{4}/) || [0])[0]);
        return !num || num <= 2020;
      }
      return cardYear.indexOf(value) !== -1;
    }
    function apply() {
      var text = normalize(input && input.value);
      var selectedYear = year ? year.value : "all";
      var selectedType = type ? type.value : "all";
      var selectedCategory = category ? category.value : "all";
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-year"),
          card.getAttribute("data-type"),
          card.getAttribute("data-region"),
          card.getAttribute("data-tags")
        ].join(" "));
        var ok = true;
        if (text && haystack.indexOf(text) === -1) {
          ok = false;
        }
        if (ok && !matchYear(card, selectedYear)) {
          ok = false;
        }
        if (ok && selectedType !== "all" && card.getAttribute("data-type") !== selectedType) {
          ok = false;
        }
        if (ok && selectedCategory !== "all" && card.getAttribute("data-category") !== selectedCategory) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }
    function sortCards() {
      var value = sort ? sort.value : "default";
      var sorted = cards.slice();
      if (value === "year-desc") {
        sorted.sort(function (a, b) {
          var ay = Number(((a.getAttribute("data-year") || "").match(/\d{4}/) || [0])[0]);
          var by = Number(((b.getAttribute("data-year") || "").match(/\d{4}/) || [0])[0]);
          return by - ay;
        });
      }
      if (value === "title-asc") {
        sorted.sort(function (a, b) {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        });
      }
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      apply();
    }
    [input, year, type, category].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });
    if (sort) {
      sort.addEventListener("change", sortCards);
    }
    apply();
  }

  function initPlayers() {
    document.querySelectorAll(".js-player").forEach(function (shell) {
      var video = shell.querySelector("video");
      var overlay = shell.querySelector(".player-overlay");
      if (!video) {
        return;
      }
      var source = video.getAttribute("data-src");
      var loaded = false;
      var hls = null;
      function attach() {
        if (loaded || !source) {
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
        loaded = true;
      }
      function play() {
        attach();
        shell.classList.add("is-playing");
        var attempt = video.play();
        if (attempt && attempt.catch) {
          attempt.catch(function () {
            shell.classList.remove("is-playing");
          });
        }
      }
      if (overlay) {
        overlay.addEventListener("click", play);
      }
      video.addEventListener("click", function () {
        if (!loaded || video.paused) {
          play();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-playing");
      });
      video.addEventListener("pause", function () {
        if (!video.currentTime) {
          shell.classList.remove("is-playing");
        }
      });
      window.addEventListener("beforeunload", function () {
        if (hls && hls.destroy) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    initHeader();
    initSearchForms();
    initHero();
    initFilters();
    initPlayers();
  });
})();
