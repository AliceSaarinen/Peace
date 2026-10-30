/* Reseptin rajausten testi (sokeriton, rasvaton, öljytön, vehnätön, gluteeniton, soijaton, pähkinätön, whole food):
   jokainen rajaus jokaiselle testireseptille. Kielletty aines ei saa jäädä ainesluetteloon eikä valmistusvaiheisiin,
   eläinperäistä ei saa jäädä, ja englanninkielinen resepti pysyy englanninkielisenä. Ajo: node rajaukset.js [--v] */
const fs=require('fs');const h=fs.readFileSync(__dirname+'/../../index.html','utf8');global.window=global;
[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(s=>!s.includes('document.')).forEach(s=>{try{(0,eval)(s)}catch(e){}});
const C=VegCore,RR=VegRules;
const n=s=>' '+String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,' ').trim()+' ';
/* kielletyt sanat lopputuloksessa (tarkistus erillinen säännöistä) */
const BAN={
 sokeriton:[/(^| )(sokeri|sokeria|sokerin|fariinisokeri\w*|tomusokeri\w*|raesokeri\w*|siirappi\w*|hunaja\w*|agave\w*|sugar|syrup|honey|hillo\w*|jam|kondensoit\w*|maple|vaahterasiirap\w*)( |$)/, /(sokeriton|vaniljasokeri|ilman sokeria|unsweetened|maustamaton|ei makeutettu)/],
 rasvaton:[/(^| )(oljy\w*|oil|margariini\w*|margarine|leivontarasva\w*|levite\w*|kookosoljy\w*|pahkinavoi\w*|maapahkinavoi\w*|tahini\w*|peanut butter|butter|kookosmaito\w*|kookoskerma\w*|coconut milk|coconut cream|kaurakerma\w*|kasvikerma\w*|avokado\w*)( |$)/, /(jata pois|valinnainen|optional|omit)/],
 oljyton:[/(^| )(oljy\w*|oil|margariini\w*|margarine|leivontarasva\w*|levite\w*|kookosoljy\w*)( |$)/, /(jata pois|valinnainen)/],
 vehnaton:[/(^| )(vehna\w*|speltti\w*|spelt|flour|all purpose|bread flour|bulgur|couscous|seitan|mannasuurimo\w*|korppujauho\w*|pasta\w*|makaroni\w*|spagetti\w*|lasagnelevy\w*|tortilla\w*|nuudel\w*|keksi\w*|keksej\w*|grahamjauho\w*|jauho|jauhoja|jauhot)( |$)/, /(gluteeniton|gluteenittom|vehnaton|riisi|maissi|kikherne|linssi|tattari|kaura|ruis|peruna|manteli)/],
 gluteeniton:[/(^| )(vehna\w*|speltti\w*|ohra\w*|ruis\w*|ruisjauho\w*|flour|bulgur|couscous|seitan|korppujauho\w*|pasta\w*|makaroni\w*|spagetti\w*|kaurahiutale\w*|kaurajauho\w*|soijakastike\w*|soy sauce|nuudel\w*|keksi\w*|grahamjauho\w*|jauho|jauhoja|jauhot|kaurapal\w*|nyhtokaura\w*)( |$)/, /(gluteeniton|gluteenittom|tamari|riisi|maissi|kikherne|linssi|tattari|peruna|manteli)/],
 soijaton:[/(^| )(soija\w*|soy|tofu\w*|tempeh\w*|edamame|silkkitofu\w*|savutofu\w*)( |$)/, /(soijaton|fava bean tofu|harkapaputofu)/],
 pahkinaton:[/(^| )(pahkina\w*|cashew\w*|mantel\w*|saksanpahkin\w*|hasselpahkin\w*|pekaani\w*|pistaasi\w*|almond\w*|walnut\w*|pecan\w*|hazelnut\w*|nut|nuts|pahkinavoi\w*|maapahkin\w*|peanut\w*)( |$)/, /(pahkinaton|muskottipahkina|kookos)/],
 wholefood:[/(^| )(vegaanista (juustoa|tuorejuustoa|juustoraastetta|mozzarellaa|fetaa|margariinia|leivontamargariinia|majoneesia)|kaurakerma\w*|soijakerma\w*|kasvikerma\w*|vispattavaa kasvikermaa|kaurafraiche\w*|soijajuoma\w*|kaurajuoma\w*|kasvijuoma\w*|mantelijuoma\w*|liemikuutio\w*|jauhis\w*|soijarouhe\w*|harkapapurouhe\w*|nyhtokaura\w*|kaurapal\w*|seitan|kasvismakkara\w*|soijajogurt\w*|kaurajogurt\w*)( |$)/, /(tee itse|ohje alla|kotitekoi|itse tehty|margariini)/]
};
const files=[__dirname+'/reseptit.txt',__dirname+'/uudet.txt'];
const tot={},bad={},samples={};
files.forEach(f=>fs.readFileSync(f,'utf8').split(/^### /m).slice(1).forEach(b=>{const [hd,...rest]=b.split('\n');const t=rest.join('\n').trim();const en=RR.isEnglish(t);const p=C.buildParsed(C.classify(t,'',[],{noTitle:true}));
 Object.keys(BAN).forEach(k=>{let r;try{r=C.convertParsed(p,t,[k],[],{lang:en?'en':'fi'})}catch(e){(bad[k]=bad[k]||[]).push(hd.split('|')[0]+' VIRHE '+e.message);return}
  tot[k]=(tot[k]||0)+1;
  const [ban,ok]=BAN[k];
  const hits=r.ingredients.filter(i=>!i.head).map(i=>n(i.name)).filter(x=>ban.test(x)&&!ok.test(x)&&!/(chickpea flour|corn tortilla|rice noodle|gluten free|nut butter or applesauce|optional|leave out)/.test(x));
  const SB={vehnaton:/(^| )(vehna\w*|speltti\w*|makaroni\w*|spagetti\w*|bulgur|couscous|seitan)( |$)/,gluteeniton:/(^| )(vehna\w*|speltti\w*|ohra\w*|makaroni\w*|spagetti\w*|bulgur|couscous|seitan|soijakastike\w*|soy sauce)( |$)/,wholefood:/(^| )(kaurapal\w*|nyhtokaura\w*|seitan\w*|soijasuikal\w*|jauhis\w*|liemikuutio\w*|kasvismakkara\w*)( |$)/}[k]||ban;const sh=r.steps.map(n).filter(x=>SB.test(x)&&!ok.test(x)&&!/^ tee /.test(x)&&!(/margariinilevy/.test(x)&&/lehteva taikina/.test(n(r.notes))));
  const an=C.analyze(r.ingredients.filter(i=>!i.head).map(i=>i.name).join(', ')+'\n'+r.steps.join('\n'),{category:'food'});
  const animal=[...an.animal,...an.aid].map(g=>g.e.id+':'+g.hits.join('/'));
  const fiInEn=en?r.ingredients.filter(i=>!i.head&&/[äöå]|\b(tai|ja|liotettuja|soseutettuna|kotitekoista|keitettyjä)\b/i.test(i.name)).map(i=>i.name):[];
  if(animal.length)(bad[k]=bad[k]||[]).push(hd.split('|')[0].trim()+': ELÄINPERÄISTÄ '+animal.join(', '));
  if(fiInEn.length)(bad[k]=bad[k]||[]).push(hd.split('|')[0].trim()+': SUOMEA '+fiInEn.join(' | '));
  if(hits.length||sh.length)(bad[k]=bad[k]||[]).push(hd.split('|')[0].trim()+': '+hits.map(x=>x.trim()).join(' | ')+(sh.length?' || VAIHE: '+sh[0].trim().slice(0,90):''));
 });}));
