const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const root=process.cwd(),errors=[];let units=0,refs=0;
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.name==='node_modules'||x.name==='.test-results'?[]:x.isDirectory()?walk(path.join(dir,x.name)):[path.join(dir,x.name)]);
const check=(ref,base)=>{if(!ref||/^(https?:|data:|blob:|#)/.test(ref)||ref.includes('${'))return;assert(fs.statSync(path.resolve(base,ref.split('?')[0].split('#')[0])).isFile(),ref);refs++;};
for(const file of walk(root)){
 if(file.endsWith('.js')){new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});units++;}
 if(file.endsWith('.css'))for(const m of fs.readFileSync(file,'utf8').matchAll(/url\(['"]?([^'")]+)/g))check(m[1],path.dirname(file));
}
for(const name of ['index.html','mulher.html','homem.html','jogos.html']){
 const dom=new JSDOM(fs.readFileSync(path.join(root,name),'utf8')),doc=dom.window.document;
 const ids=[...doc.querySelectorAll('[id]')].map(x=>x.id);assert.equal(ids.length,new Set(ids).size,name+' tem IDs duplicados');
 for(const script of doc.scripts){if(script.src)check(script.getAttribute('src'),root);else{new vm.Script(script.textContent,{filename:name});units++;}}
 for(const el of doc.querySelectorAll('link[href],img[src],video[src],source[src]'))check(el.getAttribute('src')||el.getAttribute('href'),root);
 dom.window.close();
}
for(const item of JSON.parse(fs.readFileSync('tests/media-hashes.json'))){assert.equal(crypto.createHash('sha256').update(fs.readFileSync(item.path)).digest('hex'),item.sha256,item.path+' foi alterado');}
const {stripTypeScriptTypes}=require('node:module');
const typed=fs.readFileSync('supabase/functions/suiri-ia/index.ts','utf8');
const plain=stripTypeScriptTypes(typed,{mode:'strip'});
fs.mkdirSync('.test-results',{recursive:true});fs.writeFileSync('.test-results/edge-function.mjs',plain);
const result=require('child_process').spawnSync(process.execPath,['--check','.test-results/edge-function.mjs'],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
console.log(JSON.stringify({static:true,javascript_units:units,local_references:refs,original_media:125,edge_function_syntax:true}));
