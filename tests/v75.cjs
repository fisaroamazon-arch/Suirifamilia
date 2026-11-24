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
 w.__audioGraphs=0;w.AudioContext=class {constructor(){this.state='running';this.currentTime=0;this.destination={};}resume(){this.state='running';return Promise.resolve();}close(){return Promise.resolve();}createOscillator(){return {frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(){}},connect(){},start(){},stop(){}};}createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){},linearRampToValueAtTime(){}},connect(){}};}createMediaElementSource(){w.__audioGraphs++;return {connect(){}};}createAnalyser(){return {frequencyBinCount:128,connect(){},getByteFrequencyData(data){data.fill(128);}};}};
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
 w.localStorage.setItem('suiri:v72:apoio:'+w.perfilAtual.id,String(Date.now()));w.localStorage.setItem('suiri:pense:v73:'+w.perfilAtual.id,w.Suiri.today());d.querySelectorAll('.modal-overlay').forEach(x=>x.classList.add('oculto'));
 await test('tema escuro é opcional e foto abre troca sem logout',()=>{
  assert.equal(d.documentElement.dataset.theme,'light');w.Suiri.theme.set('escuro');assert.equal(d.documentElement.dataset.theme,'dark');assert(d.getElementById('suiri-config-tema'));assert(!d.getElementById('menu-tema-avatar'));assert(d.querySelector('.avatar-trocar-label').textContent.includes('Trocar'));
  const id=w.perfilAtual.id;d.querySelector('.perfil-hero-info').click();assert(!d.getElementById('modal-janela-quiosque').classList.contains('oculto'));assert.equal(w.perfilAtual.id,id);w.fecharJanelaPrincipalQuiosque();
 });
 await test('recorte permite zoom e rotação sem expor área vazia; cancelar não grava',async()=>{
  const id=w.perfilAtual.id;w.abrirModalEditarFamiliar(id);assert(d.getElementById('edit-familiar-foto-preview'));assert(d.getElementById('input-upload-avatar-membro'));
  const before=w.__calls.filter(x=>x.table==='membros'&&x.op==='update').length;
  w.SuiriCrop.carregarImagem({width:800,height:400},id);let state=w.SuiriCrop.estado();assert.equal(state.zoom,1);assert.equal(state.base,.8);assert.equal(state.x,-160);assert.equal(state.y,0);
  w.SuiriCrop.zoom(20);state=w.SuiriCrop.estado();assert.equal(state.zoom,4);assert(state.x<=0&&state.x>=320-state.width*state.base*state.zoom);assert(state.y<=0&&state.y>=320-state.height*state.base*state.zoom);
  w.girarFotoCrop();state=w.SuiriCrop.estado();assert.equal(state.width,400);assert.equal(state.height,800);assert.equal(state.zoom,1);w.centralizarFotoCrop();state=w.SuiriCrop.estado();assert.equal(state.width,800);
  w.fecharModalCrop();await w.confirmarCropImagem();assert.equal(w.__calls.filter(x=>x.table==='membros'&&x.op==='update').length,before);
 });
 await test('falha ao salvar mantém recorte aberto; confirmação grava o membro correto',async()=>{
  const id=w.perfilAtual.id;w.SuiriCrop.carregarImagem({width:640,height:480},id);w.__failWrites=true;await w.confirmarCropImagem();assert(!d.getElementById('modal-crop-imagem').classList.contains('oculto'));assert(d.getElementById('crop-status').textContent.includes('Recusa'));
  w.__failWrites=false;await w.confirmarCropImagem();assert(d.getElementById('modal-crop-imagem').classList.contains('oculto'));assert(w.perfilAtual.avatar_url.startsWith('data:image/'));
  const child=w.__tables.membros.find(x=>x.papel==='dependente');child.familia_id=fam;w.SuiriCrop.carregarImagem({width:640,height:480},child.id);await w.confirmarCropImagem();const call=w.__calls.filter(x=>x.table==='membros'&&x.op==='update').at(-1);assert(call.filters.some(([key,value])=>key==='id'&&value===child.id));assert(call.filters.some(([key,value])=>key==='familia_id'&&value===fam));
 });main.dom.window.close();
 for(const page of ['homem.html','mulher.html']){
  const loaded=await load(page),a=loaded.w,doc=a.document,engine=page==='homem.html'?a.PlayerHomem:a.PlayerMulher;
  await test(page+': foto do usuário no cabeçalho e controles compactos preservados',()=>{
   a.perfilAtual.avatar_url='data:image/jpeg;base64,YXZhdGFy';(page==='homem.html'?a.renderizarEsqueletoEspacoMasculino:a.renderizarEsqueletoEspacoMulher)();assert.equal(doc.querySelector('.avatar-espaco-pessoal').getAttribute('src'),a.perfilAtual.avatar_url);assert(!doc.querySelector('.player-capa'));assert(doc.getElementById('suiri-audio-visualizer'));assert(doc.getElementById('suiri-player-extras').classList.contains('oculto'));
   if(page==='homem.html'){a.escolherEstiloMasculino('playstation');assert.equal(doc.documentElement.dataset.console,'playstation');assert.equal(doc.documentElement.dataset.theme,'light');a.escolherEstiloMasculino('xbox');assert.equal(doc.documentElement.dataset.console,'xbox');}
   else {assert(doc.querySelector('[data-women-choice="normal"]').textContent.includes('Tradicional'));a.escolherModoMulherSuiri('foco');assert.equal(doc.documentElement.dataset.womenMode,'foco');assert.equal(doc.documentElement.dataset.theme,'light');assert(doc.querySelector('#video-cenario-fundo source').src.includes('flores-ida-volta-original.mp4'));}
  });
  await test(page+': visualizador usa análise de áudio e pausa sem simulação de batidas',async()=>{
   assert.equal(await a.SuiriAudioViz.ativar(),true);assert.equal(a.__audioGraphs,1);await a.SuiriAudioViz.ativar();assert.equal(a.__audioGraphs,1);engine.audio.paused=false;a.SuiriAudioViz.desenhar();assert.equal(doc.getElementById('suiri-audio-visualizer').dataset.state,'ativo');engine.audio.paused=true;a.SuiriAudioViz.desenhar();assert.equal(doc.getElementById('suiri-audio-visualizer').dataset.state,'pausado');
  });loaded.dom.window.close();
 }
 console.log(JSON.stringify({v75:checks},null,2));fs.writeFileSync('.test-results/v75.json',JSON.stringify({engine:'DOM, imagens/canvas, Web Audio e Supabase simulados; vídeo validado separadamente',checks},null,2));
})().catch(e=>{console.error(e.stack);process.exit(1)});
