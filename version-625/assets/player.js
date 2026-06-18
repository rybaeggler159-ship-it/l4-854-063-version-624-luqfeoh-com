(function(){
  var root=document.querySelector('[data-player]');
  if(!root)return;
  var video=root.querySelector('video');
  var btn=root.querySelector('.poster-play');
  var status=root.querySelector('.player-status');
  var src=root.getAttribute('data-video');
  var loaded=false;
  var hls=null;
  function fail(){if(status){status.style.display='block';status.textContent='视频加载失败，请稍后重试'}}
  function load(){
    if(loaded||!video||!src)return;
    loaded=true;
    if(window.Hls&&window.Hls.isSupported()){
      hls=new window.Hls({enableWorker:true,lowLatencyMode:true});
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.ERROR,function(event,data){if(data&&data.fatal){if(data.type===window.Hls.ErrorTypes.MEDIA_ERROR){hls.recoverMediaError()}else{fail()}}});
    }else if(video.canPlayType('application/vnd.apple.mpegurl')){
      video.src=src;
    }else{fail()}
  }
  function start(){
    load();
    if(btn)btn.classList.add('is-hidden');
    var attempt=video.play();
    if(attempt&&attempt.catch){attempt.catch(function(){if(btn)btn.classList.remove('is-hidden')})}
  }
  if(btn)btn.addEventListener('click',start);
  video.addEventListener('click',function(){if(video.paused){start()}else{video.pause()}});
  video.addEventListener('play',function(){if(btn)btn.classList.add('is-hidden')});
  video.addEventListener('pause',function(){if(video.currentTime<.2&&btn)btn.classList.remove('is-hidden')});
  window.addEventListener('beforeunload',function(){if(hls&&hls.destroy)hls.destroy()});
})();
