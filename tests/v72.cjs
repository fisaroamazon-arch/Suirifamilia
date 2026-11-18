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
 const main=await load('index.html'),w=main.w,doc=w.document;w.localStorage.setItem('suiri:pense:v73:'+w.perfilAtual.id,w.Suiri.today());
 await test('somente o card correspondente ao gênero do perfil aparece, inclusive após alternar',()=>{
  for(const genero of ['masculino','feminino','']){w.perfilAtual.genero=genero;w.perfilAtual.sexo=genero;w.atualizarCartoesGeneroMeuEspaco();assert.equal(!doc.getElementById('card-acesso-espaco-masculino').classList.contains('oculto'),genero==='masculino');assert.equal(!doc.getElementById('card-acesso-espaco-mulher').classList.contains('oculto'),genero==='feminino');}
  w.perfilAtual.genero=w.perfilAtual.sexo='feminino';
 });
 await test('cartão pode ser carregado e alterado no editor',async()=>{
  const id=w.perfilAtual.id;w.abrirModalEditarFamiliar(id);assert(doc.getElementById('edit-familiar-cartao').checked);
  doc.getElementById('edit-familiar-cartao').checked=false;await w.salvarEdicaoFamiliar();assert.equal(w.perfilAtual.possui_cartao,false);
  w.abrirModalEditarFamiliar(id);assert(!doc.getElementById('edit-familiar-cartao').checked);doc.getElementById('edit-familiar-cartao').checked=true;await w.salvarEdicaoFamiliar();assert.equal(w.perfilAtual.possui_cartao,true);
  w.abrirModalNovoMembro();assert(!doc.getElementById('cad-familiar-cartao').checked);w.fecharModalNovoMembro();
 });
 await test('foto abre escolha de usuário sem mudar o perfil automaticamente',()=>{
  const id=w.perfilAtual.id;w.abrirMenuAvatarTopo({stopPropagation(){}});assert(!doc.getElementById('modal-janela-quiosque').classList.contains('oculto'));assert.equal(w.perfilAtual.id,id);w.fecharJanelaPrincipalQuiosque();
 });
 await test('menu da missão usa a mesma camada flutuante',()=>{
  const card=doc.createElement('div');card.style.overflow='hidden';card.innerHTML='<button onclick="window.alternarMenuAcoesMissao(\'v72\')">menu</button><div id="menu-drop-missao-v72" class="oculto"><button>Editar</button></div>';doc.body.append(card);
  w.alternarMenuAcoesMissao('v72');const menu=doc.getElementById('menu-drop-missao-v72');assert.equal(menu.parentElement,doc.body);assert.equal(menu.style.position,'fixed');w.suiriFecharMenuFlutuante();assert.equal(menu.parentElement,card);card.remove();
 });
 await test('convite de apoio espera modais fecharem e respeita sete dias por perfil',async()=>{
  w.abrirModalPilulaDia=()=>{};doc.querySelectorAll('.modal-overlay').forEach(el=>el.classList.add('oculto'));w.document.dispatchEvent(new w.CustomEvent('suiri:session-ready'));
  await new Promise(r=>setTimeout(r,1750));const modal=doc.getElementById('modal-apoio-semanal');assert(modal&&!modal.classList.contains('oculto'));
  const key='suiri:v72:apoio:'+w.perfilAtual.id;assert(Number(w.localStorage.getItem(key))>0);w.Suiri.closeModal(modal.id);
  w.document.dispatchEvent(new w.CustomEvent('suiri:session-ready'));await new Promise(r=>setTimeout(r,1750));assert(modal.classList.contains('oculto'));
  w.localStorage.setItem(key,String(Date.now()-8*86400000));w.document.dispatchEvent(new w.CustomEvent('suiri:session-ready'));await new Promise(r=>setTimeout(r,1750));assert(!modal.classList.contains('oculto'));
 });
 await test('365 datas cobertas e ano bissexto mantém março no lugar',()=>{
  const arr=w.AcervoReflexoesEstoicas365;assert.equal(arr.length,365);assert.equal(new Set(arr.map(r=>r.data)).size,365);
  for(let i=0;i<365;i++){const d=new w.Date(2025,0,1+i);assert.equal(w.obterReflexaoEstoicaDoDia(d),arr[i]);}
  assert.equal(w.obterReflexaoEstoicaDoDia(new w.Date(2028,1,29)).data,'28 de fevereiro');assert.equal(w.obterReflexaoEstoicaDoDia(new w.Date(2028,2,1)).data,'1 de março');
 });
 main.dom.window.close();
 const fem=await load('mulher.html'),fw=fem.w;
 await test('barra do ciclo avança com o dia, mantém quatro fases e limita atraso',()=>{
  fw.renderizarEsqueletoEspacoMulher();
  for(const [day,pct,stage] of [[1,100/28,1],[6,600/28,2],[14,50,3],[28,100,4],[32,100,4]]){
   fw.renderizarRoteiroEstagiosCiclo(day,28,5,true);
   assert(Math.abs(parseFloat(fw.document.getElementById('linha-progresso-estagios').style.width)-pct)<0.01);
   assert.equal(fw.document.querySelector('[aria-current="step"]').id,'marco-estagio-'+stage);
  }
  fw.renderizarRoteiroEstagiosCiclo(1,28,5,false);assert.equal(fw.document.getElementById('linha-progresso-estagios').style.width,'0%');
  assert.equal(fw.document.querySelectorAll('.legenda-fases-ciclo button').length,4);
 });
 fem.dom.window.close();
 const men=await load('homem.html'),mw=men.w;
 await test('arsenal diário é estável ao renderizar novamente e setores preservados',()=>{
  mw.renderizarEsqueletoEspacoMasculino();const text=mw.document.getElementById('texto-arsenal-pratico-conteudo').textContent;
  mw.renderizarEsqueletoEspacoMasculino();assert.equal(mw.document.getElementById('texto-arsenal-pratico-conteudo').textContent,text);assert(mw.document.querySelectorAll('.navegacao-espacos a').length>=7);
  mw.renderizarReflexaoEstoica(false);assert(mw.document.getElementById('texto-reflexao-estoica-conteudo').textContent.length>30);
 });
 men.dom.window.close();
 console.log(JSON.stringify({v72:checks},null,2));
 fs.writeFileSync('.test-results/v72.json',JSON.stringify({engine:'DOM simulado, sem navegador visual e sem banco real',checks},null,2));
})().catch(e=>{console.error(e.stack);process.exit(1)});
