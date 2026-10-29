#!/bin/bash
# bench.sh <pipeline> <outfile> [pattern]
cd "$(dirname "$0")"
ls -d cases/${3:-*}/ | xargs -P 8 -I{} node run.js $1 {} > $2 2>>err.log
node -e '
const r=require("fs").readFileSync(process.argv[1],"utf8").trim().split("\n").filter(Boolean).map(JSON.parse);
const by={};r.forEach(x=>{const k=x.case.split("_")[0];(by[k]=by[k]||[]).push(x)});
const f=a=>({n:a.length,rec:(a.reduce((s,x)=>s+x.rec,0)/a.length).toFixed(3),prec:(a.reduce((s,x)=>s+x.prec,0)/a.length).toFixed(3),missedIds:a.reduce((s,x)=>s+x.missed.length,0),extraIds:a.reduce((s,x)=>s+x.extra.length,0),verdictOk:a.filter(x=>x.verdictOk).length+"/"+a.length,ms:Math.round(a.reduce((s,x)=>s+x.ms,0)/a.length)});
const rows=Object.keys(by).sort().map(k=>Object.assign({kind:k},f(by[k])));rows.push(Object.assign({kind:"ALL"},f(r)));console.table(rows);
' $2
