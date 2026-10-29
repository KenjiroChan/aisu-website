(function(){
  const {M, ar, esc, header} = window.P;
  const INC = {peppa:'Tea (hot or iced) or hot chocolate included', classique:'Coffee, tea or hot chocolate included', gourmand:'A glass of bubbles each, plus hot or iced tea or hot chocolate'};
  const SHORT = {peppa:'Peppa Pig', classique:'Classique', gourmand:'Gourmand'};
  const cup = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 7h8v3.5A3.5 3.5 0 0 1 7.5 14h-1A3.5 3.5 0 0 1 3 10.5V7zM11 8h1a1.6 1.6 0 0 1 0 3.2h-1.1M5.5 2.5c-.6.8.6 1.4 0 2.3M8.2 2.5c-.6.8.6 1.4 0 2.3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  let pick = 'classique';
  const app = document.getElementById('app');
  function draw(){
    app.innerHTML = header + `<main class="wrap">
    <section aria-labelledby="bh">
      <div class="c-head"><div><h2 id="bh">Le Brunch</h2><p class="when">Saturday 11:30 am – 4 pm, Sunday 11:30 am – 3 pm</p></div><span class="price">85 000<small>Ar per person</small></span></div>
      <div class="set">
        <div class="step"><p class="n"><i>1</i>To start</p><p class="hint">Brought to the table for everyone</p>
          <ul class="starters"><li>Viennoiseries</li><li>Baguette, butter and jam</li><li>Cinnamon roll</li><li>Cheese board</li></ul></div>
        <div class="step"><p class="n"><i>2</i>Choose a main</p><p class="hint">One each</p>
          <ul class="mains">
            <li><b>Œufs Bénédicte</b><span>hollandaise, bacon, toasted roll, roast potatoes, mushrooms</span></li>
            <li><b>Avocado Toast</b><span>serrano ham, fromage blanc, seeded bread, roast potatoes, mushrooms</span></li>
            <li><b>Pain Perdu <em>sweet</em></b><span>vanilla ice cream, salted caramel, fruit salad</span></li>
            <li><b>Pancakes <em>sweet</em></b><span>maple syrup, vanilla ice cream, fruit salad</span></li></ul></div>
        <div class="step"><p class="n"><i>3</i>On the side</p><p class="hint">Add any of these, if you're hungry</p>
          <ul class="extras"><li><span>Smoked salmon</span><span>10 000</span></li><li><span>Chicken sausages</span><span>8 000</span></li><li><span>Fries</span><span>7 000</span></li></ul></div>
        <div class="set-foot"><p>Includes a hot drink of your choice and a 20 cl fresh-pressed juice.</p><a class="btn" href="#">Book brunch</a></div>
      </div>
    </section>
    <section aria-labelledby="th">
      <div class="c-head"><div><h2 id="th">Afternoon Tea</h2><p class="when">Served every day, for two</p></div></div>
      <div class="seg" role="group" aria-label="Choose a tray">${M.TEAS.map(t => `<button type="button" data-t="${t.id}" aria-pressed="${t.id === pick}"><b>${SHORT[t.id]}</b><span>${ar(t.price)}</span></button>`).join('')}</div>
      <div class="compare">${M.TEAS.map(t => `<article class="tea ${t.id === pick ? 'pick' : ''}">
        ${t.id === 'peppa' ? '<span class="badge">For little ones</span>' : t.id === 'gourmand' ? '<span class="badge">With bubbles</span>' : '<span class="badge">The original</span>'}
        <div><h3>${esc(t.name.replace('Afternoon Tea ', '').replace(' Afternoon Tea', ''))}</h3><p class="for">Afternoon tea for two</p></div>
        <span class="price">${ar(t.price)}<small>Ar for two</small></span>
        <div style="display:grid;gap:14px;align-content:start"><p class="inc">${cup}${INC[t.id]}</p>
        <div class="tray"><div><h4>Savoury</h4><ul>${t.sal.map(s => `<li>${esc(s)}</li>`).join('')}</ul></div><div><h4>Sweet</h4><ul>${t.suc.map(s => `<li>${esc(s)}</li>`).join('')}</ul></div></div></div>
        <a class="btn" href="#">Book this tea</a></article>`).join('')}</div>
      <p class="note">Brunch and afternoon tea are served in the café. Book a table to make sure you get one.</p>
    </section></main><div class="tabbar"></div>`;
  }
  app.addEventListener('click', e => { const b = e.target.closest('[data-t]'); if(b){ pick = b.dataset.t; draw(); } });
  window.__pick = id => { pick = id; draw(); };
  draw();
})();
