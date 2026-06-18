(function () {
  const body = document.body;
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".mobile-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
      body.classList.toggle("menu-open", menu.classList.contains("is-open"));
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  let heroIndex = 0;

  function showHero(index) {
    if (!slides.length) {
      return;
    }
    heroIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === heroIndex);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === heroIndex);
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener("click", function () {
      showHero(i);
    });
  });

  if (slides.length > 1) {
    window.setInterval(function () {
      showHero(heroIndex + 1);
    }, 6200);
  }

  const forms = Array.from(document.querySelectorAll(".global-search-form"));
  forms.forEach(function (form) {
    form.addEventListener("submit", function (event) {
      const input = form.querySelector("input[name='q']");
      if (!input || !input.value.trim()) {
        event.preventDefault();
        window.location.href = "library.html";
      }
    });
  });

  const pageSearch = document.querySelector(".movie-search");
  const typeSelect = document.querySelector(".type-filter");
  const yearSelect = document.querySelector(".year-filter");
  const cards = Array.from(document.querySelectorAll(".movie-card"));
  const empty = document.querySelector(".empty-state");
  const chips = Array.from(document.querySelectorAll(".filter-chip"));
  const urlQuery = new URLSearchParams(window.location.search).get("q") || "";
  const activeFilters = {};

  if (pageSearch && urlQuery) {
    pageSearch.value = urlQuery;
  }

  function normalizeText(text) {
    return (text || "").toString().toLowerCase().trim();
  }

  function applyFilters() {
    if (!cards.length) {
      return;
    }

    const keyword = normalizeText(pageSearch ? pageSearch.value : "");
    const typeValue = normalizeText(typeSelect ? typeSelect.value : "");
    const yearValue = normalizeText(yearSelect ? yearSelect.value : "");
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = normalizeText(card.dataset.keywords || "");
      const type = normalizeText(card.dataset.type || "");
      const year = normalizeText(card.dataset.year || "");
      const region = normalizeText(card.dataset.region || "");
      const category = normalizeText(card.dataset.category || "");
      const keywordMatch = !keyword || haystack.indexOf(keyword) !== -1;
      const typeMatch = !typeValue || type.indexOf(typeValue) !== -1;
      const yearMatch = !yearValue || year === yearValue;
      const chipMatch = Object.keys(activeFilters).every(function (key) {
        const value = normalizeText(activeFilters[key]);
        if (!value) {
          return true;
        }
        if (key === "region") {
          return region.indexOf(value) !== -1;
        }
        if (key === "type") {
          return type.indexOf(value) !== -1;
        }
        if (key === "category") {
          return category.indexOf(value) !== -1;
        }
        if (key === "year") {
          return year === value;
        }
        return true;
      });
      const isVisible = keywordMatch && typeMatch && yearMatch && chipMatch;
      card.style.display = isVisible ? "" : "none";
      if (isVisible) {
        visible += 1;
      }
    });

    if (empty) {
      empty.style.display = visible ? "none" : "block";
    }
  }

  [pageSearch, typeSelect, yearSelect].forEach(function (control) {
    if (control) {
      control.addEventListener("input", applyFilters);
      control.addEventListener("change", applyFilters);
    }
  });

  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      const key = chip.dataset.filterType || "category";
      const value = chip.dataset.filterValue || "";
      const isActive = chip.classList.contains("is-active");
      chips.filter(function (item) {
        return (item.dataset.filterType || "category") === key;
      }).forEach(function (item) {
        item.classList.remove("is-active");
      });
      if (isActive) {
        delete activeFilters[key];
      } else {
        activeFilters[key] = value;
        chip.classList.add("is-active");
      }
      applyFilters();
    });
  });

  if (cards.length) {
    applyFilters();
  }
})();

function initMoviePlayer(streamUrl) {
  const video = document.querySelector("#video-player");
  const overlay = document.querySelector(".player-overlay");

  if (!video || !streamUrl) {
    return;
  }

  let attached = false;

  function attachStream() {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      const hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR, function (_event, data) {
        if (data && data.fatal) {
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        }
      });
    } else {
      video.src = streamUrl;
    }
  }

  function startPlayback() {
    attachStream();
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
    video.controls = true;
    const result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });
}