let fails=0;
Object.keys(BAN).forEach(k=>{const b=bad[k]||[];fails+=b.length;console.log(`== ${k}: ${tot[k]-b.length}/${tot[k]} kunnossa`);b.slice(0,process.argv[2]?99:8).forEach(x=>console.log('  '+x.slice(0,230)))});
console.log(fails?'\nVIKOJA: '+fails:'\nKaikki rajaukset kunnossa.');
/* Yhdistelmät: useampi rajaus yhtä aikaa ei saa jättää eläinperäistä eikä kaatua */
let combo = 0, comboBad = 0;
files.forEach(f => fs.readFileSync(f, 'utf8').split(/^### /m).slice(1).forEach(b => {
  const [hd, ...rest] = b.split('\n'); const t = rest.join('\n').trim(); const en = RR.isEnglish(t); const p = C.buildParsed(C.classify(t, '', [], { noTitle: true }));
  [['sokeriton', 'gluteeniton', 'rasvaton'], ['wholefood', 'pahkinaton', 'soijaton'], ['wholefood', 'sokeriton', 'oljyton', 'vehnaton'], ['wholefood', 'pahkinaton', 'soijaton', 'gluteeniton', 'sokeriton', 'rasvaton']].forEach(R => {
    combo++;
    try { const r = C.convertParsed(p, t, R, [], { lang: en ? 'en' : 'fi' }); const a = C.analyze(r.ingredients.filter(i => !i.head).map(i => i.name).join(', ') + '\n' + r.steps.join('\n'), { category: 'food' }); if (a.animal.length + a.aid.length) { comboBad++; console.log('  ' + hd.split('|')[0].trim() + ' ' + R.join('+') + ': ' + [...a.animal, ...a.aid].map(g => g.hits).join(', ')); } }
    catch (e) { comboBad++; console.log('  VIRHE ' + hd + ' ' + R + ': ' + e.message); }
  });
}));
console.log(`Yhdistelmät: ${combo - comboBad}/${combo} kunnossa`);
