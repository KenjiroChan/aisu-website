(function(){
  const {GROUPS, LABEL, ICON, ar, esc, header} = window.P;
  const TINT = {esp:'#6B3B2A', latte:'#C99A6E', sans:'#E8A6B8', matcha:'#7FA65A', thes:'#F2B33D', jus:'#F08A3C', avo:'#9DBF6A'};
  const phone = () => matchMedia('(max-width:760px)').matches;
  const S = {cat: phone() ? null : GROUPS[0].id, item: phone() ? null : 0, opt: 0, qty: 1, open: false};
  const app = document.getElementById('app');
  const g = () => GROUPS.find(x => x.id === S.cat);
  const lo = gr => Math.min(...gr.items.flatMap(i => i.opts.map(o => o.price)));
  function draw(){
    const gr = g(), it = gr && S.item != null ? gr.items[S.item] : null;
    app.className = phone() ? 'app-phone' : '';
    app.innerHTML = header + `<main class="menu">
      <div class="m-head"><h1>The menu</h1><p>${phone() && gr ? '' : 'Pick what you feel like, then choose your drink.'}</p></div>
      <ul class="tiles ${phone() && gr ? 'is-hidden' : ''}">${GROUPS.map(x => `<li><button type="button" class="tile" data-cat="${x.id}" aria-pressed="${x.id === S.cat}" style="--tint:${TINT[x.id]}">
        <i class="sw"></i><b>${esc(x.name)}</b><span>${x.items.length} drinks · from ${ar(lo(x))}</span></button></li>`).join('')}</ul>
      <div class="stage ${phone() && !gr ? 'is-hidden' : ''}">
        <section>${gr ? `
          <button type="button" class="back" data-back>‹ All drinks</button>
          <div class="switch">${GROUPS.map(x => `<button type="button" data-cat="${x.id}" aria-pressed="${x.id === S.cat}">${esc(x.chip)}</button>`).join('')}</div>
          <div class="list-head"><h2>${esc(gr.name)}</h2><small>${gr.sub ? esc(gr.sub) : gr.items.length + ' drinks'}</small></div>
          <ul class="cards">${gr.items.map((x, i) => `<li><button type="button" class="card" data-item="${i}" aria-current="${i === S.item}">
            <b>${esc(x.name)}</b>${x.note ? `<i>${esc(x.note)}</i>` : ''}
            <span class="from">${x.opts.map(o => `<span class="chip" data-col="${o.col}">${ICON[o.col]}${ar(o.price)}</span>`).join('')}</span></button></li>`).join('')}</ul>` : ''}
        </section>
        <aside class="sheet ${S.open ? 'open' : ''}" aria-label="Your drink">${it ? `
          <h3>${esc(it.name)}</h3>${it.note ? `<p class="note">${esc(it.note)}</p>` : ''}
          ${it.opts.length > 1 ? `<span class="lbl">How would you like it?</span>` : ''}
          <div class="choice">${it.opts.map((o, i) => `<button type="button" data-opt="${i}" aria-pressed="${i === S.opt}"><span class="l">${ICON[o.col]}${LABEL[o.col]}</span><span class="p">${ar(o.price)} Ar</span></button>`).join('')}</div>
          <div class="qrow"><span class="lbl">How many?</span><div class="qty"><button type="button" data-q="-1" aria-label="One less">−</button><output>${S.qty}</output><button type="button" data-q="1" aria-label="One more">+</button></div></div>
          <button type="button" class="addbtn"><span>Add to order</span><span>${ar(it.opts[S.opt].price * S.qty)} Ar</span></button>`
          : `<p class="empty">Choose a drink to see its options.</p>`}</aside>
      </div></main><div class="scrim ${S.open ? 'open' : ''}" data-close></div><div class="tabbar"></div>`;
  }
  app.addEventListener('click', e => {
    const t = e.target.closest('button,[data-close]'); if(!t) return;
    if(t.dataset.cat){ S.cat = t.dataset.cat; S.item = phone() ? null : 0; S.opt = 0; S.qty = 1; S.open = false; }
    else if(t.hasAttribute('data-back')){ S.cat = null; S.item = null; S.open = false; }
    else if(t.dataset.item){ S.item = +t.dataset.item; S.opt = 0; S.qty = 1; S.open = phone(); }
    else if(t.dataset.opt){ S.opt = +t.dataset.opt; }
    else if(t.dataset.q){ S.qty = Math.max(1, Math.min(20, S.qty + +t.dataset.q)); }
    else if(t.hasAttribute('data-close')){ S.open = false; }
    else return;
    draw();
  });
  window.__state = (s) => { Object.assign(S, s); draw(); };
  draw();
})();
