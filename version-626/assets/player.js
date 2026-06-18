(function () {
  function attachMoviePlayer(source) {
    var video = document.getElementById('movie-player');
    var cover = document.querySelector('.player-cover');
    var loaded = false;
    var hls = null;

    if (!video || !source) {
      return;
    }

    function beginPlayback() {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    function loadVideo() {
      if (cover) {
        cover.classList.add('is-hidden');
      }

      if (!loaded) {
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
        } else if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(source);
          hls.attachMedia(video);
        } else {
          video.src = source;
        }
      }

      if (video.readyState > 0) {
        beginPlayback();
      } else {
        video.addEventListener('loadedmetadata', beginPlayback, { once: true });
      }
    }

    if (cover) {
      cover.addEventListener('click', loadVideo);
    }

    video.addEventListener('click', function () {
      if (!loaded) {
        loadVideo();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  window.attachMoviePlayer = attachMoviePlayer;
}());
