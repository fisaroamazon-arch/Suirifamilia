const {JSDOM,ResourceLoader,VirtualConsole}=require('jsdom');
const {IDBFactory}=require('fake-indexeddb');
const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve('.');
const uid='10000000-0000-4000-8000-000000000001',fam='20000000-0000-4000-8000-000000000001';
const checks=[],pages=[];
function setup(w,logged=true){
 w.__calls=[];w.__errors=[];w.__failWrites=false;w.__toasts=[];
 w.indexedDB=new IDBFactory();w.structuredClone=structuredClone;
 w.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
 w.scrollTo=()=>{};w.confirm=()=>true;w.alert=()=>{};
 w.URL.createObjectURL=()=> 'blob:synthetic';w.URL.revokeObjectURL=()=>{};
 Object.defineProperty(w.crypto,'randomUUID',{value:()=>crypto.randomUUID()});
 Object.defineProperty(w.navigator,'serviceWorker',{value:{register:async()=>({scope:'http://suiri.test/',update:async()=>{}}),getRegistrations:async()=>[]}});
 w.HTMLCanvasElement.prototype.getContext=()=>new Proxy({measureText:()=>({width:10}),createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}})},{get:(t,k)=>t[k]||(()=>{})});
 w.HTMLCanvasElement.prototype.toDataURL=()=> 'data:image/jpeg;base64,ZmFrZQ==';
 w.HTMLMediaElement.prototype.load=function(){};w.HTMLMediaElement.prototype.play=function(){return Promise.resolve()};w.HTMLMediaElement.prototype.pause=function(){};
 w.Audio=class extends w.EventTarget{constructor(){super();this.paused=true;this.duration=200;this.currentTime=0;}load(){}pause(){this.paused=true;}play(){this.paused=false;return Promise.resolve();}};
 w.__user={id:uid,email:'teste@example.invalid',user_metadata:{}};
 w.__tables={membros:[{id:uid,familia_id:fam,nome:'Teste Adulto',email:'teste@example.invalid',papel:'adm',genero:'feminino',sexo:'feminino',possui_cartao:true,eh_kids:false,xp_total:100,permissoes:{mercado:true,gastos:true,missoes:true}},{id:'10000000-0000-4000-8000-000000000003',familia_id:fam,nome:'Teste Kids',papel:'dependente',eh_kids:true,xp_total:20}],familias:[{id:fam,nome_familia:'Lar de Teste'}]};
 const from=table=>{
  const state={table,op:'select',filters:[],payload:null,single:false,returning:false};
  const builder=new Proxy(state,{get(t,k){
   if(k==='then')return(a,b)=>Promise.resolve().then(()=>{
    w.__calls.push(JSON.parse(JSON.stringify(state)));
    if(state.op!=='select'&&w.__failWrites)return {data:null,error:{message:'Recusa sintética de gravação',code:'42501'}};
    let rows=(w.__tables[table]||[]).filter(row=>state.filters.every(([key,v])=>String(row[key])===String(v)));
    if(state.op==='update'){rows.forEach(row=>Object.assign(row,state.payload));}
    if(state.op==='insert'||state.op==='upsert'){rows=(Array.isArray(state.payload)?state.payload:[state.payload]).map(x=>({id:crypto.randomUUID(),...x}));w.__tables[table]||=[];w.__tables[table].push(...rows);}
    if(state.op==='delete')w.__tables[table]=(w.__tables[table]||[]).filter(row=>!rows.includes(row));
    const data=state.single?(rows[0]||null):rows;return {data,error:null};
   }).then(a,b);
   return(...args)=>{if(['insert','update','upsert','delete'].includes(k)){state.op=k;state.payload=args[0];}if(k==='eq')state.filters.push(args);if(k==='select')state.returning=true;if(k==='single'||k==='maybeSingle')state.single=true;return builder;};
  }});return builder;
 };
 const cli={from,auth:{getSession:async()=>({data:{session:logged?{user:w.__user}:null},error:null}),onAuthStateChange:fn=>{w.__authEvent=fn;return {data:{subscription:{unsubscribe(){}}}}},signInWithPassword:async()=>({data:{user:w.__user},error:null}),signOut:async()=>({error:null}),resetPasswordForEmail:async()=>({data:{},error:null}),updateUser:async()=>({data:{user:w.__user},error:null}),signUp:async()=>({data:{user:{id:crypto.randomUUID()},session:{}},error:null})},
  rpc:async(name,args)=>{w.__calls.push({rpc:name,args});if(name==='suiri_extrato_v7')return {data:[],error:null};return {data:null,error:{message:'RPC de teste indisponível',code:'PGRST202'}};},functions:{invoke:async()=>({data:null,error:{message:'não implantada'}})},channel:name=>{w.__calls.push({channel:name});return {on(){return this},subscribe(){return this}}},removeChannel:()=>w.__calls.push({removeChannel:true})};
 w.supabase={createClient:()=>cli};
 w.Chart=class{constructor(){}destroy(){}update(){}toBase64Image(){return ''}};
 w.__cli=cli;
}
class Resources extends ResourceLoader{fetch(url){const u=new URL(url);if(u.hostname!=='suiri.test')return Promise.resolve(Buffer.from(''));if(u.pathname.includes('/vendor/'))return Promise.resolve(Buffer.from(''));const filename=path.join(root,u.pathname);try{return Promise.resolve(fs.readFileSync(filename))}catch{return null}}}
async function load(name,logged=true){
 const errors=[],vc=new VirtualConsole();vc.on('jsdomError',e=>{if(!/Could not parse CSS|Not implemented: navigation/.test(e.message))errors.push(e.message)});
 const dom=new JSDOM(fs.readFileSync(path.join(root,name),'utf8'),{url:'http://suiri.test/'+name,runScripts:'dangerously',resources:new Resources(),pretendToBeVisual:true,virtualConsole:vc,beforeParse:w=>setup(w,logged)});
 await new Promise(resolve=>dom.window.addEventListener('load',resolve,{once:true}));
 await new Promise(r=>setTimeout(r,600));
 return {dom,w:dom.window,errors};
}
async function test(name,fn){await fn();checks.push({name,passed:true});}
(async()=>{
 const main=await load('index.html'),w=main.w,d=w.document;
 w.localStorage.setItem('suiri:v72:apoio:'+w.perfilAtual.id,String(Date.now()));w.localStorage.setItem('suiri:pense:v73:'+w.perfilAtual.id,w.Suiri.today());d.querySelectorAll('.modal-overlay').forEach(el=>el.classList.add('oculto'));
 await test('os botões Todas/Minhas mudam a lista e indicam a seleção e as contagens',async()=>{
  const base={familia_id:fam,criado_por:uid,status:'pendente',prioridade:1,icone:'⭐',xp_recompensa:10,recorrencia_tipo:'unica',concluidos_por_array:[],falhados_por_array:[],subitens:[]};
  w.__tables.missoes=[{...base,id:'a',titulo:'Coletiva do lar',escopo:'casa',atribuido_a:null},{...base,id:'b',titulo:'Individual minha',escopo:'pessoal',atribuido_a:uid}];await w.carregarMissoesDoDia();
  d.getElementById('btn-filtro-missao-minhas').click();assert(d.getElementById('lista-missoes-dia').textContent.includes('Individual minha'));assert(!d.getElementById('lista-missoes-dia').textContent.includes('Coletiva do lar'));assert.equal(d.getElementById('btn-filtro-missao-minhas').getAttribute('aria-pressed'),'true');assert(d.getElementById('btn-filtro-missao-minhas').textContent.includes('(1)'));
  d.getElementById('btn-filtro-missao-todas').click();assert(d.getElementById('lista-missoes-dia').textContent.includes('Coletiva do lar'));assert(d.getElementById('btn-filtro-missao-todas').textContent.includes('(2)'));assert.equal(d.getElementById('btn-filtro-missao-todas').getAttribute('aria-pressed'),'true');
  d.querySelector('button[onclick="window.abrirModalSugestoes()"]').click();assert(!d.getElementById('modal-sugestoes-missoes').classList.contains('oculto'));w.fecharModalSugestoes();
  const pin=d.getElementById('pin-widget-missoes');if(pin){pin.click();assert(w.meusAlfinetes.some(x=>x.origem==='secao-inicio'));}
 });
 await test('ícones funcionais usam os novos SVGs e a marca permanece',()=>{
  assert(d.querySelectorAll('img[src*="assets/icons-modern/"]').length>10);assert(d.querySelector('img[src*="logo_suiri.png"]'));assert(d.querySelectorAll('img[src*="assets/icons/"]:not([src*="logo_suiri"])').length===0);
  const css=fs.readFileSync('styles/visual-v74.css','utf8');assert(css.includes('.total-mercado-fixo :is(span,strong)'));assert(css.includes('#valor-total-carrinho-mercado'));
 });main.dom.window.close();
 const female=await load('mulher.html'),f=female.w,fd=f.document;
 await test('Normal mantém o vídeo; Foco pausa e a escolha fica isolada por membro',()=>{
  const video=fd.getElementById('video-cenario-fundo');let played=0,paused=0;video.play=()=>{played++;return Promise.resolve();};video.pause=()=>paused++;
  fd.querySelector('[data-women-choice="foco"]').click();assert.equal(fd.documentElement.dataset.womenMode,'foco');assert(paused>0);assert.equal(fd.querySelector('[data-women-choice="foco"]').getAttribute('aria-pressed'),'true');
  const id=f.perfilAtual.id;assert.equal(f.localStorage.getItem('suiri:v74:mulher-modo:'+id),'foco');f.perfilAtual.id='outro-perfil';f.aplicarModoMulherSuiri();assert.equal(fd.documentElement.dataset.womenMode,'normal');assert(played>0);f.perfilAtual.id=id;f.aplicarModoMulherSuiri();assert.equal(fd.documentElement.dataset.womenMode,'foco');
  fd.querySelector('[data-women-choice="normal"]').click();assert.equal(fd.documentElement.dataset.womenMode,'normal');assert(video.loop);
 });
 async function playerTest(p,dom){
  const doc=dom.document,engine=doc.querySelector('.container-mulher')?dom.PlayerMulher:dom.PlayerHomem,root=doc.getElementById('player-suiri');
  assert(root);assert(doc.querySelector('.player-visualizer'));assert.equal(root.querySelectorAll('.player-controles button').length,6);
  const toggle=root.querySelector('[data-player-action="toggle"]');toggle.click();await new Promise(r=>setTimeout(r,5));assert(!engine.audio.paused);toggle.click();assert(engine.audio.paused);
  const seek=doc.getElementById('suiri-player-seek');engine.audio.duration=200;engine.audio.dispatchEvent(new dom.Event('loadedmetadata'));assert(!seek.disabled);seek.value='500';seek.dispatchEvent(new dom.Event('input',{bubbles:true}));assert.equal(engine.audio.currentTime,100);
  root.querySelector('[data-player-action="details"]').click();assert(!doc.getElementById('suiri-player-extras').classList.contains('oculto'));const vol=doc.getElementById('suiri-player-volume');vol.value='37';vol.dispatchEvent(new dom.Event('input',{bubbles:true}));assert.equal(engine.audio.volume,.37);assert.equal(dom.Suiri.storage.getItem('suiri_player_volume'),'0.37');
  root.querySelector('[data-player-action="favorite"]').click();const track=engine.obterCatalogo()[engine.indiceAtual];assert(engine.favoritas.includes(track.arquivo));assert.equal(root.querySelector('[data-player-action="favorite"]').getAttribute('aria-pressed'),'true');
  root.querySelector('[data-player-action="queue"]').click();assert(!doc.getElementById('suiri-player-queue').classList.contains('oculto'));assert(doc.querySelectorAll('.player-faixa').length>1);
  root.querySelector('[data-player-action="only-favorites"]').click();assert(engine.soFavoritas);assert.equal(doc.querySelectorAll('.player-faixa').length,1);
  root.querySelector('[data-player-action="only-favorites"]').click();engine.modoAleatorio=false;const index=engine.indiceAtual;root.querySelector('[data-player-action="next"]').click();assert.notEqual(engine.indiceAtual,index);
  const current=engine.indiceAtual;engine.audio.dispatchEvent(new dom.Event('error'));assert.equal(engine.indiceAtual,current);assert(doc.getElementById('suiri-player-status').textContent.includes('Não foi possível'));
 }
 await test('player feminino: play/pausa, avanço, posição, volume, favoritas e erro limitado',()=>playerTest('f',f));female.dom.window.close();
 const male=await load('homem.html'),m=male.w;
 await test('player masculino: play/pausa, avanço, posição, volume, favoritas e erro limitado',()=>playerTest('m',m));male.dom.window.close();
 console.log(JSON.stringify({v74:checks},null,2));fs.writeFileSync('.test-results/v74.json',JSON.stringify({engine:'DOM simulado; áudio simulado, sem comprovar saída sonora real',checks},null,2));
})().catch(e=>{console.error(e.stack);process.exit(1)});
