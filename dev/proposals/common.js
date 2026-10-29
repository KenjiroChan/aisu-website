/* Shared bits for the menu proposals: English names, icons, price formatting. */
window.P = (function(){
  const M = window.AISU_MENU;
  const ar = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  const GROUPS = [
    {tab:'cafes', gi:0, id:'esp',   name:'Espressos & classics', chip:'Espressos'},
    {tab:'cafes', gi:1, id:'latte', name:'Lattes', chip:'Lattes'},
    {tab:'cafes', gi:2, id:'sans',  name:'Coffee-free', chip:'Coffee-free'},
    {tab:'matcha',gi:0, id:'matcha',name:'Matcha selection', chip:'Matcha'},
    {tab:'matcha',gi:1, id:'thes',  name:'Signature iced teas', chip:'Iced teas'},
    {tab:'jus',   gi:0, id:'jus',   name:'Juices & smoothies', chip:'Juices', sub:'Cold-pressed, no added sugar'},
    {tab:'jus',   gi:1, id:'avo',   name:'Avocado & milkshakes', chip:'Avocado & shakes'},
  ].map(g => ({...g, cols: M.CARTE[g.tab][g.gi].cols, items: M.CARTE[g.tab][g.gi].items.map((it, ii) => ({
      name: it[0], note: it[3] ? (it[3].en || it[3].fr) : '', key: `${g.tab}-${g.gi}-${ii}`,
      opts: [0, 1].map(ci => it[1 + ci] == null ? null : {col: M.CARTE[g.tab][g.gi].cols[ci], price: it[1 + ci]}).filter(Boolean)
    }))}));
  const LABEL = {hot:'Hot', cold:'Iced', glass:'Glass', pitcher:'Pitcher'};
  const ICON = {
    hot:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 7h8v3.5A3.5 3.5 0 0 1 7.5 14h-1A3.5 3.5 0 0 1 3 10.5V7zM11 8h1a1.6 1.6 0 0 1 0 3.2h-1.1M5.5 2.5c-.6.8.6 1.4 0 2.3M8.2 2.5c-.6.8.6 1.4 0 2.3" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    cold:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5v13M2.4 4.75l11.2 6.5M2.4 11.25l11.2-6.5M6.3 2.8 8 4.4l1.7-1.6M6.3 13.2 8 11.6l1.7 1.6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    glass:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2h8l-1 11.2a1 1 0 0 1-1 .8H6a1 1 0 0 1-1-.8L4 2zM4.5 6h7" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
    pitcher:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5h6.5l-.6 2.2c1.9.5 2.6 2 2.1 3.6-.4 1.3-1.4 2-2.6 2.1L9 13a1 1 0 0 1-1 .9H5.4a1 1 0 0 1-1-.9L4 2.5zM9.9 4.7 9.4 10.4M4.3 6.5h5.6" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
    plus:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 3.5v9M3.5 8h9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    search:'<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="5.5" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="m13.2 13.2 3.6 3.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>'
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const header = `<header class="nav"><div class="in"><img src="../../img/parfi/parfi-logo-sticker.webp" alt=""><span class="mark">AISU</span><span class="sp"></span><span class="ord">ORDER · 0</span></div></header>`;
  return {M, ar, GROUPS, LABEL, ICON, esc, header};
})();
