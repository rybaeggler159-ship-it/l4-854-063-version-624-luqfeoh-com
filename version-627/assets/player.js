(function () {
  window.initMoviePlayer = function (src) {
    var video = document.getElementById('movie-video');
    var overlay = document.getElementById('movie-overlay');
    var errorBox = document.getElementById('player-error');
    var hls = null;
    var loaded = false;

    if (!video || !overlay || !src) {
      return;
    }

    function showError(message) {
      if (!errorBox) {
        return;
      }
      errorBox.textContent = message;
      errorBox.hidden = false;
    }

    function loadSource() {
      if (loaded) {
        return true;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          showError('视频暂时无法加载');
        });
        return true;
      }
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = src;
        return true;
      }
      showError('视频暂时无法加载');
      return false;
    }

    function startPlayback() {
      if (!loadSource()) {
        return;
      }
      overlay.classList.add('hidden');
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          overlay.classList.remove('hidden');
        });
      }
    }

    overlay.addEventListener('click', startPlayback);
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
    window.addEventListener('pagehide', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
