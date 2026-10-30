globalThis.window=globalThis;const fs=require('fs');
const html=fs.readFileSync('../../index.html','utf8');[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(s=>!s.includes("const C = window.VegCore")&&!s.includes('document.')).forEach(s=>{try{(0,eval)(s)}catch(e){}});
const C=globalThis.VegCore;const names=new Map(), pres=new Set(), heads=new Set();
const add=(n,src)=>{if(!names.has(n))names.set(n,src)};
const ctxs=[['Kakku\n','\nVatkaa ja paista uunissa 175 asteessa 30 min.'],['Kastike\n','\nKeitä kattilassa ja tarjoa.'],['Cake\n','\nWhisk and bake at 350F for 30 min.'],['Stew\n','\nSimmer in a pot and serve.'],['Pihvit\n','\nPaista pannulla.'],['Salad\n','\nToss and serve cold.']];
C.ENTRIES.filter(e=>e.st==='A'||e.st==='P'||e.st==='M').forEach(e=>{
  e.aliases.slice(0,8).forEach(a=>{ if(a.length<3)return;
    ctxs.forEach(([h,t])=>{ const txt=h+'2 dl '+a+'\n1 tl suolaa'+t; try{const p=C.buildParsed(C.classify(txt,'',[],{noTitle:true}));const r=C.convertParsed(p,txt,[],[]);
      r.ingredients.forEach(i=>{ if(i.head) heads.add(i.head); else if(i.changed) add(i.name,a)}); r.steps.forEach(s=>{ if(!/Keitä kattilassa|Vatkaa ja paista|Simmer|Whisk|Paista pannulla|Toss/.test(s)) pres.add(s)}); }catch(err){} });
  });
});
// restriktiot ja kotitekoiset
const RR=globalThis.VegRules;
fs.writeFileSync('korvikenimet.json',JSON.stringify({names:[...names.keys()].sort(),pres:[...pres].sort(),heads:[...heads].sort()},null,1));
console.log(names.size,'nimeä',pres.size,'esivaihetta',heads.size,'otsikkoa');
