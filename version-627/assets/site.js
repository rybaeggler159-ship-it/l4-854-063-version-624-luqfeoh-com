(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');
    if (menuButton && mobilePanel) {
      menuButton.addEventListener('click', function () {
        mobilePanel.classList.toggle('open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === current);
        });
      }

      function play() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-slide') || 0));
          play();
        });
      });

      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          play();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          play();
        });
      }
      play();
    }

    var searchInput = document.querySelector('.js-search');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    var activeFilter = '';

    function applyFilter() {
      if (!cards.length) {
        return;
      }
      var query = searchInput ? searchInput.value.trim().toLocaleLowerCase() : '';
      cards.forEach(function (card) {
        var text = card.getAttribute('data-search') || '';
        var tags = card.getAttribute('data-tags') || '';
        var textOk = !query || text.indexOf(query) !== -1;
        var tagOk = !activeFilter || tags.indexOf(activeFilter) !== -1 || text.indexOf(activeFilter) !== -1;
        card.hidden = !(textOk && tagOk);
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', applyFilter);
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (item) {
          item.classList.remove('active');
        });
        chip.classList.add('active');
        activeFilter = chip.getAttribute('data-filter') || '';
        applyFilter();
      });
    });
  });
})();
