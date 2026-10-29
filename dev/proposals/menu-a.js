(function(){
  const {GROUPS, LABEL, ICON, ar, esc, header} = window.P;
  const app = document.getElementById('app');
  const hl = (s, q) => !q ? esc(s) : esc(s).replace(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'ig'), '<mark>$1</mark>');
  function render(q){
    q = (q || '').trim();
    const ql = q.toLowerCase();
    const groups = GROUPS.map(g => ({...g, shown: g.items.filter(it => !ql || it.name.toLowerCase().includes(ql) || it.note.toLowerCase().includes(ql))})).filter(g => g.shown.length);
    document.getElementById('groups').innerHTML = groups.length ? groups.map(g => `
      <section class="grp" id="g-${g.id}" aria-labelledby="h-${g.id}">
        <h2 id="h-${g.id}">${esc(g.name)}<small>${g.shown.length} ${g.shown.length===1?"drink":"drinks"}</small></h2>
        ${g.sub ? `<p class="sub">${esc(g.sub)}</p>` : ''}
        <ul class="items">${g.shown.map(it => `<li class="item"><b>${hl(it.name, q)}</b>${it.note ? `<span class="note">${hl(it.note, q)}</span>` : ''}
          <span class="opts">${it.opts.map(o => `<button type="button" class="opt" data-col="${o.col}" aria-label="Add ${esc(it.name)}, ${LABEL[o.col].toLowerCase()}, ${o.price} ariary">
            <span class="l">${ICON[o.col]}${LABEL[o.col]}</span><span class="pr">${ar(o.price)}</span><span class="add">${ICON.plus}</span></button>`).join('')}</span></li>`).join('')}</ul>
      </section>`).join('') : `<p class="none">No drink matches “${esc(q)}”. Try another word, like “matcha” or “mango”.</p>`;
    document.querySelectorAll('.index a').forEach(a => { a.hidden = !groups.some(g => 'g-' + g.id === a.getAttribute('href').slice(1)); });
    spy();
  }
  app.innerHTML = header + `<main class="menu">
    <div class="m-head"><h1>The menu</h1><p>Espressos, lattes, matcha, iced teas and cold-pressed juices. Prices in ariary. Tap a price to add it to your order.</p></div>
    <div class="layout">
      <div class="finder">
        <label class="search">${ICON.search}<input type="search" id="q" placeholder="Find a drink" aria-label="Find a drink"></label>
        <nav aria-label="Drink groups"><ol class="index">${GROUPS.map(g => `<li style="display:contents"><a href="#g-${g.id}">${esc(g.chip)}<span>${g.items.length}</span></a></li>`).join('')}</ol></nav>
        <p class="legend">Each price says what it's for: hot or iced, a glass or a pitcher to share.</p>
      </div>
      <div class="groups" id="groups"></div>
    </div></main><div class="tabbar"></div>`;
  // which group is on screen: highlight it in the index / chip bar
  function spy(){
    const top = matchMedia('(max-width:900px)').matches ? 190 : 120;
    let cur = null; document.querySelectorAll('.grp').forEach(s => { if(s.getBoundingClientRect().top - top < 1) cur = s.id; });
    if(!cur){ const f = document.querySelector('.grp'); cur = f && f.id; }
    document.querySelectorAll('.index a').forEach(a => { const on = a.getAttribute('href') === '#' + cur; a.setAttribute('aria-current', on); if(on && matchMedia('(max-width:900px)').matches){ const bar = a.parentElement.parentElement; const r = a.getBoundingClientRect(); if(r.left < 0 || r.right > innerWidth) bar.scrollLeft += r.left - 20; } });
  }
  addEventListener('scroll', spy, {passive:true});
  document.getElementById('q').addEventListener('input', e => render(e.target.value));
  document.addEventListener('click', e => { const b = e.target.closest('.opt'); if(b){ b.classList.add('added'); setTimeout(() => b.classList.remove('added'), 900); } });
  window.__render = render;
  render('');
})();
