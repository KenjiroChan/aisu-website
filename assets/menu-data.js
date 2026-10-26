/* AISU menu, prices and hours — shared by the public site (index.html) and the staff dashboard (staff/).
   Change a price or item here and both update together. Prices are in ariary. */
(function(){
  const TZ = 'Indian/Antananarivo';
  // placeholder opening hours, minutes from midnight; brunch runs Sat & Sun 11:30–16:00 per the menu
  const HOURS = { 0:[540,1260], 1:[540,1200], 2:[540,1200], 3:[540,1200], 4:[540,1200], 5:[540,1260], 6:[540,1260] };
  const BRUNCH = [690, 960];

  const PARFAITS = [
    {id:'p1',no:'01',name:'Miss Coco Cherry',img:'miss-coco-cherry',price:38000,
      flav:{fr:'Cerise · Chocolat · Coco',en:'Cherry · Chocolate · Coconut',mg:'Serizy · Sôkôla · Voanio'},
      layers:['Cookies sablé','Sorbet cerise','Crème fouettée','Glace chocolat','Ganache choco-coco','Brownie chocolat','Cerises','Gelée de cerises','Confit de cerises']},
    {id:'p2',no:'02',name:'Bouquet Fraise',img:'bouquet-fraise',price:38000,
      flav:{fr:'Fraise · Pistache · Chocolat blanc',en:'Strawberry · Pistachio · White chocolate',mg:'Frezy · Pistasy · Sôkôla fotsy'},
      layers:['Sablé pistache','Sorbet fraise','Fraises','Glace pistache','Pistaches concassées','Mousse choco blanc-pistache','Crumble','Gelée de fraises','Coulis de fraise']},
    {id:'p3',no:'03',name:'Tangerine',img:'tangerine',price:38000,
      flav:{fr:'Orange · Matcha · Agrumes',en:'Orange · Matcha · Citrus',mg:'Laoranjy · Matcha · Voasary'},
      layers:['Cookie','Entremet mandarine','Mousse à l\'orange','Glace matcha','Crumble','Orange fraîche','Pudding au matcha','Ganache orange-matcha']},
    {id:'p4',no:'04',name:'Pomme Tatin',img:'pomme-tatin',price:38000,
      flav:{fr:'Caramel beurre salé · Pomme · Vanille',en:'Salted butter caramel · Apple · Vanilla',mg:'Karamely dibera masira · Paoma · Vanily'},
      layers:['Gaufre caramélisée','Pommes','Glace caramel beurre salé','Crème mascarpone vanille','Feuilleté caramélisé','Crème caramel','Pommes caramélisées']},
    {id:'p5',no:'05',name:'Crème Soda',img:'creme-soda',price:10000,
      flav:{fr:'Pomme pétillante · Vanille · Cerise',en:'Sparkling apple · Vanilla · Cherry',mg:'Paoma mitsiranoka · Vanily · Serizy'},
      layers:['Glace vanille','Cerise','Soda pomme pétillant']}
  ];
  // [name, hot/glass price, cold/pitcher price, {fr,en} note]
  const CARTE = {
    cafes:[
      {g:'g.esp', cols:['hot','cold'], items:[
        ['Espresso',5000,null],['Double Espresso',9000,null],['Café Allongé / Noir',5000,5500],
        ['Affogato',10000,null,{fr:'double espresso, une boule glace vanille',en:'double espresso, one scoop of vanilla ice cream'}],
        ['Pistachio Affogato',15000,null,{fr:'glace pistache, crème de pistache, double espresso',en:'pistachio ice cream, pistachio cream, double espresso'}]]},
      {g:'g.latte', cols:['hot','cold'], items:[
        ['Cappuccino / Latte',6000,7000],['Café au Lait Concentré Sucré',6000,7000],
        ['Café Dalgona',6000,null,{fr:'lait, nuage de café fouetté, sucré',en:'milk, a cloud of whipped coffee, sweetened'}],
        ['Café Mocha',8000,9000],
        ['Cococcino',8000,9000,{fr:'espresso, lait et crème de coco',en:'espresso, milk and coconut cream'}],
        ['Café Pistache',10000,11000,{fr:'espresso, lait et crème de pistache',en:'espresso, milk and pistachio cream'}],
        ['Café Tiramisu',10000,11000,{fr:'espresso, cacao, crème tiramisu',en:'espresso, cocoa, tiramisu cream'}]]},
      {g:'g.sans', cols:['hot','cold'], items:[
        ['Chai Latte',9000,9500],['Thé au Lait Thaï',9000,9500],['Chocolat Menthe',8000,8500],['Chocolat Viennois à la Banane',9000,9500],
        ['Golden Latte',6000,8500,{fr:'gingembre, curcuma, orange, miel',en:'ginger, turmeric, orange, honey'}],
        ['Lait Aromatisé',7000,7500,{fr:'banane ou fraise',en:'banana or strawberry'}],
        ['Thé à la Pêche & Crème',9000,9500,{fr:'thé pêche au lait, nuage de crème à la pêche',en:'peach milk tea, a cloud of peach cream'}]]}
    ],
    matcha:[
      {g:'g.matcha', cols:['hot','cold'], items:[
        ['Matcha Latte',10000,11000,{fr:'matcha au lait',en:'matcha with milk'}],
        ['Pistache Matcha Latte',11000,12000,{fr:'crème de pistache, matcha au lait',en:'pistachio cream, matcha with milk'}],
        ['Yuzu Matcha Pétillant',null,12000,{fr:'eau pétillante, concentré de yuzu, thé matcha sucré',en:'sparkling water, yuzu concentrate, sweetened matcha'}],
        ['Matcha aux Fruits',null,12000,{fr:'fraise, coco, banane ou mangue, crème maison',en:'strawberry, coconut, banana or mango, house cream'}],
        ['Matcha Chocolat Blanc',11000,12000,{fr:'matcha au lait, crème au chocolat blanc',en:'matcha with milk, white chocolate cream'}],
        ['Matcha Cloud',null,12000,{fr:'jus de coco, thé jasmin, mousse de lait matcha',en:'coconut water, jasmine tea, matcha milk foam'}]]},
      {g:'g.thes', cols:['glass','pitcher'], items:[
        ['Citron & Menthe',8000,16000],['Mandarine & Yuzu',8000,18000],
        ['Oolong aux Fruits Frais',8000,18000,{fr:'fruits frais de saison',en:'fresh seasonal fruit'}],
        ['Passion',8000,16000],['Lychee Hibiscus',8000,16000]]}
    ],
    jus:[
      {g:'g.jus', sub:'g.jus.sub', cols:['glass','pitcher'], items:[
        ['Green Moment',9000,18000,{fr:'pomme, lime, concombre, menthe',en:'apple, lime, cucumber, mint'}],
        ['Good Look',10000,20000,{fr:'orange, ananas, pomme, carotte',en:'orange, pineapple, apple, carrot'}],
        ['Red Punch',10000,20000,{fr:'betterave, ananas, pomme',en:'beetroot, pineapple, apple'}],
        ['Jus de Saison',9000,18000,{fr:'fruit de saison pressé',en:'pressed seasonal fruit'}],
        ['Tropical Twist',12000,24000,{fr:'ananas, orange, passion, mangue, coco',en:'pineapple, orange, passion fruit, mango, coconut'}]]},
      {g:'g.avo', cols:['glass','pitcher'], items:[
        ['Supermodel',12000,24000,{fr:'framboise, fraise, myrtille, carotte, ananas, pomme, poire, pitaya, betterave',en:'raspberry, strawberry, blueberry, carrot, pineapple, apple, pear, dragon fruit, beetroot'}],
        ['Avo-Crush',10000,20000,{fr:'chocolat, orange, avoine, lait, avocat',en:'chocolate, orange, oats, milk, avocado'}],
        ['Avo-Core',10000,16000,{fr:'fraise, amande, chia, coco, citron, avocat',en:'strawberry, almond, chia, coconut, lemon, avocado'}],
        ['Avo-Glow',9000,18000,{fr:'mangue, ananas, avocat',en:'mango, pineapple, avocado'}],
        ['Milkshake',10000,null,{fr:'parfum au choix, Oreo',en:'flavour of your choice, Oreo'}]]}
    ]
  };
  const TEAS = [
    {id:'peppa',name:'Peppa Pig Afternoon Tea',price:70000,inc:'tea.inc.peppa',
      sal:['Sandwich œuf-mayo de Freddy Fox','Quiche jambon-fromage de Madame Gazelle','Mini pizza margherita de Daddy Pig'],
      suc:['Sablé de Peppa Pig','Fondant au chocolat de Mummy Pig','Gaufre gourmande de George','Mini scones, confiture & mascarpone de Granny Pig']},
    {id:'classique',name:'Afternoon Tea Classique',price:80000,inc:'tea.inc.classique',
      sal:['Mini bœuf Wellington','Finger sandwich concombre, crème menthe-citron','Finger sandwich saumon fumé, crème aneth-câpre','Scones salés foie gras & chutney'],
      suc:['Tarte passion','Mini cheesecake au raisin ou pomme crumble','Mini parfait du jour','Mini scones au raisin, confiture & mascarpone']},
    {id:'gourmand',name:'Afternoon Tea Gourmand',price:120000,inc:'tea.inc.gourmand',
      sal:['Mini roll à la langouste','Vol-au-vent aux champignons des bois','Samosa','Finger sandwich concombre, crème menthe-citron'],
      suc:['Tarte aux fruits de saison','Mini cheesecake citron ou pomme crumble','Mini parfait du jour','Mini scones au raisin, confiture & mascarpone']}
  ];
  const EXTRA_ITEMS = { pal4:{name:'La Palette Glacée · 4',price:20000}, pal6:{name:'La Palette Glacée · 6',price:30000} };


  // Look up an item the website put in the basket. Keys: parfait id (p1…p5), extra (pal4, pal6),
  // or a drinks-menu key "tab-group-item-column" such as "cafes-0-3-0".
  function itemFor(key){
    const p = PARFAITS.find(x => x.id === key);
    if(p) return {name: p.name, price: p.price};
    if(EXTRA_ITEMS[key]) return {name: EXTRA_ITEMS[key].name, price: EXTRA_ITEMS[key].price};
    const m = /^(cafes|matcha|jus)-(\d+)-(\d+)-([01])$/.exec(key || '');
    if(m){
      const grp = (CARTE[m[1]] || [])[Number(m[2])]; const it = grp && grp.items[Number(m[3])];
      const price = it ? it[1 + Number(m[4])] : null;
      if(it && price != null) return {name: it[0], price, option: grp.cols[Number(m[4])]};
    }
    return null;
  }
  window.AISU_MENU = Object.freeze({TZ, HOURS, BRUNCH, PARFAITS, CARTE, TEAS, EXTRA_ITEMS, itemFor});
})();
