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
 await test('três atalhos pertencem ao cabeçalho e troca aparece uma única vez sob a foto',()=>{
  const header=d.getElementById('cabecalho-topo-usuario');assert.equal(header.querySelectorAll('.usuario-card-atalhos button').length,3);assert.equal(header.querySelectorAll('.avatar-trocar-label').length,1);assert.equal(header.querySelector('.avatar-trocar-label').textContent,'Trocar usuário');assert.equal(header.querySelectorAll('button[aria-label="Trocar usuário"]').length,1);assert(header.querySelector('.usuario-card-foto #btn-sino-notificacoes-topo'));assert.equal(header.querySelector('.header-logo-container span').textContent,'FAMÍLIA');
 });
 await test('Pense abre painel; tocar no conteúdo não fecha, tocar no fundo fecha',()=>{
  d.querySelector('.usuario-card-atalhos button').click();const modal=d.getElementById('modal-pilula-dia');assert(!modal.classList.contains('oculto'));modal.firstElementChild.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));assert(!modal.classList.contains('oculto'));modal.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));assert(modal.classList.contains('oculto'));
 });
 await test('arrastar a alça fecha; gesto horizontal e cancelado mantêm aberto',()=>{
  const modal=d.getElementById('modal-pilula-dia'),panel=modal.firstElementChild,handle=panel.querySelector('.sheet-drag-handle');assert(handle);
  const point=(name,x,y)=>handle.dispatchEvent(new w.MouseEvent(name,{bubbles:true,cancelable:true,clientX:x,clientY:y}));
  w.Suiri.openModal(modal.id);point('pointerdown',10,20);point('pointermove',15,110);assert.equal(panel.style.getPropertyValue('--sheet-drag'),'90px');point('pointerup',15,110);assert(modal.classList.contains('oculto'));
  w.Suiri.openModal(modal.id);point('pointerdown',10,20);point('pointermove',120,100);point('pointerup',120,100);assert(!modal.classList.contains('oculto'));
  point('pointerdown',10,20);point('pointermove',15,110);point('pointercancel',15,110);assert(!modal.classList.contains('oculto'));assert.equal(panel.style.getPropertyValue('--sheet-drag'),'');w.Suiri.closeModal(modal.id);
 });
 await test('confirmação fechada pelo fundo resolve como cancelamento',async()=>{
  const decision=w.confirmarAcaoSuiri('Teste sem gravação');await new Promise(r=>setTimeout(r,20));const modal=d.getElementById('modal-confirmacao-nativo-suiri');assert(modal.querySelector('.sheet-drag-handle'));modal.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));assert.equal(await decision,false);
 });
 await test('painel criado e recriado depois do carregamento recebe gestos',async()=>{
  const modal=d.createElement('div');modal.id='modal-dinamico-teste';modal.className='modal-overlay';modal.innerHTML='<div class="modal-conteudo"><p>Teste</p></div>';d.body.append(modal);await new Promise(r=>setTimeout(r,10));assert.equal(modal.querySelectorAll('.sheet-drag-handle').length,1);modal.innerHTML='<div class="modal-conteudo"><p>Outro painel</p></div>';await new Promise(r=>setTimeout(r,10));assert.equal(modal.querySelectorAll('.sheet-drag-handle').length,1);modal.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));assert(modal.classList.contains('oculto'));modal.remove();
 });
 assert.deepEqual(main.errors,[]);main.dom.window.close();
 const loaded=await load('mulher.html'),a=loaded.w,doc=a.document;
 a.renderizarEsqueletoEspacoMulher();await new Promise(r=>setTimeout(r,30));
 await test('quatro atalhos compactos têm ações existentes; ciclo abre registro',()=>{
  const shortcuts=doc.querySelectorAll('.atalhos-mulher-compactos button');assert.equal(shortcuts.length,4);assert.deepEqual([...shortcuts].map(x=>x.textContent.trim()),['Diário','Ciclo','Minuto Zen','Alívio']);for(const btn of shortcuts){const name=btn.getAttribute('onclick').match(/window\.(\w+)/)[1];assert.equal(typeof a[name],'function',name);}shortcuts[1].click();assert(!doc.getElementById('modal-registro-ciclo-mulher').classList.contains('oculto'));
 });
 await test('quatro fases exibem inverno, primavera, verão e outono e selecionam a fase correta',()=>{
  const seasons=['Inverno','Primavera','Verão','Outono'];
  for(let i=1;i<=4;i++){const legend=doc.getElementById('marco-estagio-'+i);assert(legend.querySelector('.season-symbol svg'));assert(legend.getAttribute('aria-label').includes(seasons[i-1]));legend.click();const modal=doc.getElementById('modal-orientacoes-estagio-fase');assert(!modal.classList.contains('oculto'));assert(modal.querySelector('.fase-sheet.suiri-sheet'));assert(modal.querySelector('.sheet-drag-handle'));const btn=doc.getElementById('btn-modal-fase-'+i);assert(btn.querySelector('svg'));assert.equal(btn.getAttribute('aria-pressed'),'true');assert(btn.getAttribute('aria-label').includes(seasons[i-1]));assert(doc.getElementById('modal-fase-emoji').querySelector('svg'));}
  doc.getElementById('btn-modal-topico-fertilidade').click();assert.equal(doc.getElementById('btn-modal-topico-fertilidade').getAttribute('aria-pressed'),'true');assert.equal(doc.getElementById('btn-modal-topico-geral').getAttribute('aria-pressed'),'false');
 });
 await test('painel das fases fecha por gesto e mantém abas e rodapé na estrutura',()=>{
  const modal=doc.getElementById('modal-orientacoes-estagio-fase'),handle=modal.querySelector('.sheet-drag-handle');assert.equal(modal.querySelector('.phase-tabs').children.length,4);assert.equal(modal.querySelector('.phase-topics').children.length,4);assert(modal.querySelector('#modal-conteudo-orientacoes-corpo'));assert.equal(modal.firstElementChild.lastElementChild.querySelector('button').textContent,'Entendido');handle.dispatchEvent(new a.MouseEvent('pointerdown',{bubbles:true,clientX:20,clientY:30}));handle.dispatchEvent(new a.MouseEvent('pointerup',{bubbles:true,clientX:20,clientY:140}));assert(modal.classList.contains('oculto'));
 });
 await test('modo foco preservado e vídeo usa somente sequência de quadros originais',()=>{
  a.escolherModoMulherSuiri('foco');assert.equal(doc.documentElement.dataset.womenMode,'foco');a.escolherModoMulherSuiri('normal');assert.equal(doc.documentElement.dataset.womenMode,'normal');assert(doc.querySelector('#video-cenario-fundo source').src.includes('flores-ida-volta-original.mp4'));
 });
 await new Promise(r=>setTimeout(r,30));assert.deepEqual(loaded.errors,[]);loaded.dom.window.close();
 fs.writeFileSync('.test-results/v76.json',JSON.stringify({engine:'DOM, gestos e Supabase simulados; sem teste visual ou aparelho físico',checks},null,2));console.log(JSON.stringify({v76:checks},null,2));
})().catch(e=>{console.error(e.stack);process.exit(1)});
