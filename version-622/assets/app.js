(function () {
  function onReady(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function escapeText(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function initMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === current);
      });
    }
    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    show(0);
    start();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var year = scope.querySelector("[data-filter-year]");
      var type = scope.querySelector("[data-filter-type]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-card]"));
      if (!cards.length) {
        cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
      }
      function apply() {
        var q = input ? input.value.trim().toLowerCase() : "";
        var y = year ? year.value : "";
        var t = type ? type.value : "";
        cards.forEach(function (card) {
          var text = ((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || "")).toLowerCase();
          var cardYear = card.getAttribute("data-year") || "";
          var cardType = card.getAttribute("data-type") || "";
          var ok = (!q || text.indexOf(q) !== -1) && (!y || cardYear.indexOf(y) !== -1) && (!t || cardType.indexOf(t) !== -1);
          card.setAttribute("data-hidden", ok ? "false" : "true");
        });
      }
      [input, year, type].forEach(function (el) {
        if (el) {
          el.addEventListener("input", apply);
          el.addEventListener("change", apply);
        }
      });
    });
  }

  function cardHTML(item) {
    var tags = (item.tags || []).slice(0, 4).map(function (tag) {
      return "<span>" + escapeText(tag) + "</span>";
    }).join("");
    return "<a href=\"" + escapeText(item.href) + "\" class=\"movie-card card card-hover\">" +
      "<span class=\"poster-frame\">" +
      "<img src=\"" + escapeText(item.cover) + "\" alt=\"" + escapeText(item.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-shade\"></span><span class=\"play-badge\">▶</span><span class=\"card-chip\">" + escapeText(item.type) + "</span>" +
      "</span><span class=\"movie-card-body\">" +
      "<span class=\"meta-line\">" + escapeText(item.region) + " · " + escapeText(item.year) + " · " + escapeText(item.genre) + "</span>" +
      "<strong>" + escapeText(item.title) + "</strong>" +
      "<em>" + escapeText(item.oneLine) + "</em>" +
      "<span class=\"tag-list\">" + tags + "</span>" +
      "</span></a>";
  }

  function initSearch() {
    var input = document.getElementById("site-search");
    var button = document.getElementById("site-search-btn");
    var results = document.getElementById("search-results");
    if (!input || !results || typeof VIDEO_INDEX === "undefined") {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function render() {
      var q = input.value.trim().toLowerCase();
      var list = VIDEO_INDEX.filter(function (item) {
        if (!q) {
          return item.pick;
        }
        return item.search.indexOf(q) !== -1;
      }).slice(0, q ? 96 : 48);
      if (!list.length) {
        results.innerHTML = "<div class=\"empty-state card\"><strong>暂无相关内容</strong><span>换一个关键词继续搜索。</span></div>";
        return;
      }
      results.innerHTML = list.map(cardHTML).join("");
    }
    input.addEventListener("input", render);
    if (button) {
      button.addEventListener("click", render);
    }
    render();
  }

  function initPlayer() {
    var boxes = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    boxes.forEach(function (box) {
      var video = box.querySelector("video");
      var play = box.querySelector("[data-play]");
      var message = box.querySelector(".player-message");
      var stream = box.getAttribute("data-stream") || "";
      var ready = false;
      var hls = null;
      function setMessage(text) {
        if (message) {
          message.textContent = text || "";
        }
      }
      function prepare() {
        if (ready || !video || !stream) {
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(stream);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setMessage("播放暂时不可用，请稍后再试");
            }
          });
        } else {
          video.src = stream;
        }
        ready = true;
      }
      function start() {
        prepare();
        box.classList.add("is-playing");
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            setMessage("点击视频区域继续播放");
          });
        }
      }
      if (play) {
        play.addEventListener("click", start);
      }
      if (video) {
        video.addEventListener("play", function () {
          box.classList.add("is-playing");
          setMessage("");
        });
      }
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  onReady(function () {
    initMenu();
    initHero();
    initFilters();
    initSearch();
    initPlayer();
  });
})();
