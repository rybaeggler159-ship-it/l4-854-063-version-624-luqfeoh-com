(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-menu]");

    if (menuButton && menu) {
      menuButton.addEventListener("click", function () {
        menu.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;
    var heroTimer = null;

    function showHero(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === activeIndex);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === activeIndex);
      });
    }

    function startHero() {
      if (slides.length <= 1) {
        return;
      }

      heroTimer = window.setInterval(function () {
        showHero(activeIndex + 1);
      }, 5000);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        if (heroTimer) {
          window.clearInterval(heroTimer);
        }

        showHero(dotIndex);
        startHero();
      });
    });

    showHero(0);
    startHero();

    var input = document.getElementById("searchInput");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
    var chips = Array.prototype.slice.call(document.querySelectorAll("[data-filter-chip]"));
    var empty = document.getElementById("emptyMessage");
    var currentChip = "";

    function normalize(value) {
      return (value || "").toString().toLowerCase().trim();
    }

    function filterCards() {
      if (!cards.length) {
        return;
      }

      var keyword = normalize(input ? input.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-keywords"));
        var chipMatched = !currentChip || text.indexOf(normalize(currentChip)) !== -1;
        var keywordMatched = !keyword || text.indexOf(keyword) !== -1;
        var matched = chipMatched && keywordMatched;
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle("is-visible", visible === 0);
      }
    }

    if (input) {
      input.addEventListener("input", filterCards);
    }

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (item) {
          item.classList.remove("is-active");
        });

        chip.classList.add("is-active");
        currentChip = chip.getAttribute("data-filter-chip") || "";
        filterCards();
      });
    });

    filterCards();
  });
})();

function initMoviePlayer(streamUrl) {
  var video = document.getElementById("movieVideo");
  var playButton = document.getElementById("moviePlayButton");
  var attached = false;
  var hlsInstance = null;

  if (!video || !playButton || !streamUrl) {
    return;
  }

  function attachStream() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function beginPlayback() {
    attachStream();
    playButton.classList.add("is-hidden");
    video.controls = true;
    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        playButton.classList.remove("is-hidden");
      });
    }
  }

  playButton.addEventListener("click", beginPlayback);

  video.addEventListener("click", function () {
    if (video.paused) {
      beginPlayback();
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
