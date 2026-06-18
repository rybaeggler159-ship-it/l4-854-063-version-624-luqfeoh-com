(function(){
  var toggle=document.querySelector('[data-menu-toggle]');
  var panel=document.querySelector('[data-mobile-panel]');
  if(toggle&&panel){toggle.addEventListener('click',function(){panel.classList.toggle('open')})}
  document.querySelectorAll('[data-hero]').forEach(function(hero){
    var slides=[].slice.call(hero.querySelectorAll('.hero-slide'));
    var dots=[].slice.call(hero.querySelectorAll('.hero-dot'));
    if(!slides.length)return;
    var current=0;
    function show(i){current=(i+slides.length)%slides.length;slides.forEach(function(s,n){s.classList.toggle('active',n===current)});dots.forEach(function(d,n){d.classList.toggle('active',n===current)})}
    dots.forEach(function(dot,i){dot.addEventListener('click',function(){show(i)})});
    show(0);
    if(slides.length>1){setInterval(function(){show(current+1)},5200)}
  });
  document.querySelectorAll('[data-search-form]').forEach(function(form){
    var scope=form.closest('main')||document;
    var cards=[].slice.call(scope.querySelectorAll('[data-card]'));
    var line=scope.querySelector('[data-result-line]');
    var empty=scope.querySelector('[data-empty-state]');
    function norm(v){return (v||'').toString().toLowerCase().trim()}
    function apply(){
      var fd=new FormData(form);
      var q=norm(fd.get('q'));
      var region=norm(fd.get('region'));
      var year=norm(fd.get('year'));
      var type=norm(fd.get('type'));
      var shown=0;
      cards.forEach(function(card){
        var hay=norm(card.getAttribute('data-title'));
        var ok=(!q||hay.indexOf(q)>-1)&&(!region||norm(card.getAttribute('data-region')).indexOf(region)>-1)&&(!year||norm(card.getAttribute('data-year')).indexOf(year)>-1)&&(!type||norm(card.getAttribute('data-type')).indexOf(type)>-1);
        card.style.display=ok?'':'none';
        if(ok)shown++;
      });
      if(line){line.textContent=shown?'已匹配 '+shown+' 部作品':'没有匹配结果'}
      if(empty){empty.classList.toggle('show',shown===0)}
    }
    form.addEventListener('input',apply);
    form.addEventListener('change',apply);
    form.addEventListener('reset',function(){setTimeout(apply,0)});
    apply();
  });
})();
